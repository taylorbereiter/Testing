// The learning core. Given an active eval set, search the tuning space for the
// configuration that best satisfies it. This is coordinate hill-climbing with
// random restarts of single parameters — simple, deterministic, and a faithful
// "learn from what works and what doesn't": keep changes that raise the score,
// discard the rest.

import { buildContext } from "../evals/context.js";

// Tunable parameters: [path, min, max]. Ordering constraints are enforced after
// each perturbation in `repair`.
export const PARAMS = [
  // Floor of 44ms keeps the tightest (curve) perfect window ≥ ~35ms — the loop
  // is not allowed to make timing tighter than human reflexes can learn.
  ["perfectWindowMs", 44, 75],
  ["goodWindowMs", 70, 170],
  ["contactWindowMs", 150, 260],
  ["strikeZoneRate", 0.5, 0.78],
  ["cpuRunsPerInningMean", 0.6, 2.6],
  ["cpuRunsPerInningSpread", 0.6, 2.2],
  ["outcomes.perfect.hr", 0.12, 0.45],
  ["outcomes.perfect.out", 0.1, 0.4],
  ["outcomes.good.single", 0.25, 0.5],
  ["outcomes.good.out", 0.25, 0.55],
  ["outcomes.weak.out", 0.6, 0.92],
];

function get(obj, path) {
  return path.split(".").reduce((o, k) => o[k], obj);
}
function set(obj, path, v) {
  const keys = path.split(".");
  const last = keys.pop();
  keys.reduce((o, k) => o[k], obj)[last] = v;
}
function clone(t) {
  return JSON.parse(JSON.stringify(t));
}

// Enforce sane ordering / normalization so candidates stay valid.
function repair(t) {
  t.goodWindowMs = Math.max(t.goodWindowMs, t.perfectWindowMs + 10);
  t.contactWindowMs = Math.max(t.contactWindowMs, t.goodWindowMs + 20);
  for (const q of ["perfect", "good", "weak"]) {
    const o = t.outcomes[q];
    const sum = o.hr + o.triple + o.double + o.single + o.out;
    if (sum > 0) for (const k of Object.keys(o)) o[k] /= sum; // renormalize
  }
  return t;
}

// Score a tuning against an eval set. Returns { score, passed, results }.
export function scoreTuning(tuning, evals, opts) {
  const ctx = buildContext(tuning, opts);
  const results = evals.map((e) => ({ id: e.id, gen: e.gen, ...e.run(ctx) }));
  const passed = results.filter((r) => r.pass).length;
  // Aggregate: mean score, with a bonus for outright passes so the optimizer
  // prefers crossing thresholds over merely nudging partials.
  const meanScore = results.reduce((a, r) => a + r.score, 0) / results.length;
  const passFrac = passed / results.length;
  return { score: 0.7 * meanScore + 0.3 * passFrac, meanScore, passed, results };
}

// Deterministic LCG for the optimizer's own choices.
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function optimize(startTuning, evals, { steps = 220, seed = 1, sampleOpts } = {}) {
  const rand = lcg(seed);
  let best = repair(clone(startTuning));
  let bestEval = scoreTuning(best, evals, sampleOpts);
  const trace = [];

  for (let i = 0; i < steps; i++) {
    const cand = clone(best);
    const [path, lo, hi] = PARAMS[Math.floor(rand() * PARAMS.length)];
    const cur = get(cand, path);
    // Step size shrinks over time (anneal) for fine-tuning at the end.
    const anneal = 1 - i / steps;
    const span = (hi - lo) * (0.04 + 0.26 * anneal);
    const next = Math.min(hi, Math.max(lo, cur + (rand() * 2 - 1) * span));
    set(cand, path, next);
    repair(cand);
    const candEval = scoreTuning(cand, evals, sampleOpts);
    if (candEval.score > bestEval.score + 1e-6) {
      best = cand;
      bestEval = candEval;
      trace.push({ step: i, path, from: cur, to: next, score: candEval.score });
    }
  }
  return { tuning: best, eval: bestEval, trace };
}
