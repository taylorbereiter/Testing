// Headless game driver — plays a full game with a synthetic player and records
// rich per-game metrics the evals consume. This is the "self-play" substrate.

import {
  newGame,
  pitch,
  resolveSwing,
  playCpuHalf,
  cpuToBat,
  winner,
} from "../src/engine.js";

// Play one full game. Returns a metrics object.
export function simulateGame({ player, seed, tuning }) {
  const game = newGame({ seed, tuning });
  let pitches = 0;
  const outcomeCounts = {
    single: 0,
    double: 0,
    triple: 0,
    hr: 0,
    walk: 0,
    strikeout: 0,
    out: 0,
    ball: 0,
    "called-strike": 0,
    "swing-strike": 0,
  };
  let leadChanges = 0;
  let lastLeader = "tie";
  let safety = 0;

  while (!game.over && safety++ < 5000) {
    if (cpuToBat(game)) {
      playCpuHalf(game);
    } else {
      pitch(game);
      pitches++;
      const action = player.decide(game);
      const res = resolveSwing(game, action);
      tally(outcomeCounts, res);
    }
    const leader =
      game.score.player > game.score.cpu
        ? "player"
        : game.score.cpu > game.score.player
          ? "cpu"
          : "tie";
    if (leader !== "tie" && leader !== lastLeader) {
      leadChanges++;
      lastLeader = leader;
    }
  }

  const hits =
    outcomeCounts.single +
    outcomeCounts.double +
    outcomeCounts.triple +
    outcomeCounts.hr;
  return {
    seed,
    player: player.name,
    pitches,
    finalScore: { ...game.score },
    winner: winner(game),
    swings: game.swings,
    contacts: game.contacts,
    contactRate: game.swings ? game.contacts / game.swings : 0,
    hits,
    outcomeCounts,
    leadChanges,
    runDiff: game.score.player - game.score.cpu,
    totalRuns: game.score.player + game.score.cpu,
  };
}

function tally(counts, res) {
  if (!res || res.kind === "noop") return;
  if (res.kind === "ball") counts.ball++;
  else if (res.kind === "called-strike") counts["called-strike"]++;
  else if (res.kind === "swing-strike") counts["swing-strike"]++;
  else if (res.kind === "out-in-play") counts.out++;
  else if (res.kind === "hit" && res.outcome) counts[res.outcome]++;
  if (res.terminal === "strikeout") counts.strikeout++;
  if (res.terminal === "walk") counts.walk++;
}

// Play a batch of games across a profile and aggregate.
export function simulateBatch({ player, seeds, tuning }) {
  return seeds.map((seed) => simulateGame({ player, seed, tuning }));
}
