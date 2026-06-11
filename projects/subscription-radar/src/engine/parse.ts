import Papa from "papaparse";
import { toHalfWidth } from "./normalize";
import type { Txn } from "./types";

/** Header keywords used to locate the real header row and map columns. */
const DATE_HEADERS = ["交易日期", "交易日", "日期", "帳務日", "DATE"];
const DESC_HEADERS = ["摘要", "備註", "說明", "描述", "交易資訊", "交易明細", "內容", "對方", "DESCRIPTION", "MEMO", "DETAILS", "NARRATIVE"];
const DEBIT_HEADERS = ["支出", "提款", "提出", "借方", "轉出", "支出金額", "提款金額", "WITHDRAWAL", "DEBIT"];
const CREDIT_HEADERS = ["存入", "存款", "貸方", "轉入", "存入金額", "存款金額", "DEPOSIT", "CREDIT"];
const AMOUNT_HEADERS = ["金額", "交易金額", "AMOUNT"];
const ALL_HEADER_HINTS = [...DATE_HEADERS, ...DESC_HEADERS, ...DEBIT_HEADERS, ...CREDIT_HEADERS, ...AMOUNT_HEADERS, "餘額", "BALANCE", "幣別"];

function headerMatches(cell: string, candidates: string[]): boolean {
  const c = toHalfWidth(cell).toUpperCase().replace(/\s/g, "");
  return candidates.some((h) => c.includes(h.toUpperCase()));
}

/**
 * Decode raw file bytes. Taiwanese bank exports are frequently Big5 (CP950),
 * sometimes UTF-16LE from Excel, and occasionally honest UTF-8.
 */
export function decodeBytes(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  // BOM checks
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(buf);
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(buf);
  }
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  if (!utf8.includes("�")) return utf8;
  // UTF-8 failed -> try Big5 (supported by TextDecoder in all major browsers)
  try {
    return new TextDecoder("big5").decode(buf);
  } catch {
    return utf8;
  }
}

/**
 * Parse a date that may be Gregorian or ROC (民國) calendar:
 * "2026/05/03", "115/05/03", "1150503", "20260503", "2026-05-03".
 * Returns ISO YYYY-MM-DD or null.
 */
export function parseDate(raw: string): string | null {
  const s = toHalfWidth(raw).trim().replace(/[年月]/g, "/").replace(/日/g, "");
  let y: number, m: number, d: number;

  let match = s.match(/^(\d{2,4})[/.-](\d{1,2})[/.-](\d{1,2})/);
  if (match) {
    y = parseInt(match[1], 10);
    m = parseInt(match[2], 10);
    d = parseInt(match[3], 10);
  } else if (/^\d{7}$/.test(s)) {
    // ROC compact: 1150503
    y = parseInt(s.slice(0, 3), 10);
    m = parseInt(s.slice(3, 5), 10);
    d = parseInt(s.slice(5, 7), 10);
  } else if (/^\d{8}$/.test(s)) {
    // Gregorian compact: 20260503
    y = parseInt(s.slice(0, 4), 10);
    m = parseInt(s.slice(4, 6), 10);
    d = parseInt(s.slice(6, 8), 10);
  } else {
    return null;
  }

  if (y < 1000) y += 1911; // ROC year
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Parse an NT$ amount: "1,234", "NT$390", "(500)" (negative), full-width digits. */
export function parseAmount(raw: string): number | null {
  let s = toHalfWidth(raw).trim();
  if (!s) return null;
  const negative = /^\(.*\)$/.test(s) || s.startsWith("-");
  s = s.replace(/[()NT$＄元,\s-]/gi, "");
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const v = parseFloat(s);
  if (v === 0) return null;
  return negative ? -v : v;
}

export interface ParseResult {
  txns: Txn[];
  skippedRows: number;
  /** Human-readable problems, e.g. couldn't find a header row */
  warnings: string[];
}

/**
 * Parse one bank CSV export into expense transactions.
 * Handles: preamble lines before the header, Big5/UTF-16 encodings (caller
 * decodes via decodeBytes), separate debit/credit columns or a single signed
 * amount column, ROC dates, full-width text.
 */
export function parseStatement(text: string, source: string): ParseResult {
  const warnings: string[] = [];
  const parsed = Papa.parse<string[]>(text.replace(/^﻿/, ""), {
    skipEmptyLines: "greedy",
  });
  const rows = (parsed.data as unknown as string[][]).filter((r) => Array.isArray(r));

  // Find the header row: first row where >=2 cells look like known headers
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const hits = rows[i].filter((cell) => headerMatches(cell, ALL_HEADER_HINTS)).length;
    if (hits >= 2) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    warnings.push(`${source}: couldn't find a header row — is this a transaction export?`);
    return { txns: [], skippedRows: rows.length, warnings };
  }

  const header = rows[headerIdx];
  const findCol = (candidates: string[]) => header.findIndex((c) => headerMatches(c, candidates));

  const dateCol = findCol(DATE_HEADERS);
  const debitCol = findCol(DEBIT_HEADERS);
  const creditCol = findCol(CREDIT_HEADERS);
  const amountCol = findCol(AMOUNT_HEADERS);
  const descCols = header
    .map((c, i) => (headerMatches(c, DESC_HEADERS) ? i : -1))
    .filter((i) => i >= 0);

  if (dateCol === -1 || (debitCol === -1 && amountCol === -1)) {
    warnings.push(`${source}: found a header row but couldn't identify date/amount columns.`);
    return { txns: [], skippedRows: rows.length, warnings };
  }
  if (descCols.length === 0) {
    warnings.push(`${source}: no description column found; using all text cells per row.`);
  }

  const txns: Txn[] = [];
  let skippedRows = 0;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const date = parseDate(row[dateCol] ?? "");
    if (!date) {
      skippedRows++;
      continue;
    }

    let amount: number | null = null;
    if (debitCol !== -1) {
      amount = parseAmount(row[debitCol] ?? "");
      // Row is a deposit, not an expense
      if (amount === null && creditCol !== -1 && parseAmount(row[creditCol] ?? "") !== null) {
        skippedRows++;
        continue;
      }
      if (amount !== null) amount = Math.abs(amount);
    } else if (amountCol !== -1) {
      const v = parseAmount(row[amountCol] ?? "");
      // Single signed column: negative = expense (most exports), but some
      // banks list expenses as positive. We keep negatives as expenses and,
      // if the file has no negatives at all, treat positives as expenses.
      amount = v === null ? null : v;
    }
    if (amount === null) {
      skippedRows++;
      continue;
    }

    const description = (
      descCols.length > 0
        ? descCols.map((c) => row[c] ?? "").join(" ")
        : row.filter((_, c) => c !== dateCol && parseAmount(row[c] ?? "") === null).join(" ")
    ).trim();

    txns.push({ date, description, amount, source });
  }

  // Resolve signed-column polarity: if every amount is positive, they're
  // expenses as-is; otherwise keep only the negatives (flipped positive).
  let result = txns;
  if (debitCol === -1 && amountCol !== -1) {
    const hasNegative = txns.some((t) => t.amount < 0);
    result = hasNegative
      ? txns.filter((t) => t.amount < 0).map((t) => ({ ...t, amount: -t.amount }))
      : txns;
  }

  return { txns: result, skippedRows, warnings };
}

/** Drop exact duplicates (same date+amount+description), e.g. re-imported files. */
export function dedupe(txns: Txn[]): Txn[] {
  const seen = new Set<string>();
  return txns.filter((t) => {
    const k = `${t.date}|${t.amount}|${t.description}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
