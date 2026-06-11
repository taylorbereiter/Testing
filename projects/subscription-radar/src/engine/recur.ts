import { merchantKey } from "./normalize";
import { matchMerchant } from "./merchants";
import type { Cadence, RecurringGroup, Txn } from "./types";

const DAY_MS = 86400000;

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const CADENCES: { name: Cadence; min: number; max: number; perMonth: number }[] = [
  { name: "weekly", min: 6, max: 8, perMonth: 30 / 7 },
  { name: "biweekly", min: 12, max: 16, perMonth: 30 / 14 },
  { name: "monthly", min: 25, max: 36, perMonth: 1 },
  { name: "quarterly", min: 80, max: 100, perMonth: 1 / 3 },
  { name: "yearly", min: 330, max: 400, perMonth: 1 / 12 },
];

function matchCadence(intervalDays: number) {
  return CADENCES.find((c) => intervalDays >= c.min && intervalDays <= c.max);
}

/**
 * Cluster a merchant's transactions by amount, so one biller with several
 * underlying subscriptions (classic case: APPLE.COM/BILL carrying iCloud at
 * NT$90 and a game at NT$390) splits into separately-detected streams.
 * Amounts within 5% or NT$5 of a cluster's median join that cluster.
 */
export function clusterByAmount(txns: Txn[]): Txn[][] {
  const clusters: Txn[][] = [];
  for (const t of [...txns].sort((a, b) => a.amount - b.amount)) {
    const last = clusters[clusters.length - 1];
    if (last) {
      const m = median(last.map((x) => x.amount));
      if (Math.abs(t.amount - m) <= Math.max(5, m * 0.05)) {
        last.push(t);
        continue;
      }
    }
    clusters.push([t]);
  }
  return clusters;
}

/**
 * Detect a recurring stream within one merchant+amount cluster.
 * Returns null if the dates don't show a regular cadence.
 */
function detectStream(txns: Txn[]): Omit<RecurringGroup, "key" | "sampleDescription" | "merchant"> | null {
  if (txns.length < 2) return null;
  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date));
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const d = daysBetween(sorted[i - 1].date, sorted[i].date);
    if (d === 0) continue; // same-day double charge; treat as one occurrence for cadence
    intervals.push(d);
  }
  if (intervals.length === 0) return null;

  const med = median(intervals);
  const cadence = matchCadence(med);
  if (!cadence) return null;

  // Regularity: fraction of intervals that individually match the cadence
  const regular = intervals.filter((d) => matchCadence(d)?.name === cadence.name).length / intervals.length;
  if (regular < 0.6) return null;

  // With only 2 occurrences the evidence is thin: require near-identical amounts
  const amounts = sorted.map((t) => t.amount);
  const amtMed = median(amounts);
  if (sorted.length === 2 && Math.abs(amounts[0] - amounts[1]) > Math.max(2, amtMed * 0.02)) {
    return null;
  }

  let confidence = 0.4;
  confidence += Math.min(0.3, (sorted.length - 2) * 0.1); // more occurrences, more confidence
  confidence += 0.3 * regular;
  confidence = Math.min(1, confidence);

  const lastDate = sorted[sorted.length - 1].date;
  const next = new Date(Date.parse(lastDate) + med * DAY_MS);

  return {
    txns: sorted,
    cadence: cadence.name,
    medianIntervalDays: med,
    typicalAmount: amtMed,
    monthlyCost: Math.round(amtMed * cadence.perMonth),
    lastDate,
    nextExpected: next.toISOString().slice(0, 10),
    confidence,
  };
}

/**
 * Main entry: find recurring expense streams across all transactions.
 * Streams whose next expected charge is more than 2 cadence-lengths in the
 * past are kept but flagged by the UI as "possibly already cancelled".
 */
export function findRecurring(txns: Txn[]): RecurringGroup[] {
  const byKey = new Map<string, Txn[]>();
  for (const t of txns) {
    if (t.amount <= 0) continue;
    const key = merchantKey(t.description);
    const arr = byKey.get(key);
    if (arr) arr.push(t);
    else byKey.set(key, [t]);
  }

  const groups: RecurringGroup[] = [];
  for (const [key, keyTxns] of byKey) {
    for (const cluster of clusterByAmount(keyTxns)) {
      const stream = detectStream(cluster);
      if (!stream) continue;
      groups.push({
        key,
        sampleDescription: cluster[cluster.length - 1].description,
        merchant: matchMerchant(key),
        ...stream,
      });
    }
  }

  return groups.sort((a, b) => b.monthlyCost - a.monthlyCost);
}

/** True if the stream seems to have stopped (no charge for >2 expected intervals). */
export function looksStopped(g: RecurringGroup, today = new Date()): boolean {
  const overdue = (today.getTime() - Date.parse(g.lastDate)) / DAY_MS;
  return overdue > g.medianIntervalDays * 2.2;
}
