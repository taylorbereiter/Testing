// Pure baseball game engine — no DOM, no globals.
// Works in the browser (via <script type="module">) and in Node (via import).
//
// Design goals:
//  - Deterministic given a seed, so evals are reproducible.
//  - A timing-based batting mechanic that is fun on a phone (one tap = one swing).
//  - Tunable constants (TUNING) so the self-improvement loop can adjust balance.

// ---------------------------------------------------------------------------
// Seedable RNG (mulberry32) — small, fast, deterministic.
// ---------------------------------------------------------------------------
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Tuning — every "feel" number lives here so the loop can adjust balance
// without touching logic. Values are calibrated by evals/loop.
// ---------------------------------------------------------------------------
export const TUNING = {
  innings: 3, // short sessions suit a phone
  pitchTravelMs: { fastball: 600, changeup: 820, curve: 700 },
  // Timing windows (ms of absolute error around ideal contact).
  perfectWindowMs: 45, // crushes it -> XBH/HR potential
  goodWindowMs: 110, // solid contact -> hit potential
  contactWindowMs: 190, // weak contact -> foul / out in play
  // How much a pitch's "stuff" shrinks the windows (harder pitches = tighter).
  pitchDifficulty: { fastball: 1.0, changeup: 1.15, curve: 1.25 },
  // Outcome probabilities given the quality of contact.
  outcomes: {
    perfect: { hr: 0.34, triple: 0.06, double: 0.26, single: 0.22, out: 0.12 },
    good: { hr: 0.08, triple: 0.04, double: 0.18, single: 0.40, out: 0.30 },
    weak: { hr: 0.0, triple: 0.0, double: 0.03, single: 0.15, out: 0.82 },
  },
  // Zone judgement: fraction of pitches that are actually in the strike zone.
  strikeZoneRate: 0.62,
  // CPU opponent strength (runs/inning is drawn around this).
  cpuRunsPerInningMean: 0.95,
  cpuRunsPerInningSpread: 1.4,
};

const PITCH_TYPES = ["fastball", "changeup", "curve"];

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
export function newGame({ seed = 1, tuning = TUNING } = {}) {
  return {
    tuning,
    rng: makeRng(seed),
    seed,
    inning: 1,
    half: "top", // player always bats in the "top"; CPU bats the bottom
    outs: 0,
    balls: 0,
    strikes: 0,
    bases: [false, false, false], // 1st, 2nd, 3rd occupied?
    score: { player: 0, cpu: 0 },
    log: [],
    currentPitch: null,
    over: false,
    pitchCount: 0,
    swings: 0,
    contacts: 0,
  };
}

// Throw the next pitch. Returns the pitch descriptor the UI animates.
export function pitch(game) {
  if (game.over || game.half !== "top") return null;
  const t = game.tuning;
  const type = PITCH_TYPES[Math.floor(game.rng() * PITCH_TYPES.length)];
  const travelMs = t.pitchTravelMs[type];
  const inZone = game.rng() < t.strikeZoneRate;
  game.currentPitch = {
    type,
    travelMs,
    inZone,
    idealContactMs: travelMs, // contact is ideal right as it crosses the plate
    thrownAt: null,
  };
  game.pitchCount += 1;
  return game.currentPitch;
}

// Classify swing-timing error into a contact quality bucket.
export function classifyContact(game, timingErrorMs) {
  const t = game.tuning;
  const diff = t.pitchDifficulty[game.currentPitch.type];
  const perfect = t.perfectWindowMs / diff;
  const good = t.goodWindowMs / diff;
  const contact = t.contactWindowMs / diff;
  const e = Math.abs(timingErrorMs);
  if (e <= perfect) return "perfect";
  if (e <= good) return "good";
  if (e <= contact) return "weak";
  return "miss";
}

function rollOutcome(game, quality) {
  const probs = game.tuning.outcomes[quality];
  const r = game.rng();
  let acc = 0;
  for (const k of ["hr", "triple", "double", "single", "out"]) {
    acc += probs[k] || 0;
    if (r < acc) return k;
  }
  return "out";
}

// Advance runners for a hit of the given number of bases (4 = HR).
function advanceRunners(game, basesToAdvance) {
  let runs = 0;
  // Process existing runners from 3rd -> 1st.
  const newBases = [false, false, false];
  // Batter starts at base index (basesToAdvance-1); 4 => scores.
  const runners = [];
  for (let b = 2; b >= 0; b--) {
    if (game.bases[b]) runners.push(b + 1); // distance from home
  }
  // Move each existing runner.
  for (const fromBase of runners) {
    const dest = fromBase + basesToAdvance; // distance from home in bases
    if (dest >= 4) runs += 1;
    else newBases[dest - 1] = true;
  }
  // Place the batter.
  if (basesToAdvance >= 4) runs += 1;
  else newBases[basesToAdvance - 1] = true;
  game.bases = newBases;
  return runs;
}

function resetCount(game) {
  game.balls = 0;
  game.strikes = 0;
}

function recordOut(game) {
  game.outs += 1;
  if (game.outs >= 3) endHalfInning(game);
}

// The core at-bat resolution given the player's swing decision.
//   action: { swing: boolean, timingErrorMs?: number }
// Returns a result descriptor for the UI.
export function resolveSwing(game, action) {
  if (game.over || game.half !== "top" || !game.currentPitch)
    return { kind: "noop" };
  const pitch = game.currentPitch;
  let result;

  if (!action.swing) {
    // Took the pitch.
    if (pitch.inZone) {
      game.strikes += 1;
      result = { kind: "called-strike" };
    } else {
      game.balls += 1;
      result = { kind: "ball" };
    }
  } else {
    game.swings += 1;
    const quality = classifyContact(game, action.timingErrorMs ?? 9999);
    if (quality === "miss") {
      game.strikes += 1;
      result = { kind: "swing-strike" };
    } else {
      game.contacts += 1;
      const outcome = rollOutcome(game, quality);
      if (outcome === "out") {
        recordOut(game);
        result = { kind: "out-in-play", quality };
        resetCount(game);
        game.currentPitch = null;
        return finalize(game, result);
      }
      const basesMap = { single: 1, double: 2, triple: 3, hr: 4 };
      const runs = advanceRunners(game, basesMap[outcome]);
      game.score.player += runs;
      result = { kind: "hit", outcome, quality, runs };
      resetCount(game);
      game.currentPitch = null;
      return finalize(game, result);
    }
  }

  // Resolve count-based terminal states.
  if (game.strikes >= 3) {
    recordOut(game);
    result = { ...result, terminal: "strikeout" };
    resetCount(game);
  } else if (game.balls >= 4) {
    const runs = advanceRunners(game, 1); // walk forces runners
    game.score.player += runs;
    result = { ...result, terminal: "walk", runs };
    resetCount(game);
  }
  game.currentPitch = null;
  return finalize(game, result);
}

function finalize(game, result) {
  game.log.push({
    inning: game.inning,
    half: game.half,
    ...result,
    score: { ...game.score },
  });
  return result;
}

// CPU bats the bottom of the inning via a simple run model, then we advance.
export function playCpuHalf(game) {
  const t = game.tuning;
  // Draw runs from a clamped normal-ish distribution.
  const g = (game.rng() + game.rng() + game.rng()) / 3; // ~normal in [0,1]
  const runs = Math.max(
    0,
    Math.round(
      t.cpuRunsPerInningMean + (g - 0.5) * 2 * t.cpuRunsPerInningSpread,
    ),
  );
  game.score.cpu += runs;
  game.log.push({ inning: game.inning, half: "bottom", kind: "cpu", runs });
  // Walk-off: if CPU takes the lead in the final inning, game ends.
  if (
    game.inning >= t.innings &&
    game.score.cpu > game.score.player
  ) {
    game.over = true;
  }
  game.inning += 1;
  game.half = "top";
  game.outs = 0;
  game.bases = [false, false, false];
  resetCount(game);
  if (game.inning > t.innings && !game.over) game.over = true;
  return runs;
}

function endHalfInning(game) {
  // Player's half just ended; hand off to the CPU.
  game.outs = 0;
  game.bases = [false, false, false];
  resetCount(game);
  game.half = "bottom";
  // Final-inning early-out: if player is already trailing badly it still plays
  // the bottom for drama; CPU half is triggered by the driver/UI.
}

// Convenience: is it the CPU's turn to bat?
export function cpuToBat(game) {
  return !game.over && game.half === "bottom";
}

export function winner(game) {
  if (!game.over) return null;
  if (game.score.player > game.score.cpu) return "player";
  if (game.score.cpu > game.score.player) return "cpu";
  return "tie";
}
