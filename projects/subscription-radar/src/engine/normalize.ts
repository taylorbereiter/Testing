/**
 * Convert full-width characters (common in Taiwanese bank exports) to half-width,
 * e.g. "ＮＥＴＦＬＩＸ" -> "NETFLIX", "１２３" -> "123".
 */
export function toHalfWidth(s: string): string {
  return s
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ");
}

/** Transaction-type boilerplate that banks prepend/append to descriptions. */
const NOISE_TOKENS = [
  "金融卡消費",
  "信用卡費",
  "卡片消費",
  "VISA金融卡",
  "金融卡",
  "跨行轉帳",
  "跨行",
  "轉帳支出",
  "自動扣款",
  "自動轉帳",
  "代扣",
  "委託轉帳",
  "國外交易",
  "消費扣款",
  "網路消費",
  "消費",
  "扣款",
  "手續費",
  "DEBIT CARD",
  "AUTOPAY",
  "EFT",
  "ACH",
];

/**
 * Reduce a raw statement description to a stable merchant key so that
 * "NETFLIX.COM 0312" and "NETFLIX.COM 0412" group together.
 * Works on Chinese and English text alike: we only strip dates, long digit
 * runs and known boilerplate; we never need to understand the words.
 */
export function merchantKey(rawDescription: string): string {
  let s = toHalfWidth(rawDescription).toUpperCase();

  // Dates in any common separator style: 2026/05/03, 114-05-03, 05.03
  s = s.replace(/\d{2,4}[/.-]\d{1,2}([/.-]\d{1,4})?/g, " ");
  // Phone numbers / reference numbers / card fragments: 4+ consecutive digits
  s = s.replace(/\d{4,}/g, " ");
  // Asterisk vendor separators: "GOOGLE *YOUTUBE" -> "GOOGLE YOUTUBE"
  s = s.replace(/\*/g, " ");

  for (const token of NOISE_TOKENS) {
    s = s.split(token.toUpperCase()).join(" ");
  }

  // Collapse punctuation that varies between months
  s = s.replace(/[#:;,，、()（）\[\]【】<>]/g, " ");
  s = s.replace(/\s+/g, " ").trim();

  // If stripping left nothing (e.g. description was just a date+ref), fall back
  // to the cleaned original so the row still groups by exact description.
  if (!s) {
    s = toHalfWidth(rawDescription).toUpperCase().replace(/\s+/g, " ").trim();
  }
  return s;
}
