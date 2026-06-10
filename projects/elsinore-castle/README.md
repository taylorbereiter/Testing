# Elsinore — an interactive Kronborg Castle (Hamlet)

A walkable, full-scale 3D replica of **Kronborg Castle** in Helsingør, Denmark — the
"Elsinore" of Shakespeare's *Hamlet* — built with Three.js. The residents of the castle
live out a daily schedule and perform **13 scenes from the play in their proper
locations** (the Ghost on the gun platform after midnight, the Mousetrap in the Great
Hall, the gravediggers in the churchyard…), all in Shakespeare's own words. Fifteen
gold ⓘ markers around the grounds teach the real castle's history.

## How to run

The easiest way: **download the folder and open `index.html` in any modern browser**
(Chrome, Safari, Edge, Firefox — phone or laptop). Three.js is fetched from a CDN, so
you need an internet connection the first time.

Or serve it locally:

```
cd projects/elsinore-castle
python3 -m http.server 8000
# then open http://localhost:8000
```

It also works perfectly hosted on GitHub Pages or any static host.

## Controls

| | Phone / tablet | Laptop (touchpad — no mouse needed) |
|---|---|---|
| Move | left joystick | `W A S D` or `↑ ↓` |
| Look | drag anywhere on the view | click-drag on the view |
| Turn | drag | `Q`/`E` or `← →` |
| Run | — | hold `Shift` |
| Interact | tap a person or ⓘ marker | click a person or ⓘ marker |

The **☰ Guide** menu has: **Visit** (teleport to any part of the castle),
**Playbill** (jump straight into any scene of the play), **People** (find any
character and read about them), **About** (the history of Kronborg and of *Hamlet*
at Elsinore), and **Help**.

Time runs fast — one castle day takes about 12 minutes (⏸ / 1× / 3× in the top bar).
The Ghost only walks between midnight and cock-crow.

## What's modelled (true to scale)

- Four Renaissance wings around the 50×40 m courtyard, sandstone facades, copper
  roofs, plinth, cornices, ~290 windows that light up at night
- The **Great Hall** (62 m — the longest hall in Northern Europe in 1582) with dais,
  banquet table, tapestries (the "arras") and the Mousetrap stage
- The **Chapel** (1582) with oak pews, altar and stained glass
- The **casemates** beneath the east wing, with the sleeping **Holger Danske**
- Trumpeter's Tower, Telegraph Tower with the Dannebrog, corner towers
- Star-fort **ramparts** with parapets, the **gun battery** facing the Øresund
  (the Ghost's "platform"), cannons, moat and wooden bridge
- The Queen's garden, Ophelia's willow "aslant the brook", and the churchyard with
  the open grave and Yorick's skull — and Sweden visible across the Sound
- Full day/night cycle: sun, moon, stars, dawn, lantern light
- Procedural soundscape (no audio files): coastal wind and waves, gulls,
  footsteps, the castle bell (twelve tolls at midnight), the Ghost's drone,
  and evening lute music in the Great Hall — toggle with the 🔊 button

One deliberate liberty (noted on its in-world plaque): the Great Hall is placed at
courtyard level so everyone can walk in; in reality it occupies the upper floor of
the south wing.

## Code layout

| file | what it does |
|---|---|
| `index.html` | UI shell, styles, CDN loader |
| `js/data.js` | all educational text, character bios, scene scripts, schedules |
| `js/audio.js` | procedural Web Audio soundscape |
| `js/nav.js` | waypoint graph + A* used by the characters |
| `js/castle.js` | the whole castle/terrain build, colliders, ground heights |
| `js/characters.js` | character bodies, daily-schedule AI, scene engine, speech |
| `js/controls.js` | touch joystick, drag-look, keyboard, collision walking |
| `js/main.js` | bootstrap, day/night sky, HUD, menus, render loop |
