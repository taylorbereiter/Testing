# Super Plumber Bros

A classic side-scrolling platformer in the spirit of the original Super Mario Bros.,
built as a single self-contained HTML file. No build step, no dependencies, no external
assets — all graphics are drawn with the Canvas 2D API and all sound is synthesized with
the Web Audio API.

## Run it

Just open `index.html` in any modern browser:

```
# from this folder
open index.html            # macOS
xdg-open index.html        # Linux
# or drag the file onto a browser window, or serve it:
python3 -m http.server 8000   # then visit http://localhost:8000
```

Works on desktop and mobile (on-screen touch controls appear automatically on touch devices).

## Controls

| Action        | Keyboard                          | Touch      |
|---------------|-----------------------------------|------------|
| Move          | ← → (or A / D)                    | ◀ ▶        |
| Jump          | Z / Space / ↑ / W (hold = higher) | **A** button |
| Run & fire    | X / Shift / J                     | **B** button |
| Pause         | P                                 | —          |
| Mute          | M                                 | —          |
| Start / retry | Space / Enter / tap               | tap        |

Jump height is variable — tap for a small hop, hold for a full jump. The controls also
include **jump buffering** and **coyote time** so jumps feel responsive.

## Gameplay

- **Goal:** run right, survive, and grab the flagpole before the timer runs out.
- **Enemies:** stomp Goombas and Koopas from above. A stomped Koopa becomes a shell you
  can kick — a moving shell wipes out other enemies (and you, if it comes back around).
- **Power-ups** (hidden in `?` blocks):
  - 🍄 **Mushroom** — grow big (take one extra hit before dying).
  - 🌸 **Fire Flower** — throw bouncing fireballs with the run/fire button.
  - ⭐ **Star** — brief invincibility; touch enemies to destroy them.
- **Blocks:** bump `?` blocks for coins/power-ups. Big Plumber can smash brick blocks.
- **Coins:** collect 100 for a 1-up. Coins and stomps add to your score.
- **Lives:** you start with 3. Falling in a pit, running into an enemy while small, or
  the timer hitting zero costs a life. Lose them all and it's game over.

## How it's built

Everything lives in `index.html` (~1.6k lines of vanilla JS):

- **Fixed-timestep simulation** (1/60s) with an accumulator, so physics are stable and
  frame-rate independent; rendering runs every animation frame.
- **Tile-based world** built programmatically in `makeLevel()` (no fragile ASCII maps),
  with AABB-vs-tile collision resolved separately on the X and Y axes.
- **Pixel-art sprites** drawn from primitive rectangles — Plumber, enemies, blocks,
  pipes, flag, castle, parallax hills/clouds/bushes.
- **Web Audio SFX** synthesized on the fly (jump, coin, stomp, power-up, fireball, …) —
  all original, no copyrighted audio.

## Notes

This is an original homage, not a copy: the art, level, and audio are all generated in
code. It's a single file on purpose — easy to read, easy to tweak. Try changing the
physics constants near the top of the `<script>` (gravity, jump velocity, run speed) to
change the game's feel.
