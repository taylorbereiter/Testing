// Standalone eval runner — prints a scorecard for a tuning at a given
// generation. Usage:
//   node evals/run.js [gen]
// Defaults to the highest generation (full comprehensive review).

import { TUNING } from "../src/engine.js";
import { buildContext } from "./context.js";
import { evalsUpToGen, MAX_GEN } from "./evals.js";

export function runEvals(tuning, gen) {
  const ctx = buildContext(tuning);
  const evals = evalsUpToGen(gen);
  const results = evals.map((e) => ({ id: e.id, gen: e.gen, desc: e.desc, ...e.run(ctx) }));
  const passed = results.filter((r) => r.pass).length;
  const score = results.reduce((a, r) => a + r.score, 0) / results.length;
  return { gen, results, passed, total: results.length, score };
}

function fmt(report) {
  const lines = [];
  lines.push(`Comprehensive review — generations 1..${report.gen}`);
  lines.push(`Passed ${report.passed}/${report.total}   health ${(report.score * 100).toFixed(1)}%`);
  lines.push("");
  let g = 0;
  for (const r of report.results) {
    if (r.gen !== g) {
      g = r.gen;
      lines.push(`  ── gen ${g} ──`);
    }
    const mark = r.pass ? "PASS" : "FAIL";
    lines.push(
      `  [${mark}] ${r.id.padEnd(24)} ${(r.score * 100).toFixed(0).padStart(3)}%  ${r.detail}`,
    );
  }
  return lines.join("\n");
}

// Run directly?
if (import.meta.url === `file://${process.argv[1]}`) {
  const gen = Number(process.argv[2]) || MAX_GEN;
  const report = runEvals(TUNING, gen);
  console.log(fmt(report));
  process.exit(report.passed === report.total ? 0 : 1);
}

export { fmt };
