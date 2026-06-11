import { describe, expect, it } from "vitest";
import { merchantKey, toHalfWidth } from "./normalize";
import { dedupe, parseAmount, parseDate, parseStatement } from "./parse";
import { findRecurring, looksStopped } from "./recur";
import type { Txn } from "./types";

describe("normalize", () => {
  it("converts full-width text", () => {
    expect(toHalfWidth("ＮＥＴＦＬＩＸ　１２３")).toBe("NETFLIX 123");
  });

  it("groups varying references under one key", () => {
    const a = merchantKey("金融卡消費 NETFLIX.COM 0312 #4821");
    const b = merchantKey("金融卡消費 NETFLIX.COM 0412 #9930");
    expect(a).toBe(b);
    expect(a).toContain("NETFLIX");
  });

  it("keeps Chinese merchant names intact", () => {
    expect(merchantKey("自動扣款 中華電信 114/05")).toContain("中華電信");
  });
});

describe("parseDate", () => {
  it("parses Gregorian formats", () => {
    expect(parseDate("2026/05/03")).toBe("2026-05-03");
    expect(parseDate("2026-5-3")).toBe("2026-05-03");
    expect(parseDate("20260503")).toBe("2026-05-03");
  });

  it("parses ROC (民國) dates", () => {
    expect(parseDate("115/05/03")).toBe("2026-05-03");
    expect(parseDate("1150503")).toBe("2026-05-03");
    expect(parseDate("115年5月3日")).toBe("2026-05-03");
  });

  it("rejects junk", () => {
    expect(parseDate("合計")).toBeNull();
    expect(parseDate("")).toBeNull();
  });
});

describe("parseAmount", () => {
  it("handles separators and currency marks", () => {
    expect(parseAmount("1,234")).toBe(1234);
    expect(parseAmount("NT$390")).toBe(390);
    expect(parseAmount("３９０")).toBe(390);
    expect(parseAmount("(500)")).toBe(-500);
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("餘額")).toBeNull();
  });
});

describe("parseStatement", () => {
  const csv = [
    "合作金庫銀行 交易明細查詢",
    "查詢期間:115/03/01~115/06/01",
    "交易日期,摘要,提款金額,存款金額,餘額,備註",
    "115/03/05,金融卡消費 NETFLIX.COM,390,,50000,",
    "115/03/20,薪資轉帳,,80000,130000,ACME CORP",
    "115/04/05,金融卡消費 NETFLIX.COM,390,,129610,",
    "115/05/05,金融卡消費 NETFLIX.COM,390,,129220,",
  ].join("\n");

  it("skips preamble, maps Chinese columns, excludes deposits", () => {
    const { txns, warnings } = parseStatement(csv, "tcb.csv");
    expect(warnings).toHaveLength(0);
    expect(txns).toHaveLength(3);
    expect(txns[0]).toMatchObject({ date: "2026-03-05", amount: 390 });
    expect(txns[0].description).toContain("NETFLIX");
  });

  it("handles single signed amount columns", () => {
    const csv2 = [
      "交易日期,交易資訊,金額,餘額",
      "2026/03/05,SPOTIFY P1234,-149,9851",
      "2026/03/20,薪資,80000,89851",
    ].join("\n");
    const { txns } = parseStatement(csv2, "x.csv");
    expect(txns).toHaveLength(1);
    expect(txns[0].amount).toBe(149);
  });

  it("dedupes re-imported rows", () => {
    const { txns } = parseStatement(csv, "a.csv");
    const { txns: txns2 } = parseStatement(csv, "b.csv");
    expect(dedupe([...txns, ...txns2])).toHaveLength(3);
  });
});

function stream(desc: string, amount: number, dates: string[]): Txn[] {
  return dates.map((date) => ({ date, description: desc, amount, source: "t" }));
}

describe("findRecurring", () => {
  it("detects a monthly subscription in Chinese descriptions", () => {
    const txns = stream("自動扣款 KKBOX 月租", 149, ["2026-01-15", "2026-02-15", "2026-03-15", "2026-04-15"]);
    const groups = findRecurring(txns);
    expect(groups).toHaveLength(1);
    expect(groups[0].cadence).toBe("monthly");
    expect(groups[0].monthlyCost).toBe(149);
    expect(groups[0].merchant?.name).toBe("KKBOX");
  });

  it("splits one biller into separate amount streams (Apple case)", () => {
    const txns = [
      ...stream("APPLE.COM/BILL", 90, ["2026-01-03", "2026-02-03", "2026-03-03"]),
      ...stream("APPLE.COM/BILL", 390, ["2026-01-18", "2026-02-18", "2026-03-18"]),
    ];
    const groups = findRecurring(txns);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.typicalAmount).sort((a, b) => a - b)).toEqual([90, 390]);
    expect(groups[0].merchant?.id).toBe("apple");
  });

  it("ignores irregular spending at the same merchant", () => {
    const txns = [
      { date: "2026-01-03", description: "全聯福利中心", amount: 731, source: "t" },
      { date: "2026-01-11", description: "全聯福利中心", amount: 1240, source: "t" },
      { date: "2026-02-02", description: "全聯福利中心", amount: 412, source: "t" },
      { date: "2026-03-27", description: "全聯福利中心", amount: 988, source: "t" },
    ];
    expect(findRecurring(txns)).toHaveLength(0);
  });

  it("detects yearly renewals", () => {
    const txns = stream("GOOGLE *Google One", 650, ["2024-06-01", "2025-06-02", "2026-06-01"]);
    const groups = findRecurring(txns);
    expect(groups).toHaveLength(1);
    expect(groups[0].cadence).toBe("yearly");
    expect(groups[0].monthlyCost).toBe(Math.round(650 / 12));
  });

  it("requires matching amounts when there are only two occurrences", () => {
    const txns = [
      { date: "2026-01-05", description: "PCHOME 線上購物", amount: 1200, source: "t" },
      { date: "2026-02-04", description: "PCHOME 線上購物", amount: 3400, source: "t" },
    ];
    expect(findRecurring(txns)).toHaveLength(0);
  });

  it("flags streams that already stopped", () => {
    const txns = stream("NETFLIX.COM", 390, ["2025-09-05", "2025-10-05", "2025-11-05"]);
    const [g] = findRecurring(txns);
    expect(looksStopped(g, new Date("2026-06-11"))).toBe(true);
    expect(looksStopped(g, new Date("2025-11-20"))).toBe(false);
  });
});
