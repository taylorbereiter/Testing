// ─────────────────────────────────────────────────────────────────────────────
// castle.js — builds the full-scale Kronborg / Elsinore model
// Layout (metres, x→east, z→south):
//   courtyard 50×40 around origin · wings 14 m deep, walls to 16 m, roofs to 23 m
//   Great Hall 62×11 m in the north wing · chapel in the south wing
//   casemates −4.2 m under the east wing · rampart ring (top +6 m) at |71..85|
//   moat |86..98| · bridge west · churchyard & willow south-west · sea east+north
// ─────────────────────────────────────────────────────────────────────────────
window.EC = window.EC || {};

EC.buildWorld = function (THREE, scene, quality) {
  const colliders = [];
  const flags = [];
  const lampPoints = [];
  const world = new THREE.Group();
  scene.add(world);

  // ── helpers ────────────────────────────────────────────────────────────────
  function addCollider(x0, x1, y0, y1, z0, z1) {
    colliders.push([Math.min(x0, x1), Math.max(x0, x1), y0, y1, Math.min(z0, z1), Math.max(z0, z1)]);
  }

  const matCache = {};
  function lam(color, opts) {
    const key = color + JSON.stringify(opts || {});
    if (!matCache[key]) matCache[key] = new THREE.MeshLambertMaterial(Object.assign({ color }, opts));
    return matCache[key];
  }

  function canvasTex(size, draw, repX, repY) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    draw(c.getContext('2d'), size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repX || 1, repY || 1);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  // sandstone wall texture
  const sandTex = canvasTex(256, (g, s) => {
    g.fillStyle = '#c7b594'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 420; i++) {
      g.fillStyle = `rgba(${150 + Math.random() * 60 | 0},${135 + Math.random() * 50 | 0},${100 + Math.random() * 45 | 0},0.25)`;
      g.fillRect(Math.random() * s, Math.random() * s, 2 + Math.random() * 8, 2 + Math.random() * 5);
    }
    g.strokeStyle = 'rgba(110,98,75,0.35)'; g.lineWidth = 1.4;
    for (let y = 0; y < s; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke(); }
    for (let y = 0; y < s; y += 22) for (let x = (y / 22 % 2) * 24; x < s; x += 48) {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 22); g.stroke();
    }
  }, 6, 3);
  const wallMat = new THREE.MeshLambertMaterial({ map: sandTex, color: 0xd8caa8 });

  // cobblestone ground texture
  const cobbleTex = canvasTex(256, (g, s) => {
    g.fillStyle = '#6e6a60'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 320; i++) {
      const v = 95 + Math.random() * 55 | 0;
      g.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
      g.beginPath();
      g.ellipse(Math.random() * s, Math.random() * s, 5 + Math.random() * 7, 4 + Math.random() * 6, Math.random() * 3, 0, 7);
      g.fill();
    }
  }, 14, 11);
  const cobbleMat = new THREE.MeshLambertMaterial({ map: cobbleTex });

  const grassMat = lam(0x5d7350);
  const earthMat = lam(0x6c7a55);
  const graniteMat = lam(0x6d6d6d);
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x3e8a72, side: THREE.DoubleSide }); // copper green
  const woodMat = lam(0x6a4a2e);
  const darkWoodMat = lam(0x4a3220);
  const stoneDarkMat = lam(0x4a4a4e);
  const goldMat = lam(0xc9a227, { emissive: 0x3a2c08 });

  function box(w, h, d, mat, x, y, z, opts) {
    opts = opts || {};
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    if (opts.ry) m.rotation.y = opts.ry;
    if (opts.rx) m.rotation.x = opts.rx;
    if (opts.rz) m.rotation.z = opts.rz;
    if (opts.shadow !== false && quality.shadows) { m.castShadow = true; m.receiveShadow = true; }
    world.add(m);
    if (opts.collide) addCollider(x - w / 2, x + w / 2, y - h / 2, y + h / 2, z - d / 2, z + d / 2);
    return m;
  }

  // axis-aligned wall slab from extents (adds collider)
  function slab(x0, x1, y0, y1, z0, z1, mat, opts) {
    return box(x1 - x0, y1 - y0, z1 - z0, mat || wallMat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2,
      Object.assign({ collide: true }, opts));
  }

  // triangular roof prism: width w along x, depth d along z, apex height h
  function roofPrism(w, d, h, x, y, z, ry) {
    const hw = w / 2, hd = d / 2;
    const v = [
      // front slope (z+)
      -hw, 0, hd, hw, 0, hd, hw, h, 0, -hw, 0, hd, hw, h, 0, -hw, h, 0,
      // back slope (z-)
      hw, 0, -hd, -hw, 0, -hd, -hw, h, 0, hw, 0, -hd, -hw, h, 0, hw, h, 0,
      // left gable
      -hw, 0, -hd, -hw, 0, hd, -hw, h, 0,
      // right gable
      hw, 0, hd, hw, 0, -hd, hw, h, 0,
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, roofMat);
    m.position.set(x, y, z);
    if (ry) m.rotation.y = ry;
    if (quality.shadows) m.castShadow = true;
    world.add(m);
    return m;
  }

  // ── ground, water, lands ───────────────────────────────────────────────────
  // the Sound (one big water plane; the moat shares its level — at Kronborg the
  // moats connect to the sea)
  const waterMat = new THREE.MeshLambertMaterial({ color: 0x2e4a5e, transparent: true, opacity: 0.92 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -1.7;
  world.add(water);

  // castle island (−86..86) with a hole for the casemate stair trench
  {
    const sh = new THREE.Shape();
    sh.moveTo(-86, -86); sh.lineTo(86, -86); sh.lineTo(86, 86); sh.lineTo(-86, 86); sh.closePath();
    const hole = new THREE.Path();
    hole.moveTo(16.8, 6.35); hole.lineTo(27.8, 6.35); hole.lineTo(27.8, 9.65); hole.lineTo(16.8, 9.65); hole.closePath();
    sh.holes.push(hole);
    const geo = new THREE.ShapeGeometry(sh);
    const m = new THREE.Mesh(geo, grassMat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0;
    if (quality.shadows) m.receiveShadow = true;
    world.add(m);
    // granite revetment skirt around the island
    slab(-86.4, 86.4, -3, 0.05, -86.4, -86, graniteMat, { collide: false });
    slab(-86.4, 86.4, -3, 0.05, 86, 86.4, graniteMat, { collide: false });
    slab(-86.4, -86, -3, 0.05, -86, 86, graniteMat, { collide: false });
    slab(86, 86.4, -3, 0.05, -86, 86, graniteMat, { collide: false });
  }

  // outer lands: west bank and south bank (the sea takes north & east)
  slab(-500, -98, -2.5, 0, -500, 500, grassMat, { collide: false, shadow: false });
  slab(-98, 500, -2.5, 0, 98, 500, grassMat, { collide: false, shadow: false });

  // Sweden on the horizon (Helsingborg is ~4 km across the Sound)
  box(80, 22, 900, lam(0x46586a), 470, 6, -150, { shadow: false });
  box(60, 30, 300, lam(0x46586a), 460, 8, -420, { shadow: false });

  // courtyard cobbles (split around the stair trench)
  function cobblePlane(x0, x1, z0, z1, y) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), cobbleMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    if (quality.shadows) m.receiveShadow = true;
    world.add(m);
  }
  cobblePlane(-25, 16.6, -20, 20, 0.03);
  cobblePlane(16.6, 25, -20, 6.3, 0.03);
  cobblePlane(16.6, 25, 9.7, 20, 0.03);
  // gate road: tunnel → bridge
  cobblePlane(-86, -25, -3.5, 3.5, 0.03);

  // ── the four wings ─────────────────────────────────────────────────────────
  const H = 16; // wall height

  // NORTH WING — contains the Great Hall (62×11 m interior)
  slab(-39, 39, 0, H, -34, -32.5);                    // outer wall
  slab(-39, -2, 0, H, -21.5, -20);                    // inner wall, west of door
  slab(2, 39, 0, H, -21.5, -20);                      // inner wall, east of door
  slab(-2, 2, 5, H, -21.5, -20);                      // lintel over hall door
  slab(-39, -31, 0, H, -32.5, -21.5);                 // west end block
  slab(31, 39, 0, H, -32.5, -21.5);                   // east end block
  slab(-31, 31, 8, 9, -32.5, -21.5, stoneDarkMat, { collide: false }); // hall ceiling
  roofPrism(78, 14, 7, 0, H, -27);

  // SOUTH WING — chapel in the east half (interior x 2..36)
  slab(-39, 39, 0, H, 32.5, 34);                      // outer wall
  slab(-39, 2, 0, H, 20, 34);                         // solid west block
  slab(2, 6, 0, H, 20, 21.5);                         // inner wall, west of chapel door
  slab(10, 36, 0, H, 20, 21.5);                       // inner wall, east of chapel door
  slab(6, 10, 5, H, 20, 21.5);                        // lintel over chapel door
  slab(36, 39, 0, H, 20, 34);                         // east end block
  slab(2, 36, 8, 9, 21.5, 32.5, stoneDarkMat, { collide: false }); // chapel ceiling
  roofPrism(78, 14, 7, 0, H, 27);

  // WEST WING — the Dark Gate passes through at |z| < 3
  slab(-39, -25, 0, H, -20, -3);
  slab(-39, -25, 0, H, 3, 20);
  slab(-39, -25, 5, H, -3, 3);                        // over the gate tunnel
  roofPrism(40, 14, 7, -32, H, 0, Math.PI / 2);

  // EAST WING — solid above ground; casemates below
  slab(25, 39, 0, H, -20, 20);
  roofPrism(40, 14, 7, 32, H, 0, Math.PI / 2);

  // plinth (granite skirting) around the outer footprint
  for (const [x0, x1, z0, z1] of [
    [-39.4, 39.4, -34.4, -33.9], [-39.4, 39.4, 33.9, 34.4],
    [-39.4, -38.9, -34.4, 34.4], [38.9, 39.4, -34.4, 34.4],
  ]) slab(x0, x1, 0, 1.5, z0, z1, graniteMat, { collide: false });

  // cornice bands
  for (const r of [[-39.2, 39.2, -34.2, -32.4], [-39.2, 39.2, 32.4, 34.2], [-39.2, -24.8, -20.2, 20.2], [24.8, 39.2, -20.2, 20.2]]) {
    slab(r[0], r[1], 15.3, 15.8, r[2], r[3], lam(0xe6dcc2), { collide: false, shadow: false });
  }

  // gate arch dressing + dedication plaque
  box(1.6, 10, 10, graniteMat, -39.3, 5, 0, { collide: false });
  box(1.7, 5.2, 6.4, stoneDarkMat, -39.35, 2.6, 0, { collide: false });
  // (the dark opening itself)
  {
    const plaqueTex = canvasTex(512, (g, s) => {
      g.fillStyle = '#9a8a66'; g.fillRect(0, 0, s, s);
      g.fillStyle = '#3a3020';
      g.font = 'bold 56px Georgia, serif'; g.textAlign = 'center';
      g.fillText('KRONBORG', s / 2, 150);
      g.font = '34px Georgia, serif';
      g.fillText('FRIDERICVS · II · REX · DANIÆ', s / 2, 250);
      g.fillText('ANNO · MDLXXXV', s / 2, 320);
      g.font = 'italic 30px Georgia, serif';
      g.fillText('“Welcome to Elsinore”', s / 2, 420);
    });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshLambertMaterial({ map: plaqueTex }));
    p.position.set(-39.45, 9.5, 0);
    p.rotation.y = -Math.PI / 2;
    world.add(p);
  }

  // ── corner towers ──────────────────────────────────────────────────────────
  function towerRound(x, z, r, h, spireH, name) {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.06, h, 14), wallMat);
    cyl.position.set(x, h / 2, z);
    if (quality.shadows) { cyl.castShadow = true; cyl.receiveShadow = true; }
    world.add(cyl);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.18, r * 1.18, 1.2, 14), lam(0xe6dcc2));
    rim.position.set(x, h, z);
    world.add(rim);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r * 1.12, spireH, 14), roofMat);
    cone.position.set(x, h + 0.6 + spireH / 2, z);
    if (quality.shadows) cone.castShadow = true;
    world.add(cone);
    // gilt finial
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), lam(0xd8b84a, { emissive: 0x553f08 }));
    fin.position.set(x, h + 0.6 + spireH + 0.4, z);
    world.add(fin);
    addCollider(x - r, x + r, 0, h, z - r, z + r);
  }
  towerRound(-38, 33, 5.5, 34, 20, 'Trumpeter’s Tower');   // SW — the tall spire (~62 m total in reality)
  towerRound(-38, -33, 4.5, 22, 11, 'King’s Tower');       // NW
  towerRound(38, 33, 4.5, 22, 11, 'Queen’s Tower');        // SE

  // Telegraph Tower (NE) — square, flat-topped, flies the Dannebrog
  slab(33, 43, 0, 24, -38, -28);
  slab(32.6, 43.4, 24, 25.4, -38.4, -27.6, lam(0xe6dcc2), { collide: false });
  flagPole(38, -33, 25.4, 8);

  function flagPole(x, z, baseY, h) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, h, 6), lam(0xcccccc));
    pole.position.set(x, baseY + h / 2, z);
    world.add(pole);
    const flagTex = canvasTex(128, (g, s) => {
      g.fillStyle = '#c8102e'; g.fillRect(0, 0, s, s);
      g.fillStyle = '#fff';
      g.fillRect(s * 0.28, 0, s * 0.14, s);
      g.fillRect(0, s * 0.43, s, s * 0.14);
    });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.9),
      new THREE.MeshLambertMaterial({ map: flagTex, side: THREE.DoubleSide }));
    flag.position.set(x + 1.35, baseY + h - 1.2, z);
    world.add(flag);
    flags.push(flag);
  }

  // ── windows (instanced) ────────────────────────────────────────────────────
  {
    const slots = [];
    function rowAlong(x0, z0, x1, z1, nx, nz, skip) {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const n = Math.floor(len / 5);
      for (let i = 0; i <= n; i++) {
        const t = n === 0 ? 0.5 : i / n;
        const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
        if (skip && skip(x, z)) continue;
        for (const y of [3.6, 8.2, 12.6]) slots.push([x + nx * 0.12, y, z + nz * 0.12, Math.atan2(nx, nz)]);
      }
    }
    // outer facades
    rowAlong(-35, -34, 35, -34, 0, -1);
    rowAlong(-35, 34, 35, 34, 0, 1);
    rowAlong(-39, -28, -39, 28, -1, 0, (x, z) => Math.abs(z) < 5);
    rowAlong(39, -25, 39, 25, 1, 0);
    // courtyard facades
    rowAlong(-21, -20, 21, -20, 0, 1, (x) => Math.abs(x) < 3.4);
    rowAlong(-21, 20, 21, 20, 0, -1, (x) => x > 4.5 && x < 11.5);
    rowAlong(-25, -16, -25, 16, 1, 0, (x, z) => Math.abs(z) < 4.5);
    rowAlong(25, -16, 25, 16, -1, 0, (x, z) => Math.abs(z - 8) < 2.5);
    const frameGeo = new THREE.BoxGeometry(1.7, 2.7, 0.18);
    const glassGeo = new THREE.BoxGeometry(1.35, 2.35, 0.14);
    const frameMat = lam(0xe2d6b8);
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x222c38, emissive: 0xffb45e, emissiveIntensity: 0 });
    const fi = new THREE.InstancedMesh(frameGeo, frameMat, slots.length);
    const gi = new THREE.InstancedMesh(glassGeo, glassMat, slots.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
    slots.forEach(([x, y, z, ry], i) => {
      q.setFromAxisAngle(up, ry);
      m4.compose(new THREE.Vector3(x, y, z), q, one);
      fi.setMatrixAt(i, m4);
      gi.setMatrixAt(i, m4);
    });
    world.add(fi); world.add(gi);
    EC._glassMat = glassMat; // night-time lit windows
  }

  // ── courtyard: fountain, lamps, benches ────────────────────────────────────
  {
    // the famous fountain (looted by Sweden, 1658)
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.2, 0.9, 18), graniteMat);
    basin.position.set(0, 0.45, 4);
    world.add(basin);
    addCollider(-3.1, 3.1, 0, 1.2, 0.9, 7.1);
    const fwater = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.1, 18), lam(0x3e6a80, { transparent: true, opacity: 0.9 }));
    fwater.position.set(0, 0.82, 4);
    world.add(fwater);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 2.4, 10), graniteMat);
    ped.position.set(0, 1.9, 4);
    world.add(ped);
    const fig = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 8), lam(0x7c9c5a)); // weathered bronze
    fig.position.set(0, 3.8, 4);
    world.add(fig);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lam(0x7c9c5a));
    orb.position.set(0, 4.7, 4);
    world.add(orb);
  }
  const lanternMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a, emissive: 0xffc878, emissiveIntensity: 0 });
  function lampPost(x, z) {
    box(0.18, 3.4, 0.18, stoneDarkMat, x, 1.7, z, { collide: true });
    box(0.5, 0.7, 0.5, lanternMat, x, 3.55, z, { collide: false });
    lampPoints.push({ x, y: 3.6, z, color: 0xffc070, intensity: 26, range: 22, nightOnly: true });
  }
  lampPost(-11, -11); lampPost(11, -11); lampPost(-11, 13); lampPost(11, 13);
  box(2.4, 0.5, 0.6, woodMat, -22, 0.25, -10, { collide: true });
  box(2.4, 0.5, 0.6, woodMat, 22.2, 0.25, 12, { collide: true });

  // ── Great Hall interior ────────────────────────────────────────────────────
  {
    const woodFloor = new THREE.Mesh(new THREE.PlaneGeometry(62, 11), lam(0x7a5a38));
    woodFloor.rotation.x = -Math.PI / 2;
    woodFloor.position.set(0, 0.04, -27);
    world.add(woodFloor);
    // dais + thrones (east end)
    slab(25.5, 30.5, 0, 0.45, -29.5, -24.5, darkWoodMat);
    for (const tz of [-28.2, -25.8] ) {
      box(1.1, 1.1, 1.1, lam(0x8a1822), 28.8, 1.0, tz, { collide: false });
      box(1.1, 2.4, 0.25, lam(0x8a1822), 29.4, 1.65, tz, { collide: false });
      box(1.2, 0.18, 1.2, lam(0xc9a227), 28.8, 0.55, tz, { collide: false });
    }
    // long banquet table + benches
    slab(-10, 14, 0.9, 1.05, -27.8, -26.2, woodMat);
    box(0.3, 0.9, 1.4, woodMat, -9, 0.45, -27, { collide: false });
    box(0.3, 0.9, 1.4, woodMat, 13, 0.45, -27, { collide: false });
    slab(-10, 14, 0.3, 0.5, -29.3, -28.8, woodMat);
    slab(-10, 14, 0.3, 0.5, -25.2, -24.7, woodMat);
    // the Mousetrap stage (west end)
    slab(-30.5, -24, 0, 0.6, -30.5, -23.5, darkWoodMat);
    // backdrop curtain
    box(0.2, 4, 6.5, lam(0x6e1220), -30.3, 2.6, -27, { collide: false });
    // tapestries — the "arras"
    const tapCols = [0x5a3a52, 0x3a5a46, 0x6e3a2a, 0x3a4a6a, 0x6a5a2a];
    tapCols.forEach((c, i) => {
      const t = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.6), lam(c));
      t.position.set(-22 + i * 11, 4.4, -32.4);
      world.add(t);
    });
    // chandeliers (always-lit candles)
    for (const cx of [-18, 0, 18]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.09, 6, 14), darkWoodMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(cx, 6, -27);
      world.add(ring);
      const candles = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.22, 10),
        lam(0xffe0a0, { emissive: 0xffc878, emissiveIntensity: 0.85 }));
      candles.position.set(cx, 6.15, -27);
      world.add(candles);
    }
    lampPoints.push({ x: 0, y: 5.5, z: -27, color: 0xffc888, intensity: 60, range: 38, nightOnly: false });
  }

  // ── Chapel interior ────────────────────────────────────────────────────────
  {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 11), lam(0x8a8278));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(19, 0.04, 27);
    world.add(floor);
    // carved oak pews (the 1582 originals survive at Kronborg)
    for (const bx of [12, 16, 20, 24]) {
      slab(bx - 0.35, bx + 0.35, 0.3, 1.0, 22, 26, darkWoodMat);
      slab(bx - 0.35, bx + 0.35, 0.3, 1.0, 28, 32, darkWoodMat);
    }
    // altar
    slab(32.5, 35, 0.9, 1.15, 25.5, 28.5, darkWoodMat);
    box(0.18, 1.5, 0.18, goldMat, 33.7, 1.95, 27, { collide: false });
    box(0.8, 0.18, 0.18, goldMat, 33.7, 2.3, 27, { collide: false });
    for (const cz of [25.8, 28.2]) {
      box(0.12, 0.7, 0.12, lam(0xf0e0c0, { emissive: 0xffd890, emissiveIntensity: 0.9 }), 33.7, 1.55, cz, { collide: false });
    }
    // gallery rail along the back (west)
    slab(2.2, 2.6, 0, 3.2, 22, 32, darkWoodMat, { collide: false });
    // stained-glass windows (south interior wall)
    const glassCols = [0xc04040, 0x4060c0, 0xc0a040, 0x40a060];
    glassCols.forEach((c, i) => {
      const gmat = new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.55 });
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.4), gmat);
      w.position.set(8 + i * 7, 4.4, 32.4);
      w.rotation.y = Math.PI;
      world.add(w);
    });
    lampPoints.push({ x: 28, y: 4, z: 27, color: 0xffd8a0, intensity: 40, range: 26, nightOnly: false });
  }

  // ── casemates (under the east wing) ───────────────────────────────────────
  {
    const FY = -4.2, CY2 = -0.8;
    // floor + ceiling
    slab(26.5, 39, FY - 0.3, FY, -16, 16, stoneDarkMat, { collide: false });
    slab(26.5, 39, CY2, CY2 + 0.4, -16, 16, stoneDarkMat, { collide: false });
    // perimeter walls (opening on the west at the stair, z 6.5..9.5)
    slab(26.5, 27.5, FY, CY2, -16, 6.4);
    slab(26.5, 27.5, FY, CY2, 9.6, 16);
    slab(38, 39, FY, CY2, -16, 16);
    slab(26.5, 39, FY, CY2, -16, -15);
    slab(26.5, 39, FY, CY2, 15, 16);
    // vault pillars
    for (const pz of [-8, 0, 8]) box(1, 3.4, 1, stoneDarkMat, 33, FY + 1.7, pz, { collide: true });
    // stair trench: steps from courtyard (x 17 → 27.5, z 6.5..9.5)
    const steps = 14;
    for (let i = 0; i < steps; i++) {
      const x0 = 17 + (10.5 / steps) * i;
      const y = -(4.2 / steps) * (i + 1);
      slab(x0, x0 + 10.5 / steps + 0.02, y, y + 4.2 / steps + 0.02, 6.5, 9.5, stoneDarkMat, { collide: false, shadow: false });
    }
    // trench side walls with a low parapet above ground
    slab(16.6, 27.8, -4.4, 1.0, 6.1, 6.5, graniteMat);
    slab(16.6, 27.8, -4.4, 1.0, 9.5, 9.9, graniteMat);
    // Holger Danske — the sleeping hero
    box(2.4, 0.8, 2.4, stoneDarkMat, 32, FY + 0.4, -2, { collide: true });           // plinth
    const hd = lam(0x5a6258);
    box(1.4, 1.1, 1.0, hd, 32, FY + 1.35, -2, { collide: false });                    // seated body
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 10), hd);
    head.position.set(32, FY + 2.1, -2.25);
    world.add(head);
    box(0.16, 0.5, 0.16, hd, 32, FY + 2.0, -2.05, { collide: false });                // beard into the table
    box(1.9, 0.14, 0.3, hd, 32, FY + 1.0, -1.45, { collide: false });                 // sword across the lap
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12), hd);
    shield.rotation.z = Math.PI / 2;
    shield.position.set(31.2, FY + 1.2, -2.4);
    world.add(shield);
    // barrels & stores
    for (const [bx, bz] of [[36, 12], [36.8, 10.8], [28, -12], [29, -13.2]]) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.0, 10), woodMat);
      b.position.set(bx, FY + 0.5, bz);
      world.add(b);
      addCollider(bx - 0.5, bx + 0.5, FY, FY + 1, bz - 0.5, bz + 0.5);
    }
    lampPoints.push({ x: 31, y: FY + 2.6, z: -2, color: 0xff9850, intensity: 22, range: 16, nightOnly: false });
  }

  // ── ramparts, parapets, ramps, cannons ─────────────────────────────────────
  const RT = 6; // rampart top height
  slab(-85, 85, 0, RT, -85, -71, earthMat);                  // north
  slab(-85, 85, 0, RT, 71, 85, earthMat);                    // south
  slab(71, 85, 0, RT, -71, 71, earthMat);                    // east
  slab(-85, -71, 0, RT, -71, -8, earthMat);                  // west (gap for the road)
  slab(-85, -71, 0, RT, 8, 71, earthMat);
  // gap cheek walls
  slab(-85, -71, 0, RT + 1.2, -8.5, -8, graniteMat);
  slab(-85, -71, 0, RT + 1.2, 8, 8.5, graniteMat);

  // outer parapet with merlons (skip the west gap)
  function parapetRun(x0, z0, x1, z1) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const ux = (x1 - x0) / len, uz = (z1 - z0) / len;
    // continuous breastwork
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const w = Math.abs(x1 - x0) || 0.6, d = Math.abs(z1 - z0) || 0.6;
    box(Math.max(w, 0.6), 1.1, Math.max(d, 0.6), graniteMat, cx, RT + 0.55, cz, { collide: true });
    for (let t = 1.5; t < len; t += 3.2) {
      box(ux ? 1.6 : 0.7, 0.6, uz ? 1.6 : 0.7, graniteMat, x0 + ux * t, RT + 1.35, z0 + uz * t, { collide: false, shadow: false });
    }
  }
  parapetRun(-84.7, -84.7, -84.7, -9);   // west outer N section
  parapetRun(-84.7, 9, -84.7, 84.7);     // west outer S section
  parapetRun(-84.7, -84.7, 84.7, -84.7); // north outer
  parapetRun(-84.7, 84.7, 84.7, 84.7);   // south outer
  parapetRun(84.7, -84.7, 84.7, 84.7);   // east outer — the gun battery

  // access ramps (north & south) — walkable via groundHeightAt
  {
    const len = Math.hypot(23, RT);
    const ang = Math.atan2(RT, 23);
    box(8, 0.5, len, earthMat, 20, RT / 2 - 0.05, -59.5, { rx: ang, collide: false });
    box(8, 0.5, len, earthMat, -20, RT / 2 - 0.05, 59.5, { rx: -ang, collide: false });
  }

  // cannons on the east battery, facing the Sound
  for (let z = -50; z <= 50; z += 20) {
    const g = new THREE.Group();
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 3.2, 10), lam(0x222226));
    barrel.rotation.z = -Math.PI / 2 + 0.06;
    barrel.position.set(0.8, 1.05, 0);
    g.add(barrel);
    const carriage = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.9), darkWoodMat);
    carriage.position.set(0, 0.55, 0);
    g.add(carriage);
    for (const s of [-0.5, 0.5]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 10), darkWoodMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(-0.2, 0.45, s * 0.55);
      g.add(wheel);
    }
    g.position.set(82, RT, z);
    world.add(g);
    addCollider(80.8, 83.4, RT, RT + 1.4, z - 0.8, z + 0.8);
  }
  flagPole(82, 0, RT + 1.2, 7);

  // ── moat bridge ───────────────────────────────────────────────────────────
  slab(-103, -82, 0, 0.35, -4, 4, woodMat, { collide: false });
  slab(-103, -82, 0.35, 1.45, -4.3, -4, darkWoodMat);   // railings
  slab(-103, -82, 0.35, 1.45, 4, 4.3, darkWoodMat);
  for (let x = -101; x <= -84; x += 4.2) {
    box(0.5, 2.4, 0.5, darkWoodMat, x, -0.5, -4.15, { collide: false });
    box(0.5, 2.4, 0.5, darkWoodMat, x, -0.5, 4.15, { collide: false });
  }

  // ── garden (south apron) ──────────────────────────────────────────────────
  {
    const hedge = lam(0x3e5e34);
    slab(2, 22, 0, 1.1, 44, 44.6, hedge);
    slab(2, 22, 0, 1.1, 55.4, 56, hedge);
    slab(2, 2.6, 0, 1.1, 44, 49.5, hedge);
    slab(2, 2.6, 0, 1.1, 52.5, 56, hedge);
    slab(21.4, 22, 0, 1.1, 44, 49.5, hedge);
    slab(21.4, 22, 0, 1.1, 52.5, 56, hedge);
    // flower beds
    const flowerCols = [0xc05070, 0xd0c050, 0x9060c0, 0xe0e0e0, 0x5080c0];
    for (let i = 0; i < 40; i++) {
      const fx = 4 + Math.random() * 16, fz = 45.5 + Math.random() * 9;
      if (fx > 5 && fx < 19 && fz > 47 && fz < 53 && Math.random() < 0.5) continue; // keep paths open
      box(0.22, 0.5, 0.22, lam(flowerCols[i % 5]), fx, 0.3, fz, { collide: false, shadow: false });
    }
    box(2.2, 0.5, 0.6, woodMat, 12, 0.25, 54.6, { collide: true });
  }

  // ── trees ─────────────────────────────────────────────────────────────────
  function tree(x, z, s) {
    s = s || 1;
    box(0.5 * s, 3 * s, 0.5 * s, lam(0x4a3424), x, 1.5 * s, z, { collide: true });
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(2.2 * s, 8, 8), lam(0x44663a));
    c1.position.set(x, 4.2 * s, z);
    if (quality.shadows) c1.castShadow = true;
    world.add(c1);
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(1.5 * s, 8, 8), lam(0x4e7040));
    c2.position.set(x + 1.1 * s, 5.2 * s, z + 0.5 * s);
    world.add(c2);
  }
  tree(-46, -30, 1.1); tree(-46, 32, 1); tree(46, -32, 0.9); tree(36, 46, 0.9);
  tree(-120, 30, 1.2); tree(-130, 80, 1.3); tree(-40, 130, 1.2); tree(20, 120, 1.4);

  // Ophelia's willow, aslant the moat
  {
    const x = -48, z = 103;
    box(0.6, 4.2, 0.6, lam(0x5a4a34), x, 2.1, z, { collide: true, ry: 0.2 });
    for (const [dx, dz, r, h] of [[0, 0, 2.6, 3.4], [1.6, 0.8, 1.8, 2.8], [-1.5, -0.6, 1.7, 2.6]]) {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(r, h, 9), lam(0x7a9a62));
      cap.position.set(x + dx, 5.2, z + dz);
      world.add(cap);
    }
  }

  // ── churchyard (south-west, outside the moat) ─────────────────────────────
  {
    const fence = darkWoodMat;
    function fenceRun(x0, z0, x1, z1) { slab(Math.min(x0, x1), Math.max(x0, x1) + 0.2, 0, 0.9, Math.min(z0, z1), Math.max(z0, z1) + 0.2, fence); }
    fenceRun(-74, 102, -64.5, 102); fenceRun(-57.5, 102, -50, 102);       // north fence with gap
    fenceRun(-74, 118, -50, 118);
    fenceRun(-74, 102, -74, 107.5); fenceRun(-74, 112.5, -74, 118);       // west fence with gap
    fenceRun(-50, 102, -50, 118);
    // gravestones
    const gsMat = lam(0x8a8a86);
    const places = [[-71, 105], [-67, 106.5], [-63, 104.5], [-58, 106], [-54, 105], [-70, 112], [-66.5, 113.5], [-53, 112], [-56.5, 114], [-71.5, 116], [-52, 116.5]];
    places.forEach(([gx, gz], i) => {
      box(0.8, 1.1, 0.22, gsMat, gx, 0.55, gz, { collide: true, ry: (i % 5 - 2) * 0.08, rz: (i % 3 - 1) * 0.05 });
    });
    // the open grave (Ophelia's) + spoil heap
    const pit = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), lam(0x14100c));
    pit.rotation.x = -Math.PI / 2;
    pit.position.set(-62, 0.05, 110.5);
    world.add(pit);
    const mound = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), lam(0x4e3e2a));
    mound.scale.set(1.4, 0.45, 0.9);
    mound.position.set(-62, 0.18, 112.2);
    world.add(mound);
    // Yorick
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), lam(0xd8d0c0));
    skull.position.set(-61, 0.16, 109.6);
    world.add(skull);
    // small wooden crosses
    for (const [cx, cz] of [[-60, 113.5], [-68, 109]]) {
      box(0.1, 1.0, 0.1, darkWoodMat, cx, 0.5, cz, { collide: false });
      box(0.55, 0.1, 0.1, darkWoodMat, cx, 0.75, cz, { collide: false });
    }
  }

  // ── ground height & zones ─────────────────────────────────────────────────
  function groundHeightAt(x, z) {
    // casemate room
    if (x > 27.5 && x < 38 && z > -15 && z < 15) return -4.2;
    // casemate stair trench
    if (x >= 16.8 && x <= 27.5 && z > 6.4 && z < 9.6) {
      const t = Math.min(1, Math.max(0, (x - 17) / 10.5));
      return -4.2 * t;
    }
    // rampart access ramps
    if (x >= 16 && x <= 24 && z <= -48 && z >= -71) return RT * Math.min(1, (-z - 48) / 23);
    if (x >= -24 && x <= -16 && z >= 48 && z <= 71) return RT * Math.min(1, (z - 48) / 23);
    // rampart ring (west gap at |z| < 8)
    const ax = Math.abs(x), az = Math.abs(z);
    if (ax <= 85 && az <= 85 && (ax >= 71 || az >= 71)) {
      if (x <= -71 && az < 8) return 0; // the road gap
      return RT;
    }
    // bridge deck
    if (az < 4 && x >= -103 && x <= -82) return 0.35;
    // castle island
    if (ax <= 86 && az <= 86) return 0;
    // outer lands (west & south); everything else is the Sound
    if (x <= -98 || z >= 98) return 0;
    return -1.7;
  }

  function zoneAt(x, z, y) {
    if (y < -1.5) return 'The Casemates';
    if (x > -31 && x < 31 && z > -32.5 && z < -21.5) return 'The Great Hall (Ballroom)';
    if (x > 2 && x < 36 && z > 21.5 && z < 32.5) return 'The Chapel';
    if (x > -39 && x < -25 && Math.abs(z) < 3) return 'The Dark Gate';
    if (Math.abs(x) < 25 && Math.abs(z) < 20) return 'The Courtyard';
    if (Math.abs(z) < 4.2 && x >= -103 && x <= -82) return 'The Bridge over the Moat';
    if (x > 2 && x < 22 && z > 44 && z < 56) return 'The Queen’s Garden';
    if (x > -74 && x < -50 && z > 102 && z < 118) return 'The Churchyard';
    if (y > 4) {
      if (x > 71) return 'The Gun Battery — “the platform”';
      return 'The Ramparts';
    }
    if (Math.abs(x) <= 86 && Math.abs(z) <= 86) return 'The Castle Grounds';
    return 'Outside the Walls — by the Øresund';
  }

  return { colliders, groundHeightAt, zoneAt, flags, lampPoints, waterMat, glassMat: EC._glassMat, lanternMat };
};
