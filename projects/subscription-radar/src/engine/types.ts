export interface Txn {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Raw description from the statement (may be Chinese) */
  description: string;
  /** Expense amount in NT$, always positive. Deposits are excluded at parse time. */
  amount: number;
  /** Which file/bank this came from */
  source: string;
}

export type Cadence = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

export type CancelMethod = "link" | "apple" | "google" | "phone" | "in-person" | "bank";

export interface CancelPath {
  method: CancelMethod;
  url?: string;
  /** Human instructions, shown to the user */
  steps: string;
}

export interface MerchantInfo {
  id: string;
  /** English display name */
  name: string;
  category: "streaming" | "music" | "software" | "telecom" | "fitness" | "utility" | "insurance" | "shopping" | "other";
  /** True for things like electricity/water that recur but aren't really cancellable subscriptions */
  isBill?: boolean;
  cancel?: CancelPath;
  /** Substrings (matched against the normalized uppercase key) that identify this merchant */
  patterns: string[];
}

export interface RecurringGroup {
  /** Normalized merchant key */
  key: string;
  /** Representative raw description */
  sampleDescription: string;
  merchant?: MerchantInfo;
  txns: Txn[];
  cadence: Cadence;
  medianIntervalDays: number;
  typicalAmount: number;
  /** Estimated cost per month in NT$ */
  monthlyCost: number;
  lastDate: string;
  nextExpected: string;
  /** 0..1 */
  confidence: number;
}
