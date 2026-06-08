# Tap Ball ⚾ — a one-tap mobile baseball game

A snackable, thumb-first baseball game for the phone. You're always at bat:
tap to throw, **tap again to swing**, and time it as the ball crosses the plate.
Perfect timing crushes home runs; weak contact dribbles into outs. Beat the CPU
over 3 short innings.

The interesting part isn't just the game — it's **how it was balanced**. A
self-simulation loop plays thousands of games against synthetic players, scores
them against a growing suite of evals, and hill-climbs the game's tuning until
it feels good. New evals are introduced every loop, so each pass is a more
comprehensive review than the last.

## Play it

Open `index.html` on your phone (or any browser). No server, no build, no
dependencies — it's a single self-contained file.

- **Tap the field** to throw the pitch.
- **Tap again** to swing. Aim for the moment the ball hits the plate.
- Curveballs and changeups break and change speed — read the spin.

## The workflow (how it builds and balances itself)

```
              ┌─────────────────────────────────────────────┐
              │  loop/run.js  (one iteration = one "loop")   │
              │                                             │
  engine.js ──┤  1. activate a NEW generation of evals       │
  (pure game) │  2. self-play 1000s of games vs. synthetic   │
              │     players (loop/players.js)                │
              │  3. hill-climb tuning to satisfy ALL evals   │
              │     so far (evals/evals.js)                  │
              └───────────────┬─────────────────────────────┘
                              │ writes
                  tuned.json  ▼  IMPROVEMENT_LOG.md
                              │
               build.js  ─────┴──►  index.html  (ships to the phone)
```

### Self-simulation & anticipating real users

`loop/players.js` models the audience we expect on a casual mobile game —
**beginners** (loose timing, chase everything), **casual** players,
**skilled** players (tight timing, good discipline), and **mashers** (swing at
literally everything). The loop plays full games as each of them, so the
balance reflects how real, mixed-skill people will actually tap.

### Evals, one new generation per loop

Evals live in `evals/evals.js`, grouped into **generations**. Each loop turns on
the next generation _and re-runs every prior one_, so coverage compounds:

| Loop | New evals | What it checks |
| ---- | --------- | -------------- |
| 1 | determinism, completes, competitiveness, contact-feel | Correctness & core balance |
| 2 | session-length, drama-lead-changes, no-blowouts | Mobile pacing & tension |
| 3 | outcome-variety, skill-rewarded, no-degenerate-masher, homerun-not-spammy | Depth & fairness |
| 4 | beginner-not-punished, timing-window-readable, enjoyment-index | Accessibility & enjoyment proxy |

Each eval returns a smooth score in `[0,1]` (not just pass/fail) so the
optimizer always has a gradient to climb — see "what the loop learned" below.

### What the loop learned (and how it shaped the design)

Two findings came straight out of the simulations and are baked into the evals:

1. **Casual players hate whiffing.** Early tuning made contact too rare, which
   reads as frustrating on a phone. The loop's data pushed difficulty toward
   _weak contact becoming outs_ (balls in play) rather than swing-and-miss, so
   `contact-feel` now targets a high 60–82% contact rate.
2. **Don't out-tune human reflexes.** The optimizer kept shrinking the
   "perfect" timing window to keep home runs rare — down to ~28ms, tighter than
   a person can learn by feel. We added a hard floor (≥~35ms tightest window)
   so balance is found by adjusting outcomes, not by demanding superhuman taps.

The full per-loop record — eval scorecards and the top tuning moves — is in
[`IMPROVEMENT_LOG.md`](./IMPROVEMENT_LOG.md), regenerated every run.

## Commands

```bash
npm run loop          # run the self-simulation loop -> tuned.json + IMPROVEMENT_LOG.md
npm run build         # inline engine + tuned config -> index.html
npm run tune-and-build # do both
npm run evals         # print the comprehensive eval scorecard for the tuned config
npm test              # engine invariants + eval gate (good for CI)
```

To re-balance after changing the engine or adding evals: `npm run tune-and-build`.

## Layout

```
src/engine.js     Pure, deterministic game engine (no DOM). Source of truth.
src/ui.js         Browser UI: pitch animation, touch, scoreboard.
src/style.css     Mobile-first styles.
loop/players.js   Synthetic player profiles (the expected audience).
loop/simulate.js  Headless game driver + per-game metrics.
loop/optimize.js  Hill-climbing tuner over the parameter space.
loop/run.js       The loop: generational evals -> learn -> log.
evals/evals.js    The eval suite, grouped by generation.
evals/context.js  Builds eval context from self-play.
evals/run.js      Standalone scorecard printer.
build.js          Bundles everything into a standalone index.html.
test.js           Engine tests + eval gate.
tuned.json        Loop output: the balance the game ships with.
index.html        The game. Open this on your phone.
```

The browser runs the **same** `engine.js` the evals validate — `build.js` just
strips the module keywords and inlines it, so what you play is exactly what was
tested.
