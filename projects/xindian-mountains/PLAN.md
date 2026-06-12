# Xindian Mountains + Kang Chiao Xiugang Campus — Three.js Scene Build Plan

**Goal:** A highly detailed, self-contained Three.js scene of the Xindian (新店) mountains
in New Taipei City, centered on a detailed, positionally-grounded model of the
Kang Chiao International School Xiugang campus (康橋國際學校秀岡校區), as seen from
aerial viewpoints.

**Builder notes — read first:**

1. **All network hosts except the npm registry are blocked in this environment**
   (verified: Nominatim, Overpass, Wikipedia, tile servers all return 403; `npm view three
   version` succeeds → `three@0.184.0`). Do NOT attempt to fetch DEMs, satellite tiles,
   OSM extracts, or textures at build time or runtime. All geographic reference data you
   need is embedded in this document. All textures must be generated procedurally
   (CanvasTexture / DataTexture / shaders).
2. Everything lives under `projects/xindian-mountains/`. Develop on branch
   `claude/xindian-mountains-3js-gokh1y`, commit incrementally per milestone, push with
   `git push -u origin claude/xindian-mountains-3js-gokh1y`.
3. The geometry data below mixes **high-confidence facts** (sourced from the school and
   hiking references) with **approximate layout estimates** reconstructed from aerial
   reference. Confidence is flagged per item. Where approximate, aim for *plausible and
   characteristic*, not invented precision.

---

## 1. Real-world reference summary

### High confidence (sourced)

| Fact | Value |
|---|---|
| Campus address | No. 800 Huacheng Rd (華城路800號), Xindian Dist., New Taipei City |
| Campus elevation | ~500 m, ridge-top site in the 秀岡山莊 hills with open mountain views |
| Campus area | ~4.5 ha total; ~2.7 ha buildings; ~1.8 ha terraced "field study" garden area |
| Architecture | European castle-style complex; central A/C; described as castle-like (城堡般的歐式建築) |
| Facilities | Conference hall, performance hall, mini-theater, piano rooms, gymnasium, indoor heated pool, fitness center, library, track, dormitory |
| Field-study area zones | Vegetable plots, interpretation platforms + trails, cherry forest (櫻花林), lawns, BBQ/orchard, beetle area, large pond (大湖區), bird/monkey watching, aquatic plant & animal ponds, rock zone, archery range |
| Ridge identity | Campus sits on the 塗潭山 ridge. 塗潭山 (Tutan Mtn) = **508 m**, the ridge's summit, ~1 km from campus; ridge runs north, descending to 灣潭山 (141 m) and 和美山/碧潭山 (152 m) at Bitan |
| District high point | 獅仔頭山 (Shizitou Mtn) = **857 m**, Xindian's highest, SW of the campus |
| Bitan (碧潭) | Gorge + suspension bridge where the Xindian River exits the mountains, NE of campus; 小獅山 (221 m) on its east bank |
| Xindian River | Flows north from Wulai through 屈尺/直潭, carving deep horseshoe meanders (直潭 → 灣潭 → 塗潭) directly below/east of the campus ridge, then through Bitan into the Taipei basin |

### Approximate (reconstructed from aerial reference — flagged ~)

- Campus occupies a **flattened ridge-top plateau** with terraced levels stepped down the
  east slope; retaining walls everywhere; dense subtropical broadleaf forest on all slopes.
- Campus origin coordinate ≈ **24.94° N, 121.51° E** (approximate; used only as the local
  origin — nothing depends on absolute geodetic accuracy).
- Surroundings: terracotta-roofed hillside villa communities (青山鎮 / 華城) strung along
  Huacheng Rd on the ridge north of the campus; the road switchbacks up from the valley.
- The deep river valley floor sits at ~10–20 m elevation → **~450+ m of relief** between
  the campus and the river below it. This is the defining drama of the scene; get it right.

---

## 2. Scene coordinate system

- **1 unit = 1 meter.** Y up, sea level = y 0.
- **+X = east, −Z = north** (Three.js default-friendly: a camera looking down −Z faces north).
- **Origin (0, y, 0) = center of the campus plateau**, plateau elevation **y = 480**.
- Terrain coverage: **12 km × 12 km** centered on origin (−6000…+6000 on both axes).

## 3. Embedded geographic dataset (`src/data/geo.js`)

Author this file exactly once and make every system read from it. All coordinates are
`[x, z]` meters in the scene frame above. These were laid out to honor the bearings,
distances, and elevations in §1; they are the **source of truth for the build** —
do not re-derive them.

### 3.1 Peaks (gaussian summits; `[x, z, summitElev_m, radius_m]`)

```js
export const PEAKS = [
  // name                     x      z     h    r
  ["Tutan Mtn 塗潭山",        200,  1100,  508,  900],   // ridge summit just S of campus
  ["Shizitou Mtn 獅仔頭山",  -2800,  4200,  857, 2200],   // district high point, SW
  ["Zhitan ridge 直潭山列",  -1200,  3200,  730, 1500],
  ["W ridge (Ankeng side)",  -3500,     0,  550, 1800],
  ["W ridge north",          -3000, -2500,  480, 1600],
  ["E hills (Qingtan)",       4500,  1500,  620, 1900],
  ["E hills north",           5500, -1000,  580, 1700],
  ["Erge Mtn dir 二格山",     6000, -2600,  678, 2000],   // partially off-map, ENE horizon
  ["Wantan Mtn 灣潭山",       1100, -2600,  141,  450],   // low knob inside the meander
  ["Hemei Mtn 和美山",        2300, -3200,  152,  500],   // W bank of Bitan
  ["Xiao Shishan 小獅山",     3300, -3500,  221,  550],   // E bank of Bitan
];
```

### 3.2 Campus ridge spline (elevated ridgeline; `[x, z, crestElev_m]`)

```js
export const RIDGE = [
  [ 250, 1500, 500],  // off Tutan summit
  [ 200, 1100, 508],  // Tutan Mtn
  [ 100,  600, 490],
  [   0,    0, 482],  // CAMPUS PLATEAU
  [ 100, -500, 455],
  [ 250, -1100, 410], // villa terraces start (~) 
  [ 450, -1800, 330],
  [ 800, -2300, 220],
  [1500, -2800, 170],
  [2300, -3200, 152], // Hemei Mtn → drops to Bitan
];
```

### 3.3 Xindian River centerline (downstream order; `[x, z, waterElev_m, halfWidth_m]`)

Triple horseshoe meander wrapping the campus ridge from SE → E → NE, then the Bitan
gorge, then opening into the Taipei basin. ~ approximate but characteristic.

```js
export const RIVER = [
  [ 1600,  5200, 18, 60],  // from Qushi 屈尺 (upstream, off SE)
  [ 1100,  4300, 17, 60],
  [  700,  3600, 16, 60],  // Zhitan 直潭 reach (dam ~here, optional weir)
  [ 1000,  2800, 15, 65],
  [ 1900,  2400, 15, 65],  // swings E around the Tutan peninsula
  [ 2400,  1500, 14, 65],
  [ 2100,   600, 14, 70],  // Wantan 灣潭 horseshoe — comes back W toward the ridge
  [ 1300,   300, 13, 70],  // closest approach: ~1.3 km E of campus, 467 m below it
  [ 1200,  -700, 13, 70],
  [ 1900, -1300, 12, 75],  // Tutan 塗潭 horseshoe
  [ 2500, -2200, 11, 75],
  [ 2800, -3300, 10, 55],  // BITAN gorge (narrows between Hemei & Xiao Shishan)
  [ 3000, -4200,  9, 90],  // exits to basin (widens)
  [ 3200, -5600,  8, 110],
];
```

### 3.4 Flatten masks (plateaus carved into terrain; ellipse: center, rx, rz, rotY°, elev)

```js
export const PLATEAUS = [
  // campus main plateau — long axis along the ridge (NNE–SSW)
  { c: [0, 0],      rx: 110, rz: 175, rot: -15, elev: 480 },
  // track terrace, one level below, E side
  { c: [115, 30],   rx:  70, rz:  55, rot: -15, elev: 466 },
  // field-study terraces stepping down the E slope
  { c: [185, 150],  rx:  60, rz:  70, rot: -15, elev: 455 },
  // villa community terraces along the ridge N of campus (~)
  { c: [260, -1150], rx: 140, rz: 220, rot: -20, elev: 400 },
  { c: [480, -1850], rx: 120, rz: 200, rot: -25, elev: 320 },
];
```

### 3.5 Taipei basin (north horizon)

North of `z = −4200`, blend terrain down to a ~10 m plain. Fill it with hazy low-poly
city blocks (instanced boxes, 10–40 m tall, density fading with distance) and an
optional Taipei 101 silhouette (~508 m landmark tower) at `[4200, −10500]` — beyond
the terrain edge, rendered as a simple extruded silhouette so it reads on the horizon
from campus viewpoints. This matches the real view: the city opens up to the N/NE.

---

## 4. Terrain construction (`src/terrain.js`)

**Two nested static grids** (no runtime LOD needed):

| Tier | Size | Segments | Cell | Use |
|---|---|---|---|---|
| Inner | 3 km × 3 km | 768² | ~3.9 m | campus, meanders' near walls |
| Outer | 12 km × 12 km | 512² with inner hole (or full grid + y-offset −0.5 skirt overlap) | ~23 m | everything else |

Simplest seam handling: build outer at full 12 km and lower the inner tier 0.2 m into it…
no — **preferred:** outer grid is full 12 km *underneath* the inner tier; inner tier sits
on top with a 50 m edge blend of its heights toward the outer function (same function, so
they agree anyway — the blend just hides tessellation differences). Total ≈ 1.4 M tris. OK.

**Height function `h(x, z)`** (CPU, plain JS, deterministic seed):

```
h = basin(x,z)                       // smooth base: 60m valleys rising S/E/W, →10m N plain
  + Σ peaks: gaussian(h_i, r_i)      // use smooth max (softmax-ish) vs base, not plain add
  + ridgeSpline contribution         // distance-to-polyline crest lift, ~350m falloff width
  − riverCarve                       // V/U valley along RIVER polyline:
                                     //   depth to waterElev, U-floor halfWidth, 
                                     //   valley walls ~38° (tan ≈ 0.78), wall noise
  then: fBM detail (5 octaves simplex, amp 28m→1m, wavelength 1400m→40m),
        amplitude × slopeMask (less noise on valley floor & plateaus)
  then: PLATEAUS flatten (smoothstep ellipse mask → lerp to plateau elev)
  then: clamp ≥ riverElev−2 inside river floor
```

Calibration targets (assert these in a tiny test, `npm test` optional):
`h(0,0) ≈ 480 ±1`; `h(200,1100) ≈ 508 ±10`; `h(−2800,4200) ≈ 857 ±25`;
river floor at closest approach `h(1300,300) ≤ 15`; basin `h(0,−5500) ≤ 25`.

**Terrain material:** custom `onBeforeCompile` or ShaderMaterial splat by elevation+slope:
- river-flat: sediment/grass green-grey
- slopes < ~45°: dense forest green (two-tone noise mix, subtropical: warm dark greens)
- steep > ~50°: grey-brown rock/cliff striations (the meander cut-banks!)
- plateau masks: campus = pavement/grass mix handled by campus ground meshes instead
- N plain: grey urban tint
Add baked AO-ish valley darkening (cheap: darken by depth below local ridge average).
Vertex normals recomputed after displacement.

**River water** (`src/river.js`): ribbon geometry extruded along `RIVER` (Catmull-Rom,
halfWidth per point), y = waterElev + 0.5. Material: deep green-teal (Xindian River's
signature color), normal-perturbed by two scrolling procedural normal maps, fresnel-ish
reflectivity (MeshPhysicalMaterial or custom). Widen smoothly at Bitan exit. Add the
**Bitan suspension bridge** (~200 m span at `[2800,−3300]`): two pylons, catenary main
cables (TubeGeometry along curve), hangers (thin instanced cylinders), deck. Iconic —
worth the ~30 min. Optional: 直潭壩 weir line across the river at `[700,3600]`.

## 5. Campus model (`src/campus.js` + `src/campusKit.js`)

The campus is the hero. Budget the most effort here. Campus group: `rotation.y = −15°`
(buildings align with the plateau's long axis); positions below are **in the rotated
campus frame** `[x', z']` relative to plateau center, ground y = 480 unless noted.

### 5.1 Massing (~ approximate, characteristic of aerial views)

| ID | Element | Footprint | Height | Position [x', z'] | Notes |
|---|---|---|---|---|---|
| A1 | Main spine (academic) | 120 × 25 | 6 fl, 26 m + roof | [−20, −35] long axis N–S | castle spine |
| A2 | North wing | 60 × 22 | 5 fl, 22 m | [10, −85] E–W | forms C-shape opening **east** (toward the river view) |
| A3 | South wing | 60 × 22 | 5 fl, 22 m | [10, 15] E–W | " |
| A4 | Central tower | 18 × 18 | 45 m + spire | [−20, −35] | clock faces, pyramidal spire, finial |
| A5 | Corner turrets ×4 | ⌀ 6 | wing roof +6 m | wing/spine corners | conical caps |
| B | Gym + natatorium | 75 × 45 | 18 m | [−25, 65] | low-pitch barrel roof, clerestory band, skybridge to A3 |
| C | Dormitory | 65 × 20 | 7 fl, 24 m | [55, 105] (terrace 470, S edge) | simpler block, same palette |
| D | Performance hall | 45 × 35 | 16 m + 24 m flytower | [−65, −95] | |
| E | Entrance gatehouse + porte-cochère | 25 × 12 | 10 m | [0, −150] N end | arch, gates, flagpoles (ROC/school flags) |
| F | Library/admin link blocks | fill A-complex courtyard edges | 3–4 fl | between A1–A2–A3 | creates two courtyards |

### 5.2 Grounds

- **Track terrace** (elev 466, world-frame plateau #2): 200 m running track — straights
  ~50 m, overall ~95 × 60 m. Terracotta-red lanes (6, with painted lane lines via canvas
  texture), green turf infield with pitch markings, low fence, 4 floodlight masts,
  small grandstand against the upslope retaining wall.
- **Retaining walls**: every plateau edge gets stepped stone-textured walls (2–8 m) —
  this is what makes it read as a mountain campus from the air. Add guardrails.
- **Entrance road**: Huacheng Rd as a 7 m asphalt ribbon following the ridge spline from
  the villa terraces up to gatehouse E, with 3–4 switchbacks on the steeper pitch,
  retaining wall on the uphill side, white edge lines. A few bus-sized box vehicles
  (the school's orange shuttle buses ~) parked at the entrance loop.
- **Courtyards/plaza**: paved with light stone pattern, trees in planters, central
  circular motif in the entrance plaza.
- **Field-study area** (terrace 455 + slope below): pond (大湖, ~35 m irregular disc,
  same water material), terraced vegetable plots (strip geometry, soil/green rows),
  **cherry grove** (~60 instanced trees, pink canopy — instantly recognizable),
  archery range strip (lawn + 4 target butts), winding gravel trails, gazebo/platform.

### 5.3 Architectural detail kit (`campusKit.js`)

Parametric, reused across A–F:

- **Walls**: beige/cream stone — procedural canvas texture: ashlar block courses, subtle
  color jitter, darker plinth course at base, quoins (corner stones) as slightly
  protruding box strips on building corners.
- **Roofs**: steep hipped roofs (~45°), **dark slate grey-green**, generated as proper
  hip geometry (not pyramids on rectangles — write one helper that takes footprint
  rect + pitch and emits hip roof with overhang ~0.8 m). Dormers (3–5 per long face),
  ridge caps, finials on tower/turrets.
- **Windows**: arched on ground floor, rectangular 2×1.5 m above, in regular bays
  (~4 m spacing) — geometry: shallow inset boxes with dark glass material + light frame;
  a single InstancedMesh per building for all windows (compute bay grid from footprint).
  Slight emissive so facades don't go dead in shade.
- **Extras**: string-course bands between floors, balustraded parapets on link blocks,
  rooftop AHU boxes on B (it's central-A/C, flagged in sources), entrance arch with
  "康橋 KANG CHIAO" lettering (canvas texture plaque).

Target: campus alone ≈ 150–300 k tris, ≤ 40 draw calls (merge per-material with
`BufferGeometryUtils.mergeGeometries`, instanced windows/trees/lights).

### 5.4 Villa communities (~)

Along plateau masks #4–5: ~120 instanced villas (8 × 10 m, 2–3 fl, white/cream walls,
**terracotta hipped roofs**, random rot ±10° aligned to terrace contours), connecting
road, scattered trees. Low detail — they're midground context, not heroes.

## 6. Vegetation (`src/vegetation.js`)

- **Forest**: ~80–120 k instanced trees, 2 archetypes mixed: (a) broadleaf blob — 2–3
  merged distorted icospheres on a trunk, vertex-color variation; (b) slimmer conifer-ish
  cone for ridgelines. Place by rejection sampling: density = f(slope < 55°, elev < 800,
  outside plateaus/river/roads, fade in basin). Color jitter ±10 % hue, scale 6–14 m.
  Within ~600 m of origin use the full mesh archetype; beyond, swap to a cheaper
  2-tri crossed-billboard InstancedMesh with matching color (two instanced meshes total —
  keep it simple, no dynamic LOD).
- **Cherry grove**: pink-canopy variant clustered in the field-study terrace.
- **Campus trees**: individually placed rows along the entrance road and courtyards.

## 7. Atmosphere, lighting, sky (`src/sky.js`)

- `three/examples/jsm/objects/Sky.js`, sun elevation ~35°, azimuth from SE (morning light
  raking across the meanders). Hemisphere light (sky blue / forest green ground) +
  directional sun.
- **Shadows**: single 2048 cascade-free shadow map with tight ~700 m ortho frustum
  centered on campus (terrain receives, campus+trees near origin cast). Mountains get
  shading from normals + the valley-darkening term, not shadow maps.
- **Fog/haze**: `FogExp2` tuned so the 857 m Shizitou ridge reads as layered blue-grey
  silhouettes; extra white haze pooling in the basin to the north (cheap: large soft
  alpha plane at y≈60 over the basin, or height-fog term in the terrain shader).
  Subtropical humidity is the look — slightly hazy, never crystal clear.
- Optional toggle: late-afternoon preset (warm sun, longer shadows, campus windows glow).

## 8. App shell, cameras, UI (`src/main.js`)

- **Stack**: Vite + `three` (^0.184.0). `npm create` not needed — hand-write
  `package.json`, `index.html`, `vite.config.js` (set `base: './'` so `dist/` opens from
  file servers anywhere).
- Renderer: WebGLRenderer, ACES tone mapping, sRGB, shadows on, pixelRatio ≤ 2.
- **OrbitControls** with min/max distance (50…9000), max polar ~88°, damped.
- **Preset viewpoints** (buttons + keys 1–4), each a smooth tween (~2 s, manual lerp—no
  extra dep):
  1. *Campus aerial* (default): from ~[900, 1100, 700] looking at [0, 480, 0] — campus
     in foreground, 灣潭 meander and Bitan behind it, basin haze on the horizon. This is
     the money shot; tune everything for it.
  2. *Meander overlook*: above the river bend [1300, 700, 300] looking down-valley.
  3. *Bitan gorge*: low oblique at the suspension bridge.
  4. *Summit panorama*: from above Shizitou Mtn toward campus and Taipei.
- **lil-gui** (npm): fog density, time-of-day preset, vegetation density (rebuild),
  wireframe, FPS stats (drei not available — use `stats.js` or a simple counter).
- Loading: build terrain/vegetation in a few `setTimeout`-chunked steps with a minimal
  progress overlay so the tab doesn't freeze (~1–2 s total budget).

## 9. File structure

```
projects/xindian-mountains/
  PLAN.md                ← this file
  README.md              ← how to run + screenshot + data-fidelity disclaimer
  package.json  vite.config.js  index.html
  src/
    main.js  sky.js  terrain.js  river.js  campus.js  campusKit.js
    vegetation.js  villas.js  city.js  cameras.js  ui.js
    data/geo.js          ← §3 verbatim
    lib/noise.js         ← self-contained simplex (no extra dep) + seeded RNG
```

## 10. Milestones & acceptance

Build in this order; commit after each milestone (M1, M2… in the message):

- **M1 Scaffold + terrain**: grids, height function, calibration asserts pass, splat
  material, fog, orbit. *Accept:* meanders clearly read as three horseshoes around the
  ridge; campus plateau visibly flat at 480 m.
- **M2 River + Bitan**: water ribbon, gorge, bridge, basin blend, city blocks.
- **M3 Campus massing**: all §5.1 blocks + plateaus + retaining walls + track terrace.
  *Accept:* silhouette from preset cam 1 reads as a castle school on a ridge.
- **M4 Architectural detail**: kit (roofs/windows/tower/turrets), grounds, road, entrance.
- **M5 Vegetation + villas + cherry grove.**
- **M6 Atmosphere + presets + GUI + loading.**
- **M7 Polish & perf**: target 60 fps @1080p on a mid GPU, ≤ ~3 M tris, ≤ ~150 draw calls
  (check `renderer.info`), `npm run build` clean.

**Verification each milestone:** run `npm run dev`, capture screenshots from preset
cameras (headless: `npx playwright screenshot` if available, else the `verify`/`run`
harness skills), and actually look at them — the acceptance criteria above are visual.
Fix what looks wrong before moving on. In the final README, state plainly that terrain
and building layout are artistic reconstructions from public descriptions, not survey
data.
