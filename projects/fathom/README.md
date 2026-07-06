# FATHOM — an echolocation dive

A one-thumb phone game about seeing with sound.

You pilot a tiny submersible into a procedurally generated abyss. The water is
pitch black — the only way to see is to **ping**: a sonar pulse that sweeps
outward and paints the cave walls, pearls, mines, and creatures as glowing
outlines that fade from memory. But sound carries in the deep, and the things
that live down there are listening.

## How to play

| Input | Action |
|---|---|
| **Tap** | Sonar ping (reveals the world around you) |
| **Hold + drag** | Thrust in that direction |

- **Descend** as deep as you can. Depth is your score.
- **Oxygen** drains constantly — grab green air pockets and pearls to refill.
- **Hull** takes 3 hits: mines, jellyfish, and wall impacts all hurt.
- **The anglerfish** hears your pings and comes to investigate. Its lure is
  always faintly visible — your only warning. Ping wisely.
- Bioluminescent flora stays lit once pinged — use it as landmarks.
- Biomes shift every few hundred meters: The Shallows → Twilight Reach →
  Midnight Zone → The Trench → Hadal Deep → The Unnamed.

Best depth and pearl count are saved locally between runs.

## Tech

Single self-contained `index.html` — no dependencies, no build step, no
network. Canvas 2D rendering, procedural audio via WebAudio, haptics via the
Vibration API where available. Works offline (perfect for a plane): open it
once in your phone browser, or serve it locally with any static server.

```
npx serve projects/fathom
```

Keyboard also works for desktop testing: arrows/WASD to move, space to ping,
`p` to pause.
