// Build a single self-contained index.html for the phone.
//
// The browser runs the SAME engine code the evals validated — we just strip the
// ES `export` keywords and inline the tuned config, styles, and UI. No server,
// no modules, no dependencies: open index.html on a phone and play.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(join(__dir, "src", f), "utf8");

// Engine, minus module syntax, so it runs as a plain script.
const engine = src("engine.js")
  .replace(/^export\s+/gm, "")
  .replace(/^import[^\n]*\n/gm, "");

// Prefer the loop-tuned config; fall back to the engine default.
const tunedPath = join(__dir, "tuned.json");
const tuned = existsSync(tunedPath)
  ? readFileSync(tunedPath, "utf8")
  : "null";

const css = src("style.css");
const ui = src("ui.js");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#111c14" />
<title>Tap Ball ⚾</title>
<style>
${css}
</style>
</head>
<body>
<div id="app">
  <div id="scoreboard">
    <div class="team" id="ps-wrap"><div class="name">YOU</div><div class="runs" id="ps">0</div></div>
    <div class="center">
      <div id="inning">▲ 1/3</div>
      <div id="count">0-0</div>
      <div id="outs"></div>
    </div>
    <div class="team" id="cs-wrap"><div class="name">CPU</div><div class="runs" id="cs">0</div></div>
  </div>
  <div id="field">
    <div id="bases">
      <div class="base" id="base0"></div>
      <div class="base" id="base1"></div>
      <div class="base" id="base2"></div>
    </div>
    <div id="track"></div>
    <div id="zone"></div>
    <div id="plate"></div>
    <div class="ball" id="ball"></div>
    <div id="bat"></div>
    <div id="message" class="message"></div>
    <div id="prompt"></div>
  </div>
  <div id="overlay" class="hidden">
    <div id="final-title"></div>
    <div id="final-score"></div>
    <button id="play-again">Play again</button>
  </div>
</div>
<script>
// ---- Engine (identical to what the evals validated) ----
${engine}
// ---- Tuned configuration (from the self-improvement loop) ----
const TUNED = ${tuned} || TUNING;
// ---- UI ----
${ui}
</script>
</body>
</html>
`;

writeFileSync(join(__dir, "index.html"), html);
console.log("Built index.html (" + html.length + " bytes)");
