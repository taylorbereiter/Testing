# Neon Voxel Assault

A highly stylized synthwave voxel arena shooter that runs entirely in the
browser as a single HTML file. Built for phones — tuned for the iPhone 13
Pro Max — with wave-based hover-drone bot enemies.

## How to play

Open `index.html` in a browser. On a phone, serve the folder and visit it
over your local network:

```
cd projects/voxel-shooter
python3 -m http.server 8000
# then open http://<your-computer-ip>:8000 on your phone
```

Or host the file anywhere static (GitHub Pages, etc.). It needs internet
access on first load to fetch Three.js from a CDN.

Tip: on iOS, use Share → "Add to Home Screen" to play fullscreen without
the Safari toolbar.

## Controls

- **Left thumb** — virtual joystick to move (appears where you touch)
- **Right thumb** — drag to aim
- **FIRE button** — hold for full auto
- Desktop fallback: WASD to move, drag the mouse to aim, hold click to fire

## Gameplay

- Endless waves of hover drones; each wave spawns more, tougher, faster bots
- Drones orbit you, keep their distance, and only shoot when they have
  line of sight — use the voxel towers as cover
- 100 points per kill; survive as long as you can

## Tech notes

- Three.js (r160, ES module from CDN), no build step, no other dependencies
- Voxel world rendered with `InstancedMesh` (one draw call per material)
- Pooled projectiles and voxel debris particles — zero allocation churn in
  the hot loop
- Grid-cell AABB collision (no physics engine)
- Pixel ratio capped at 2, no shadow maps — steady frame rate on A15
- `viewport-fit=cover` + safe-area insets so the HUD clears the notch and
  home indicator; haptics via `navigator.vibrate` where supported
- Sound is synthesized with the Web Audio API (no audio assets)
