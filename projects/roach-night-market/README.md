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

## Run

```sh
cd projects/roach-night-market
python3 -m http.server 8000
```

Open http://localhost:8000 — drag to orbit, scroll to zoom, `R` toggles
auto-rotate. Three.js loads from a CDN import map; no build step, no assets.
