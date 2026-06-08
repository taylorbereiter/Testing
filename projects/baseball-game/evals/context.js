// Builds the evaluation context: runs self-play across the synthetic audience
// with a given tuning, returning per-profile and audience-mix metrics.

import { simulateGame } from "../loop/simulate.js";
import { makePlayer, PROFILES, AUDIENCE_MIX } from "../loop/players.js";

const PROFILE_NAMES = Object.keys(PROFILES);

// Deterministic seed list so candidate tunings are compared on equal footing.
function seeds(n, salt = 0) {
  return Array.from({ length: n }, (_, i) => (i * 2654435761 + salt) >>> 0);
}

export function buildContext(tuning, { perProfile = 60, audienceN = 120 } = {}) {
  const byProfile = {};
  for (const name of PROFILE_NAMES) {
    const ss = seeds(perProfile, name.length * 101);
    byProfile[name] = ss.map((seed) =>
      simulateGame({ player: makePlayer(name, seed), seed, tuning }),
    );
  }

  // Audience mix: draw a profile per game per the expected population.
  const audience = [];
  const ss = seeds(audienceN, 7777);
  for (let i = 0; i < ss.length; i++) {
    const r = (i + 0.5) / ss.length; // even, deterministic sweep of the mix
    let acc = 0,
      chosen = AUDIENCE_MIX[0][0];
    for (const [name, w] of AUDIENCE_MIX) {
      acc += w;
      if (r <= acc) {
        chosen = name;
        break;
      }
    }
    audience.push(
      simulateGame({ player: makePlayer(chosen, ss[i]), seed: ss[i], tuning }),
    );
  }

  return { byProfile, audience, tuning };
}
