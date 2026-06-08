// Player models — synthetic users that the self-simulation loop uses to
// anticipate how real people will actually play on a phone.
//
// Each model produces an at-bat decision given the current pitch:
//   { swing: boolean, timingErrorMs?: number }
//
// Timing error is drawn from a distribution whose spread encodes skill, plus a
// bias (some people are chronically early/late). Discipline encodes how often
// they chase pitches out of the zone. These are the levers that make the
// simulated population resemble a real, mixed audience.

import { makeRng } from "../src/engine.js";

// Box-Muller normal sample in ms.
function normal(rng, mean, sd) {
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * sd;
}

export const PROFILES = {
  // Picks up the phone, taps roughly. Loose timing, chases everything.
  beginner: { sd: 150, bias: 25, discipline: 0.2, swingProneness: 0.9 },
  // Plays a few games, getting a feel for it.
  casual: { sd: 95, bias: 10, discipline: 0.45, swingProneness: 0.75 },
  // Knows the timing, lays off junk.
  skilled: { sd: 55, bias: 0, discipline: 0.7, swingProneness: 0.6 },
  // Mashes swing on every pitch (a real and common phone-game behavior).
  masher: { sd: 120, bias: 0, discipline: 0.0, swingProneness: 1.0 },
};

export function makePlayer(profileName, seed = 7) {
  const p = PROFILES[profileName];
  if (!p) throw new Error(`unknown profile ${profileName}`);
  const rng = makeRng(seed ^ 0x9e3779b9);
  return {
    name: profileName,
    decide(game) {
      const pitch = game.currentPitch;
      // Decide whether to swing. People swing more at in-zone pitches; a
      // disciplined player lays off out-of-zone pitches.
      const wantSwing = pitch.inZone
        ? rng() < p.swingProneness
        : rng() < p.swingProneness * (1 - p.discipline);
      if (!wantSwing) return { swing: false };
      const err = normal(rng, p.bias, p.sd);
      return { swing: true, timingErrorMs: err };
    },
  };
}

// The audience mix we expect on a casual mobile game: lots of casual/beginner.
export const AUDIENCE_MIX = [
  ["beginner", 0.3],
  ["casual", 0.4],
  ["skilled", 0.15],
  ["masher", 0.15],
];
