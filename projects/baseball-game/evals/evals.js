// Eval suite for the baseball game.
//
// Evals are grouped into GENERATIONS. The self-improvement loop activates one
// new generation per iteration, but RE-RUNS every previously-activated
// generation each loop. So later loops perform an increasingly comprehensive
// review while still introducing fresh criteria — the brief's "new evals each
// loop for comprehensive review and iterative improvement".
//
// An eval is: { id, gen, desc, run(ctx) -> { pass, score, detail } }
//   score is in [0,1] (1 = ideal) and feeds the aggregate health score.
//   ctx = { byProfile: {profile: GameMetrics[]}, audience: GameMetrics[], tuning }

import {
  newGame,
  pitch,
  resolveSwing,
  classifyContact,
} from "../src/engine.js";
import { simulateGame } from "../loop/simulate.js";
import { makePlayer } from "../loop/players.js";

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const rate = (xs, pred) => (xs.length ? xs.filter(pred).length / xs.length : 0);
// Smooth band reward: 1 at the band's center, ~0.5 at its edges, then a
// Gaussian tail that stays > 0 far outside. The tail is deliberate — it gives
// the optimizer a gradient to follow even when a metric is way out of range,
// instead of a flat zero it can't climb out of.
function band(value, lo, hi) {
  const center = (lo + hi) / 2;
  const half = (hi - lo) / 2;
  if (half <= 0) return value === center ? 1 : 0;
  const d = Math.abs(value - center) / half; // 0 at center, 1 at edge
  return Math.exp(-0.693 * d * d); // 1 @ center, 0.5 @ edge, smooth tail
}

export const EVALS = [
  // ------------------------------------------------------------------
  // GEN 1 — Correctness & core balance
  // ------------------------------------------------------------------
  {
    id: "determinism",
    gen: 1,
    desc: "Same seed reproduces the same game (reproducible & fair).",
    run: ({ tuning }) => {
      const p = () => makePlayer("casual", 123);
      const a = simulateGame({ player: p(), seed: 42, tuning });
      const b = simulateGame({ player: p(), seed: 42, tuning });
      const same =
        a.finalScore.player === b.finalScore.player &&
        a.finalScore.cpu === b.finalScore.cpu &&
        a.pitches === b.pitches;
      return { pass: same, score: same ? 1 : 0, detail: same ? "stable" : "DIVERGED" };
    },
  },
  {
    id: "completes",
    gen: 1,
    desc: "Every game terminates with a decided winner (no soft-locks).",
    run: ({ audience }) => {
      const ok = rate(audience, (g) => g.winner !== null) === 1;
      return { pass: ok, score: ok ? 1 : 0, detail: `${audience.length} games` };
    },
  },
  {
    id: "competitiveness",
    gen: 1,
    desc: "Audience win rate sits in the satisfying 42–58% band.",
    run: ({ audience }) => {
      const wr = rate(audience, (g) => g.winner === "player");
      const score = band(wr, 0.42, 0.58);
      return {
        pass: wr >= 0.4 && wr <= 0.6,
        score,
        detail: `win rate ${(wr * 100).toFixed(0)}%`,
      };
    },
  },
  {
    id: "contact-feel",
    gen: 1,
    // Learned in the loop: casual players hate whiffing. Difficulty should come
    // from weak contact turning into outs (balls in play), not swing-and-miss.
    // So a healthy casual contact rate is high — 60–82%.
    desc: "Casual contact rate feels good — lots of balls in play (60–82%).",
    run: ({ byProfile }) => {
      const cr = mean(byProfile.casual.map((g) => g.contactRate));
      const score = band(cr, 0.6, 0.82);
      return {
        pass: cr >= 0.55 && cr <= 0.85,
        score,
        detail: `casual contact ${(cr * 100).toFixed(0)}%`,
      };
    },
  },

  // ------------------------------------------------------------------
  // GEN 2 — Pacing & engagement (mobile session ergonomics)
  // ------------------------------------------------------------------
  {
    id: "session-length",
    gen: 2,
    desc: "Avg game is a snackable 28–70 pitches (good for phone bursts).",
    run: ({ audience }) => {
      const p = mean(audience.map((g) => g.pitches));
      const score = band(p, 28, 70);
      return {
        pass: p >= 22 && p <= 85,
        score,
        detail: `${p.toFixed(0)} pitches/game`,
      };
    },
  },
  {
    id: "drama-lead-changes",
    gen: 2,
    desc: "Games swing — average ≥0.8 lead changes keeps tension alive.",
    run: ({ audience }) => {
      const lc = mean(audience.map((g) => g.leadChanges));
      const score = Math.min(1, lc / 1.2);
      return { pass: lc >= 0.8, score, detail: `${lc.toFixed(2)} lead changes` };
    },
  },
  {
    id: "no-blowouts",
    gen: 2,
    desc: "Fewer than 25% of games are blowouts (|runDiff| ≥ 7).",
    run: ({ audience }) => {
      const bl = rate(audience, (g) => Math.abs(g.runDiff) >= 7);
      const score = Math.exp(-3 * bl); // smooth: 1 @ 0%, ~0.47 @ 25%, decays
      return { pass: bl < 0.25, score, detail: `${(bl * 100).toFixed(0)}% blowouts` };
    },
  },

  // ------------------------------------------------------------------
  // GEN 3 — Variety & fairness (depth that keeps people coming back)
  // ------------------------------------------------------------------
  {
    id: "outcome-variety",
    gen: 3,
    desc: "Hit outcomes are varied (normalized entropy ≥ 0.8).",
    run: ({ audience }) => {
      const agg = { single: 0, double: 0, triple: 0, hr: 0 };
      for (const g of audience)
        for (const k of Object.keys(agg)) agg[k] += g.outcomeCounts[k];
      const total = Object.values(agg).reduce((a, b) => a + b, 0) || 1;
      let H = 0;
      for (const k of Object.keys(agg)) {
        const p = agg[k] / total;
        if (p > 0) H -= p * Math.log2(p);
      }
      const norm = H / Math.log2(4);
      return {
        pass: norm >= 0.8,
        score: Math.min(1, norm / 0.9),
        detail: `entropy ${norm.toFixed(2)} (${JSON.stringify(agg)})`,
      };
    },
  },
  {
    id: "skill-rewarded",
    gen: 3,
    desc: "Skill pays off — skilled win rate exceeds beginner by ≥15pts.",
    run: ({ byProfile }) => {
      const sk = rate(byProfile.skilled, (g) => g.winner === "player");
      const be = rate(byProfile.beginner, (g) => g.winner === "player");
      const gap = sk - be;
      return {
        pass: gap >= 0.15,
        score: Math.max(0, Math.min(1, gap / 0.25)),
        detail: `skilled ${(sk * 100).toFixed(0)}% vs beginner ${(be * 100).toFixed(0)}%`,
      };
    },
  },
  {
    id: "no-degenerate-masher",
    gen: 3,
    desc: "Mindless swing-on-everything must not beat skilled play.",
    run: ({ byProfile }) => {
      const ma = rate(byProfile.masher, (g) => g.winner === "player");
      const sk = rate(byProfile.skilled, (g) => g.winner === "player");
      const ok = ma <= sk; // discipline should out-perform mashing
      return {
        pass: ok,
        score: ok ? Math.min(1, (sk - ma + 0.2) / 0.4) : 0,
        detail: `masher ${(ma * 100).toFixed(0)}% vs skilled ${(sk * 100).toFixed(0)}%`,
      };
    },
  },
  {
    id: "homerun-not-spammy",
    gen: 3,
    desc: "HRs are a thrill, not the norm — 8–28% of hits.",
    run: ({ audience }) => {
      let hr = 0,
        hits = 0;
      for (const g of audience) {
        hr += g.outcomeCounts.hr;
        hits += g.hits;
      }
      const share = hits ? hr / hits : 0;
      return {
        pass: share >= 0.08 && share <= 0.28,
        score: band(share, 0.08, 0.28),
        detail: `HR share ${(share * 100).toFixed(0)}%`,
      };
    },
  },

  // ------------------------------------------------------------------
  // GEN 4 — Accessibility & enjoyment proxy (anticipating real users)
  // ------------------------------------------------------------------
  {
    id: "beginner-not-punished",
    gen: 4,
    desc: "Beginners still win ≥25% — early sessions feel encouraging.",
    run: ({ byProfile }) => {
      const be = rate(byProfile.beginner, (g) => g.winner === "player");
      return {
        pass: be >= 0.25,
        score: Math.max(0, Math.min(1, be / 0.4)),
        detail: `beginner win rate ${(be * 100).toFixed(0)}%`,
      };
    },
  },
  {
    id: "timing-window-readable",
    gen: 4,
    desc: "Perfect-timing window is humane (≥35ms) so it's learnable by feel.",
    run: ({ tuning }) => {
      const g = newGame({ seed: 1, tuning });
      pitch(g);
      // Hardest pitch (curve) defines the tightest window.
      g.currentPitch.type = "curve";
      const tightest = tuning.perfectWindowMs / tuning.pitchDifficulty.curve;
      return {
        pass: tightest >= 35,
        score: Math.min(1, tightest / 45),
        detail: `tightest perfect window ${tightest.toFixed(0)}ms`,
      };
    },
  },
  {
    id: "enjoyment-index",
    gen: 4,
    desc: "Composite enjoyment proxy (close games, variety, agency) ≥ 0.7.",
    run: ({ audience, byProfile }) => {
      const closeness = rate(audience, (g) => Math.abs(g.runDiff) <= 3);
      const scoring = band(mean(audience.map((g) => g.totalRuns)), 5, 16);
      const agency = band(
        mean(byProfile.casual.map((g) => g.contactRate)),
        0.6,
        0.82,
      );
      const drama = Math.min(1, mean(audience.map((g) => g.leadChanges)) / 1.2);
      const idx = 0.3 * closeness + 0.2 * scoring + 0.25 * agency + 0.25 * drama;
      return {
        pass: idx >= 0.7,
        score: idx,
        detail: `EI ${idx.toFixed(2)} [close ${closeness.toFixed(2)}, score ${scoring.toFixed(2)}, agency ${agency.toFixed(2)}, drama ${drama.toFixed(2)}]`,
      };
    },
  },
];

export function evalsUpToGen(gen) {
  return EVALS.filter((e) => e.gen <= gen);
}

export const MAX_GEN = Math.max(...EVALS.map((e) => e.gen));
