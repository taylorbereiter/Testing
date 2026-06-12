# roach-night-market

An anatomically correct American cockroach (*Periplaneta americana*) having a
nice time at a Taiwan night market — a single self-contained Three.js scene.

The roach sits on the classic red plastic stool, munching a grilled squid
skewer, antennae swaying, one hind tarsus tapping along. Around it: food stalls
(臭豆腐 / 蚵仔煎 / 珍珠奶茶), swaying red lanterns, a flickering neon sign,
rising steam, glowing grill coals, lit building windows, and wet asphalt.

Anatomy included: hypognathous head tucked under a pronotum with the species'
pale-bordered shield marking, kidney-shaped compound eyes, body-length
antennae, palps and mandibles, six thorax-mounted legs (coxa → trochanter →
femur → spiny tibia → five tarsomeres → claws + arolium), folded overlapping
tegmina, a ten-segment abdomen, and paired cerci.

Controls in either version: drag to orbit, scroll to zoom, `R` toggles
auto-rotate.

## Run

Two ways to view it:

### 1. Offline — just double-click (no server, no network)

Open **`standalone.html`** directly in a browser. It loads `app.bundle.js`,
a prebuilt classic script with three.js, the addons, and the scene all baked
in, so it works straight from `file://`. Nothing else needed.

### 2. From source — needs a local server

```sh
cd projects/roach-night-market
python3 -m http.server 8000
```

Open http://localhost:8000 (`index.html`). This version is the readable source:
`main.js` as an ES module, three.js pulled from a CDN import map. A server is
required because browsers won't load ES-module `import`s over `file://`.

## Rebuilding the bundle

`app.bundle.js` is generated from `main.js` — edit the source, then:

```sh
npx esbuild main.js --bundle --format=iife --outfile=app.bundle.js
```

(needs `three@0.165.0` available to esbuild, e.g. `npm i three@0.165.0`).
