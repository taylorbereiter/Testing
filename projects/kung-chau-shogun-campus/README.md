# Kung Chau Shogun Campus — 3D Rendering

An interactive Three.js rendering of the **Kung Chau Shogun Campus** of
**Kung Chau International School**, set in Shindian (新店), New Taipei City.

A single self-contained `index.html` — no build step, no dependencies to
install. Three.js is loaded from a CDN via an import map.

## Run it

Because it loads ES modules from a CDN, open it through a local web server
(opening the file directly with `file://` will be blocked by the browser):

```bash
cd projects/kung-chau-shogun-campus
python3 -m http.server 8000
# then visit http://localhost:8000/
```

Or with Node:

```bash
npx serve .
```

## What's in the scene

- **Shogun Keep (tenshu)** — a five-tier donjon with flared, curved tile
  roofs, golden finial and ridge ornaments, plaster walls and paper-screen
  windows. The campus landmark, sitting on a stepped stone dais.
- **Great Torii Gate** at the south entrance, plus a smaller inner gate.
- **Five-story Pagoda** (library / bell tower) with a golden sōrin spire.
- **Classroom wings** — east, west, and a three-story north academic block,
  with verandas, mullioned windows and long hipped roofs.
- **Gatehouse / administration** building fronting the courtyard.
- **Koi pond** with an arched red bridge and a pine island.
- **Sports complex** — running track, oval field, and a hard court with hoops.
- **Landscaping** — raked-gravel courtyard, cherry-blossom avenues, pines,
  stone lanterns (tōrō), hanging paper lanterns, a perimeter wall, and
  flagpoles.
- **Drifting cherry-blossom petals** and trees that sway with the wind.

## Controls

- **Drag** to orbit · **scroll / pinch** to zoom · **right-drag** to pan.
- **Time of Day** slider — full day/night cycle (sun arc, sky gradient,
  dusk tones, exposure).
- **Cherry Blossom Wind** slider — petal fall speed and tree sway.
- **Auto-Orbit / Lanterns / Mist** toggles. Lanterns glow automatically at
  night, or force them on any time.
- **Camera presets**: Keep · Torii · Courtyard · Aerial.

## Notes

This is an artistic interpretation built from primitive geometry — it is not
a survey-accurate model of any real building.
