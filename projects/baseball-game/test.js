// Tests: engine invariants + the comprehensive eval gate.
// Run: node test.js   (exit 0 = all good)

import {
  newGame,
  pitch,
  resolveSwing,
  playCpuHalf,
  classifyContact,
} from "./src/engine.js";
import { runEvals } from "./evals/run.js";
import { MAX_GEN } from "./evals/evals.js";
import { readFileSync, existsSync } from "node:fs";

let failures = 0;
function ok(cond, name) {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures++;
    console.error(`  ✗ ${name}`);
  }
}

console.log("Engine invariants:");

// Perfect timing is classified as a perfect contact.
{
  const g = newGame({ seed: 1 });
  pitch(g);
  g.currentPitch.type = "fastball";
  ok(classifyContact(g, 0) === "perfect", "zero timing error = perfect");
  ok(classifyContact(g, 9999) === "miss", "huge timing error = miss");
}

// Four balls force a walk; a walk with bases loaded scores a run.
{
  const g = newGame({ seed: 2 });
  g.bases = [true, true, true];
  pitch(g);
  g.currentPitch.inZone = false;
  for (let i = 0; i < 3; i++) {
    resolveSwing(g, { swing: false });
    pitch(g);
    g.currentPitch.inZone = false;
  }
  const res = resolveSwing(g, { swing: false });
  ok(res.terminal === "walk" && res.runs === 1, "bases-loaded walk scores a run");
}

// Three swinging strikes = an out.
{
  const g = newGame({ seed: 3 });
  let outs0 = g.outs;
  for (let i = 0; i < 3; i++) {
    pitch(g);
    resolveSwing(g, { swing: true, timingErrorMs: 9999 });
  }
  ok(g.outs === outs0 + 1, "three whiffs record an out");
}

// A game always terminates with a winner decided.
{
  const g = newGame({ seed: 9 });
  let guard = 0;
  while (!g.over && guard++ < 5000) {
    if (g.half === "bottom") playCpuHalf(g);
    else {
      pitch(g);
      resolveSwing(g, { swing: true, timingErrorMs: 30 });
    }
  }
  ok(g.over, "game terminates");
}

// Determinism: same seed -> identical trajectory.
{
  const play = () => {
    const g = newGame({ seed: 1234 });
    let guard = 0;
    while (!g.over && guard++ < 5000) {
      if (g.half === "bottom") playCpuHalf(g);
      else {
        pitch(g);
        resolveSwing(g, { swing: true, timingErrorMs: 40 });
      }
    }
    return `${g.score.player}-${g.score.cpu}-${g.pitchCount}`;
  };
  ok(play() === play(), "same seed reproduces the same game");
}

// Eval gate against the shipped (tuned) config.
console.log("\nComprehensive eval gate:");
const tuned = existsSync("./tuned.json")
  ? JSON.parse(readFileSync("./tuned.json", "utf8"))
  : undefined;
const report = runEvals(tuned, MAX_GEN);
for (const r of report.results) ok(r.pass, `${r.id} (${r.detail})`);
console.log(
  `\n${report.passed}/${report.total} evals pass, health ${(report.score * 100).toFixed(1)}%`,
);

if (failures) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll checks passed.");
