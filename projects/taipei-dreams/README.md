# 臺北夢 · Taipei Dreams

An interactive, real-time **low-poly Taipei at night** you can fly through in the
browser. Built as a single self-contained page: an aurora sky (custom GLSL
shader), a procedurally generated neon skyline with a Taipei 101 centerpiece,
drifting Pingxi-style sky lanterns, and real cinematic **bloom** post-processing.

Made for Taylor — pulling together a few things that seemed like *you*: a love of
building little 3D worlds (those Quaternius asset packs), Taipei, and a soft spot
for things that glow.

## Run it

It's just one HTML file. Open it in any modern browser:

```
# easiest: double-click index.html
# or serve it locally
python3 -m http.server 8000   # then visit http://localhost:8000
```

Needs an internet connection the first time — it pulls Three.js (r160) from a
CDN. On a phone it works too: drag with one finger to look around, pinch to zoom.

## Controls

- **Drag** — orbit / look around
- **Scroll or pinch** — fly closer / pull back
- **Move the mouse** — gentle parallax drift
- **Color dots (top-right)** — switch the city's mood: Neon · Blossom · Dusk · Lantern
- It also slowly auto-orbits on its own, so it looks good just left running.

## How it's made

- **Three.js r160** + `EffectComposer` / `UnrealBloomPass` for the neon glow
- **Aurora sky**: a back-side sphere with an fBm-noise fragment shader (stars +
  flowing aurora bands)
- **Skyline**: procedurally scattered buildings on a block grid with a canvas-
  generated lit-window emissive texture; a central stacked-ingot tower nodding to
  Taipei 101
- **Sky lanterns**: a `Points` cloud animated entirely on the GPU (rise, loop,
  twinkle) with additive blending
- Respects `prefers-reduced-motion`, and degrades gracefully if offline

No build step, no dependencies to install — everything is in `index.html`.
