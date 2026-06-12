// An anatomically correct American cockroach (Periplaneta americana) having a
// nice time at a Taiwan night market. All geometry is procedural; all textures
// are generated on <canvas> — no assets beyond three.js itself.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ---------------------------------------------------------------- renderer --

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0a14);
scene.fog = new THREE.FogExp2(0x0b0a14, 0.022);

// Subtle environment so clearcoat chitin, wet asphalt and puddles have
// something to reflect at night.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.25;

const camera = new THREE.PerspectiveCamera(
  50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4.5, 2.6, 6.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.1, 1.6);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 1.5;
controls.maxDistance = 18;

window.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') controls.autoRotate = !controls.autoRotate;
});
controls.autoRotateSpeed = 0.6;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Everything the animate loop touches registers itself here.
const anim = {
  antennaL: [], antennaR: [],
  palps: [],
  head: null,
  cerci: [],
  roach: null,
  skewer: null,
  frontLegs: [],
  tapTarsus: null,
  lanterns: [],
  steams: [],
  flickerMats: [],
  coalMat: null,
};

// ---------------------------------------------------------------- lighting --

scene.add(new THREE.HemisphereLight(0x2a2a4a, 0x1a0f0a, 0.5));

// Warm key light = the big stall bulb; the only shadow caster.
const key = new THREE.SpotLight(0xffd9a0, 60, 30, Math.PI / 4, 0.5, 1.6);
key.position.set(3.5, 6, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0004;
key.target.position.set(0, 0, 1.5);
scene.add(key, key.target);

function pointGlow(color, intensity, dist, x, y, z) {
  const l = new THREE.PointLight(color, intensity, dist, 2);
  l.position.set(x, y, z);
  scene.add(l);
  return l;
}
// Budget: hemi + key + these six.
pointGlow(0xff5522, 10, 7, -1.5, 3.6, 1.0);   // hero lantern, front string
pointGlow(0xff5522, 10, 7, 1.8, 3.6, -2.0);   // hero lantern, back string
pointGlow(0xff7733, 6, 5, 0, 3.4, 4.5);       // lantern over the table
pointGlow(0xffc46b, 14, 8, -4.0, 2.4, 0);     // tofu stall glow
pointGlow(0x77ddff, 10, 8, 4.0, 2.4, -1.0);   // bubble-tea stall glow
pointGlow(0xff9944, 8, 6, -3.8, 1.1, 0.6);    // grill coals glow

// ---------------------------------------------------- procedural textures --

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Pronotum: pale yellow border ring with the big dark central blotch that is
// the P. americana field mark.
const pronotumTex = canvasTex(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#c9974f';
  ctx.fillRect(0, 0, w, h);
  const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, 200);
  grad.addColorStop(0, '#3a1c08');
  grad.addColorStop(0.62, '#4a2410');
  grad.addColorStop(0.78, '#7a4a1c');
  grad.addColorStop(1, '#d8b06a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, 210, 230, 0, 0, Math.PI * 2);
  ctx.fill();
  // two faint pale spots inside the blotch
  ctx.fillStyle = 'rgba(216,176,106,0.35)';
  ctx.beginPath(); ctx.ellipse(w * 0.38, h * 0.42, 28, 40, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w * 0.62, h * 0.42, 28, 40, -0.3, 0, Math.PI * 2); ctx.fill();
});

// Tegmina (forewing) veins.
const wingTex = canvasTex(256, 512, (ctx, w, h) => {
  ctx.fillStyle = '#6b3a14';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(40,18,5,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 10);
    ctx.quadraticCurveTo(w * (0.1 + i * 0.1), h * 0.45, w * (0.05 + i * 0.11), h - 8);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
  for (let i = 0; i < 26; i++) {
    const y = 30 + i * 18;
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.quadraticCurveTo(w / 2, y + 12, w - 8, y - 6);
    ctx.stroke();
  }
});

const steamTex = canvasTex(128, 128, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
});

// Vertical neon sign: one glowing character per row.
function signTex(text, color) {
  return canvasTex(256, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#0d0a08';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.shadowColor = color;
    ctx.shadowBlur = 26;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.fillStyle = color;
    ctx.font = 'bold 150px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = [...text];
    const step = (h - 120) / chars.length;
    chars.forEach((ch, i) => {
      ctx.fillText(ch, w / 2, 80 + step * (i + 0.5));
    });
  });
}

function bannerTex(text, color) {
  return canvasTex(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = '#120a0a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.font = 'bold 170px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + 8);
  });
}

const stripeTex = canvasTex(256, 256, (ctx, w, h) => {
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? '#b3322a' : '#cfc5ae';
    ctx.fillRect((w / 8) * i, 0, w / 8, h);
  }
});

const windowTex = canvasTex(256, 512, (ctx, w, h) => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  for (let y = 24; y < h - 20; y += 44) {
    for (let x = 18; x < w - 20; x += 38) {
      if (Math.random() < 0.42) {
        ctx.fillStyle = Math.random() < 0.8 ? '#ffcf8e' : '#9fd8ff';
        ctx.fillRect(x, y, 20, 26);
      }
    }
  }
});

// --------------------------------------------------------------- materials --

const chitinMat = new THREE.MeshPhysicalMaterial({
  color: 0x5c2e0e, roughness: 0.45, clearcoat: 1.0, clearcoatRoughness: 0.15,
});
const chitinDarkMat = new THREE.MeshPhysicalMaterial({
  color: 0x3c1c08, roughness: 0.5, clearcoat: 0.8, clearcoatRoughness: 0.2,
});
const pronotumMat = new THREE.MeshPhysicalMaterial({
  map: pronotumTex, roughness: 0.4, clearcoat: 1.0, clearcoatRoughness: 0.12,
});
const wingMat = new THREE.MeshPhysicalMaterial({
  map: wingTex, roughness: 0.45, clearcoat: 0.9, clearcoatRoughness: 0.25,
  transparent: true, opacity: 0.92, side: THREE.DoubleSide,
});
const eyeMat = new THREE.MeshPhysicalMaterial({
  color: 0x14080a, roughness: 0.18, iridescence: 0.45, iridescenceIOR: 1.6,
});
const legMat = chitinDarkMat;

function shadowed(obj) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  return obj;
}

// ------------------------------------------------------------ the cockroach -
//
// Local convention inside the roach: +Z is forward (toward the head), +Y up.
// Body length ≈ 1.6 units. The whole body is dorsoventrally flattened.

function flatSphere(rx, ry, rz, mat) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat);
  m.scale.set(rx, ry, rz);
  return m;
}

function buildAntenna(side) {
  // Chain of 5 tapering segments so the whole antenna can flex; total ≈ 1.9,
  // longer than the body, as it should be.
  const segs = [];
  const root = new THREE.Group();
  let parent = root;
  for (let i = 0; i < 5; i++) {
    const len = 0.38;
    const r0 = 0.018 * (1 - i * 0.17);
    const r1 = 0.018 * (1 - (i + 1) * 0.17);
    const g = new THREE.Group();
    const geo = new THREE.CylinderGeometry(Math.max(r1, 0.004), r0, len, 6);
    geo.translate(0, len / 2, 0);
    g.add(new THREE.Mesh(geo, chitinDarkMat));
    g.rotation.x = 0.32;          // each joint curls the antenna backward
    parent.add(g);
    if (i > 0) g.position.y = len;
    parent = g;
    segs.push(g);
  }
  // Root orientation: up, outward, swept back over the body.
  root.rotation.set(-0.5, 0, side * -0.55);
  return { root, segs };
}

function buildPalp(scale) {
  const g = new THREE.Group();
  let parent = g;
  for (let i = 0; i < 3; i++) {
    const len = 0.045 * scale;
    const s = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.008 * scale, 0.01 * scale, len, 5);
    geo.translate(0, -len / 2, 0);
    s.add(new THREE.Mesh(geo, chitinDarkMat));
    s.rotation.x = 0.35;
    if (i > 0) s.position.y = -len;
    parent.add(s);
    parent = s;
  }
  return g;
}

function buildLeg(femurLen, tibiaLen, tarsusLen) {
  // Joint chain: coxa → trochanter → femur → spiny tibia → 5 tarsomeres →
  // pretarsus (paired claws + arolium). Each joint group's origin is the
  // articulation point; segments hang in -Y, so joint rotation.x bends the leg.
  const root = new THREE.Group();

  const coxa = flatSphere(0.06, 0.1, 0.045, legMat);
  coxa.position.y = -0.05;
  root.add(coxa);

  const trochanter = new THREE.Group();
  trochanter.position.y = -0.11;
  trochanter.add(flatSphere(0.035, 0.04, 0.035, legMat));
  root.add(trochanter);

  const femurJ = new THREE.Group();
  femurJ.position.y = -0.04;
  const femurGeo = new THREE.CylinderGeometry(0.028, 0.042, femurLen, 8);
  femurGeo.translate(0, -femurLen / 2, 0);
  const femurMesh = new THREE.Mesh(femurGeo, legMat);
  femurMesh.scale.z = 0.7;       // femora are flattened
  femurJ.add(femurMesh);
  trochanter.add(femurJ);

  const tibiaJ = new THREE.Group();
  tibiaJ.position.y = -femurLen;
  const tibGeo = new THREE.CylinderGeometry(0.016, 0.024, tibiaLen, 7);
  tibGeo.translate(0, -tibiaLen / 2, 0);
  tibiaJ.add(new THREE.Mesh(tibGeo, legMat));
  // Conspicuous tibial spines.
  const spineGeo = new THREE.ConeGeometry(0.008, 0.05, 4);
  for (let i = 0; i < 7; i++) {
    const sp = new THREE.Mesh(spineGeo, chitinDarkMat);
    const a = (i % 2 ? 1 : -1) * 0.9 + (i % 3) * 0.5;
    sp.position.set(Math.sin(a) * 0.02, -tibiaLen * (0.18 + i * 0.115), Math.cos(a) * 0.02);
    sp.rotation.set(Math.cos(a) * 1.2, 0, -Math.sin(a) * 1.2);
    tibiaJ.add(sp);
  }
  femurJ.add(tibiaJ);

  const tarsusJ = new THREE.Group();
  tarsusJ.position.y = -tibiaLen;
  tibiaJ.add(tarsusJ);
  let parent = tarsusJ;
  const tl = tarsusLen / 5;
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.009 - i * 0.001, 0.011 - i * 0.001, tl, 5);
    geo.translate(0, -tl / 2, 0);
    s.add(new THREE.Mesh(geo, legMat));
    s.rotation.x = 0.22;          // tarsus curls gently
    if (i > 0) s.position.y = -tl;
    parent.add(s);
    parent = s;
  }
  // Pretarsus: two claws + arolium pad between them.
  const clawGeo = new THREE.ConeGeometry(0.006, 0.035, 4);
  for (const sx of [-1, 1]) {
    const claw = new THREE.Mesh(clawGeo, chitinDarkMat);
    claw.position.set(sx * 0.012, -tl - 0.012, 0.008);
    claw.rotation.set(2.6, 0, sx * 0.5);
    parent.add(claw);
  }
  const arolium = flatSphere(0.012, 0.01, 0.014, legMat);
  arolium.position.set(0, -tl - 0.008, 0.012);
  parent.add(arolium);

  return { root, femurJ, tibiaJ, tarsusJ };
}

function buildRoach() {
  const roach = new THREE.Group();
  // Seated: the body tilts up ~60° so the roach sits upright on its stool.
  const body = new THREE.Group();
  body.rotation.x = -1.05;
  roach.add(body);

  // -- abdomen: 10 overlapping flattened segments, darker toward the tip ----
  const abdomen = new THREE.Group();
  for (let i = 0; i < 10; i++) {
    const k = i / 9;
    const r = 0.3 * (1 - Math.pow(k, 1.6) * 0.72);
    const seg = flatSphere(r * 1.12, r * 0.42, 0.11, i < 6 ? chitinMat : chitinDarkMat);
    seg.position.set(0, -0.02 - k * 0.06, 0.1 - i * 0.105);
    abdomen.add(seg);
  }
  // Cerci: paired segmented sensory appendages at the tip. Essential.
  for (const side of [-1, 1]) {
    const cercus = new THREE.Group();
    cercus.position.set(side * 0.07, -0.08, -0.86);
    cercus.rotation.y = side * 0.45;
    let p = cercus;
    for (let i = 0; i < 3; i++) {
      const len = 0.07 - i * 0.012;
      const s = new THREE.Group();
      const geo = new THREE.ConeGeometry(0.018 - i * 0.005, len, 5);
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, 0, -len / 2);
      s.add(new THREE.Mesh(geo, chitinDarkMat));
      if (i > 0) s.position.z = -len;
      p.add(s);
      p = s;
    }
    abdomen.add(cercus);
    anim.cerci.push({ g: cercus, side });
  }
  body.add(abdomen);

  // -- thorax: pronotum shield + meso/metanotum; all six legs attach here ---
  const thorax = new THREE.Group();
  const pronotum = flatSphere(0.34, 0.135, 0.27, pronotumMat);
  pronotum.position.set(0, 0.05, 0.52);
  pronotum.rotation.x = 0.18;
  thorax.add(pronotum);
  const meso = flatSphere(0.29, 0.11, 0.16, chitinMat);
  meso.position.set(0, 0.02, 0.3);
  thorax.add(meso);
  const meta = flatSphere(0.28, 0.11, 0.14, chitinMat);
  meta.position.set(0, 0, 0.16);
  thorax.add(meta);
  body.add(thorax);

  // -- tegmina: leathery forewings folded flat, overlapping left over right,
  //    reaching just past the abdomen tip ---------------------------------
  for (const side of [-1, 1]) {
    const geo = new THREE.CapsuleGeometry(0.17, 0.95, 4, 12);
    geo.rotateX(Math.PI / 2);
    const wing = new THREE.Mesh(geo, wingMat);
    wing.scale.set(1, 0.2, 1);
    wing.position.set(side * 0.09, 0.1 + (side < 0 ? 0.015 : 0), -0.27);
    wing.rotation.set(0.06, 0, side * -0.06);
    body.add(wing);
  }

  // -- head: hypognathous, tucked under the pronotum, facing down ----------
  const head = new THREE.Group();
  head.position.set(0, -0.04, 0.64);
  head.rotation.x = 0.95;          // face points down/back under the shield
  const skull = flatSphere(0.13, 0.17, 0.1, chitinMat);
  head.add(skull);
  for (const side of [-1, 1]) {
    const eye = flatSphere(0.045, 0.085, 0.06, eyeMat);   // kidney-shaped
    eye.position.set(side * 0.105, 0.03, 0.02);
    head.add(eye);
    // ocellar spot near each antenna base
    const oc = flatSphere(0.012, 0.016, 0.008, new THREE.MeshStandardMaterial({ color: 0xd8c9a0 }));
    oc.position.set(side * 0.05, 0.1, 0.06);
    head.add(oc);
    // mandible
    const mand = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.06, 5), chitinDarkMat);
    mand.position.set(side * 0.03, -0.16, 0.02);
    mand.rotation.z = side * 0.4;
    head.add(mand);
    // maxillary (long) + labial (short) palps, animated while munching
    const mx = buildPalp(1.6);
    mx.position.set(side * 0.05, -0.14, 0.05);
    mx.rotation.set(-0.6, 0, side * 0.7);
    head.add(mx);
    anim.palps.push(mx);
    const lb = buildPalp(1.0);
    lb.position.set(side * 0.025, -0.16, 0.04);
    lb.rotation.set(-0.4, 0, side * 0.4);
    head.add(lb);
    anim.palps.push(lb);
    // antenna — longer than the body
    const ant = buildAntenna(side);
    ant.root.position.set(side * 0.055, 0.12, 0.05);
    head.add(ant.root);
    (side < 0 ? anim.antennaL : anim.antennaR).push(...ant.segs);
  }
  body.add(head);
  anim.head = head;

  // -- legs: one pair per thoracic segment --------------------------------
  // Pose constants are hand-tuned for the seated posture; tweak freely.
  const legSpecs = [
    { z: 0.5, fem: 0.32, tib: 0.34, tar: 0.2, name: 'front',
      rot: [-1.45, 0, 1.25], fJ: -0.5, tJ: 1.1, taJ: 0.6 },
    { z: 0.32, fem: 0.4, tib: 0.45, tar: 0.24, name: 'mid',
      rot: [-0.25, 0, 1.35], fJ: 0.65, tJ: 1.9, taJ: 0.5 },
    { z: 0.14, fem: 0.5, tib: 0.6, tar: 0.28, name: 'hind',
      rot: [0.55, 0, 1.1], fJ: 1.0, tJ: 2.1, taJ: 0.35 },
  ];
  for (const spec of legSpecs) {
    for (const side of [-1, 1]) {
      const leg = buildLeg(spec.fem, spec.tib, spec.tar);
      leg.root.position.set(side * 0.21, -0.07, spec.z);
      leg.root.rotation.set(spec.rot[0], 0, side * spec.rot[2]);
      leg.femurJ.rotation.x = spec.fJ;
      leg.tibiaJ.rotation.x = spec.tJ;
      leg.tarsusJ.rotation.x = spec.taJ;
      thorax.add(leg.root);
      if (spec.name === 'front') anim.frontLegs.push(leg);
      if (spec.name === 'hind' && side === 1) anim.tapTarsus = leg.tarsusJ;
    }
  }

  // -- the grilled squid skewer, held up in front of the mouth -------------
  const skewer = new THREE.Group();
  const stickGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.95, 6);
  const stick = new THREE.Mesh(stickGeo, new THREE.MeshStandardMaterial({ color: 0xc9a86a, roughness: 0.8 }));
  skewer.add(stick);
  const glaze = new THREE.MeshPhysicalMaterial({
    color: 0xb05a26, roughness: 0.3, clearcoat: 1.0, clearcoatRoughness: 0.2,
  });
  const squid = flatSphere(0.11, 0.26, 0.055, glaze);
  squid.position.y = 0.18;
  skewer.add(squid);
  const finGeo = new THREE.ConeGeometry(0.09, 0.16, 4);
  const fin = new THREE.Mesh(finGeo, glaze);
  fin.scale.z = 0.3;
  fin.position.y = 0.46;
  skewer.add(fin);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.006, 0.16, 5), glaze);
    t.position.set(Math.cos(a) * 0.05, -0.13, Math.sin(a) * 0.04);
    t.rotation.set(Math.sin(a) * 0.5, 0, Math.cos(a) * 0.5);
    skewer.add(t);
  }
  skewer.position.set(0.04, -0.32, 0.95);
  skewer.rotation.set(-0.9, 0, 0.1);
  body.add(skewer);
  anim.skewer = skewer;

  shadowed(roach);
  return roach;
}

const roach = buildRoach();
roach.position.set(0, 1.18, 2.15);
roach.rotation.y = Math.PI;        // face the table / down the street
scene.add(roach);
anim.roach = roach;

// --------------------------------------------------------- roach furniture --

const plasticRed = new THREE.MeshPhysicalMaterial({
  color: 0xc02418, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.3,
});
const metalGray = new THREE.MeshStandardMaterial({ color: 0x6a6f78, roughness: 0.4, metalness: 0.8 });

function makeStool(x, z) {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.09, 20), plasticRed);
  seat.position.y = 0.52;
  g.add(seat);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.54, 8), plasticRed);
    leg.position.set(Math.cos(a) * 0.26, 0.26, Math.sin(a) * 0.26);
    leg.rotation.set(Math.sin(a) * -0.18, 0, Math.cos(a) * 0.18);
    g.add(leg);
  }
  const brace = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 6, 20), plasticRed);
  brace.rotation.x = Math.PI / 2;
  brace.position.y = 0.2;
  g.add(brace);
  g.position.set(x, 0, z);
  scene.add(shadowed(g));
  return g;
}
makeStool(0, 2.15);          // the roach's stool
makeStool(0.95, 1.1);        // a spare for a friend

const table = new THREE.Group();
{
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.05, 0.85), metalGray);
  top.position.y = 0.74;
  table.add(top);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.74, 6), metalGray);
    leg.position.set(sx * 0.55, 0.37, sz * 0.32);
    leg.rotation.set(sz * 0.12, 0, -sx * 0.12);
    table.add(leg);
  }
  table.position.set(0, 0, 1.05);
  scene.add(shadowed(table));
}

// bubble tea
{
  const cup = new THREE.Group();
  const cupMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.25,
  });
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.27, 16, 1, true), cupMat);
  shell.position.y = 0.135;
  cup.add(shell);
  const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.072, 0.2, 16), new THREE.MeshPhysicalMaterial({
    color: 0x6b4423, roughness: 0.2, transparent: true, opacity: 0.85,
  }));
  tea.position.y = 0.11;
  cup.add(tea);
  const pearlMat = new THREE.MeshStandardMaterial({ color: 0x1a120c, roughness: 0.3 });
  for (let i = 0; i < 18; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), pearlMat);
    const a = Math.random() * Math.PI * 2, r = Math.random() * 0.055;
    p.position.set(Math.cos(a) * r, 0.03 + Math.random() * 0.045, Math.sin(a) * r);
    cup.add(p);
  }
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.012, 16), cupMat);
  lid.position.y = 0.275;
  cup.add(lid);
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.32, 8), new THREE.MeshStandardMaterial({ color: 0x3ecf9a, roughness: 0.5 }));
  straw.position.set(0.02, 0.36, 0);
  straw.rotation.z = -0.18;
  cup.add(straw);
  cup.position.set(-0.32, 0.765, 1.0);
  scene.add(shadowed(cup));
}

// stinky tofu plate
{
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.025, 18), new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.6 }));
  g.add(plate);
  const tofuMat = new THREE.MeshStandardMaterial({ color: 0xd9b97a, roughness: 0.55 });
  for (let i = 0; i < 4; i++) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.055, 0.075), tofuMat);
    cube.position.set((i % 2 - 0.5) * 0.09, 0.04, (Math.floor(i / 2) - 0.5) * 0.09);
    cube.rotation.y = i * 0.4;
    g.add(cube);
  }
  const sauce = flatSphere(0.05, 0.012, 0.05, new THREE.MeshPhysicalMaterial({ color: 0xa01818, roughness: 0.15, clearcoat: 1 }));
  sauce.position.set(0.09, 0.02, -0.07);
  g.add(sauce);
  g.position.set(0.3, 0.78, 1.05);
  scene.add(shadowed(g));
}

// ------------------------------------------------------------- environment --

// wet asphalt
{
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x14121a, roughness: 0.35, metalness: 0.45 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const puddleMat = new THREE.MeshStandardMaterial({ color: 0x10141f, roughness: 0.05, metalness: 0.95 });
  const puddles = [[-2.2, 3.6, 0.9], [1.6, 4.8, 0.6], [-1.0, -2.5, 1.1], [3.0, 0.5, 0.5]];
  for (const [x, z, r] of puddles) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(r, 24), puddleMat);
    p.rotation.x = -Math.PI / 2;
    p.position.set(x, 0.005, z);
    p.scale.x = 1.4;
    scene.add(p);
  }
}

// food stalls
function makeStall({ x, z, rotY, text, color, kind, flicker = false }) {
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x44484f, roughness: 0.5, metalness: 0.7 });
  for (const [px, pz] of [[-1.5, -0.7], [1.5, -0.7], [-1.5, 0.7], [1.5, 0.7]]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.5, 0.07), frameMat);
    post.position.set(px, 1.25, pz);
    g.add(post);
  }
  // saggy striped awning: open cylinder slice, axis along x
  const awnGeo = new THREE.CylinderGeometry(2.0, 2.0, 3.4, 14, 1, true, -0.5, 1.0);
  const awning = new THREE.Mesh(awnGeo, new THREE.MeshStandardMaterial({
    map: stripeTex, roughness: 0.85, side: THREE.DoubleSide,
  }));
  awning.rotation.z = Math.PI / 2;
  awning.position.set(0, 0.95, 0.0);
  g.add(awning);
  const counter = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.85, 1.1), new THREE.MeshStandardMaterial({ color: 0x7a6248, roughness: 0.8 }));
  counter.position.set(0, 0.425, 0);
  g.add(counter);
  // fluorescent tube under the awning
  const tube = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.12), new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xfff4d6, emissiveIntensity: 3,
  }));
  tube.position.set(0, 2.15, 0.45);
  g.add(tube);
  // vertical neon sign
  const signMat = new THREE.MeshBasicMaterial({ map: signTex(text, color) });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 2.2), signMat);
  sign.position.set(1.62, 1.7, 0.85);
  sign.rotation.y = rotY > 0 ? -0.4 : 0.4;
  g.add(sign);
  if (flicker) anim.flickerMats.push(signMat);

  if (kind === 'steam') {
    // stacked bamboo steamers
    const wood = new THREE.MeshStandardMaterial({ color: 0x9a7b4f, roughness: 0.85 });
    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.11, 16, 1, true), wood);
        b.position.set(-0.8 + s * 0.65, 0.91 + i * 0.12, 0.1);
        g.add(b);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.014, 6, 16), wood);
        rim.rotation.x = Math.PI / 2;
        rim.position.copy(b.position).y += 0.055;
        g.add(rim);
      }
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.05, 16), wood);
      lid.position.set(-0.8 + s * 0.65, 1.3, 0.1);
      g.add(lid);
    }
  }
  if (kind === 'grill') {
    const grill = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.55), new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.6, metalness: 0.6 }));
    grill.position.set(0.3, 0.95, 0.1);
    g.add(grill);
    anim.coalMat = new THREE.MeshStandardMaterial({ color: 0x331108, emissive: 0xff5a16, emissiveIntensity: 2 });
    for (let i = 0; i < 10; i++) {
      const coal = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.08), anim.coalMat);
      coal.position.set(-0.2 + (i % 5) * 0.22 + Math.random() * 0.04, 1.05, -0.02 + Math.floor(i / 5) * 0.22);
      coal.rotation.y = Math.random();
      g.add(coal);
    }
    // skewers resting across the grill
    const stickMat = new THREE.MeshStandardMaterial({ color: 0xc9a86a, roughness: 0.8 });
    const meatMat = new THREE.MeshPhysicalMaterial({ color: 0x8a4018, roughness: 0.35, clearcoat: 0.8 });
    for (let i = 0; i < 5; i++) {
      const sk = new THREE.Group();
      sk.add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 5), stickMat));
      for (let j = 0; j < 3; j++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), meatMat);
        m.position.y = -0.1 + j * 0.09;
        m.scale.y = 1.3;
        sk.add(m);
      }
      sk.rotation.z = Math.PI / 2;
      sk.position.set(0.3, 1.12, -0.12 + i * 0.11);
      g.add(sk);
    }
  }
  if (kind === 'drinks') {
    const cupMat = new THREE.MeshPhysicalMaterial({ color: 0xd8a05a, roughness: 0.2, transparent: true, opacity: 0.7 });
    for (let i = 0; i < 8; i++) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.2, 10), cupMat);
      c.position.set(-1.1 + (i % 4) * 0.24, 0.96, 0.05 + Math.floor(i / 4) * 0.26);
      g.add(c);
    }
    const jug = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 14), cupMat);
    jug.position.set(0.9, 1.1, 0.1);
    g.add(jug);
  }
  // crates by the stall
  const crateMat = new THREE.MeshStandardMaterial({ color: kind === 'drinks' ? 0x2255aa : 0xaa3322, roughness: 0.7 });
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.36), crateMat);
  crate.position.set(-1.9, 0.16, 0.4);
  g.add(crate);
  const crate2 = crate.clone();
  crate2.position.y = 0.48;
  crate2.rotation.y = 0.3;
  g.add(crate2);

  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(shadowed(g));
  return g;
}

makeStall({ x: -4.2, z: 0.4, rotY: Math.PI / 2 - 0.12, text: '臭豆腐', color: '#ffcf4d', kind: 'steam' });
makeStall({ x: -4.0, z: -3.6, rotY: Math.PI / 2 + 0.08, text: '蚵仔煎', color: '#ff5a3c', kind: 'grill', flicker: true });
makeStall({ x: 4.2, z: -1.2, rotY: -Math.PI / 2 + 0.1, text: '珍珠奶茶', color: '#5ad8ff', kind: 'drinks' });

// 士林夜市 banner across the street
{
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 1.4),
    new THREE.MeshBasicMaterial({ map: bannerTex('士林夜市', '#ff4d6b'), side: THREE.DoubleSide }));
  banner.position.set(0, 4.6, -5.5);
  scene.add(banner);
}

// red lantern strings
function lanternString(z, count) {
  const pts = [
    new THREE.Vector3(-5.5, 4.5, z),
    new THREE.Vector3(0, 3.75, z),
    new THREE.Vector3(5.5, 4.5, z),
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.014, 5), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }));
  scene.add(cable);
  const shellMat = new THREE.MeshStandardMaterial({ color: 0xdd2211, emissive: 0xff3300, emissiveIntensity: 1.6, roughness: 0.6 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xcc9933, roughness: 0.4, metalness: 0.6 });
  for (let i = 0; i < count; i++) {
    const t = 0.08 + (i / (count - 1)) * 0.84;
    const p = curve.getPoint(t);
    const lan = new THREE.Group();       // origin = hanging point on the cable
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), shellMat);
    shell.scale.y = 0.82;
    shell.position.y = -0.32;
    lan.add(shell);
    const capT = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.06, 10), goldMat);
    capT.position.y = -0.1;
    lan.add(capT);
    const capB = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.06, 10), goldMat);
    capB.position.y = -0.54;
    lan.add(capB);
    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.16, 6), shellMat);
    tassel.position.y = -0.65;
    lan.add(tassel);
    lan.position.copy(p);
    scene.add(lan);
    anim.lanterns.push({ g: lan, phase: i * 0.9 + z });
  }
}
lanternString(4.5, 7);
lanternString(-2.0, 8);

// power cables overhead
{
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.9 });
  for (const [y, z, sag] of [[5.2, -7, 0.5], [5.6, 2.5, 0.7], [4.9, 7.5, 0.4]]) {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-9, y, z), new THREE.Vector3(0, y - sag, z + 0.3), new THREE.Vector3(9, y + 0.2, z),
    ]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 20, 0.012, 4), cableMat));
  }
}

// building silhouettes with lit windows
{
  for (const [x, z, w, h, d] of [
    [-7.5, -2, 4, 9, 5], [-7.8, 5, 3.5, 7, 4], [7.5, -4, 4, 10, 5],
    [7.8, 3, 3.6, 7.5, 4], [0, -10, 9, 8, 4],
  ]) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0a0a12, roughness: 0.9,
      emissive: 0xffffff, emissiveMap: windowTex, emissiveIntensity: 1.2,
    });
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    b.position.set(x, h / 2, z);
    scene.add(b);
  }
  // moon
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), new THREE.MeshBasicMaterial({ color: 0xd9d4c2 }));
  moon.position.set(-9, 13, -22);
  moon.lookAt(camera.position);
  scene.add(moon);
}

// trash bin
{
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.62, 12),
    new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.7 }));
  bin.position.set(2.4, 0.31, 3.6);
  scene.add(shadowed(bin));
}

// steam emitters
function makeSteam(x, y, z, count) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const parts = [];
  for (let i = 0; i < count; i++) {
    const mat = new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 });
    const s = new THREE.Sprite(mat);
    g.add(s);
    parts.push({ s, life: Math.random(), speed: 0.25 + Math.random() * 0.2, drift: Math.random() * Math.PI * 2 });
  }
  scene.add(g);
  anim.steams.push(parts);
}
makeSteam(-4.55, 1.45, -0.32, 16);  // steamer stack (world pos near tofu stall)
makeSteam(-4.1, 1.2, -3.4, 12);     // grill
makeSteam(0.32, 0.82, 1.05, 8);     // the roach's hot tofu plate

// ----------------------------------------------------------------- animate --

const clock = new THREE.Clock();
let flickerVal = 1;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // contented antenna sweep, left/right out of phase
  anim.antennaL.forEach((g, i) => {
    g.rotation.z = Math.sin(t * 1.3 + i * 0.45) * 0.07;
    g.rotation.x = 0.32 + Math.sin(t * 0.9 + i * 0.3) * 0.05;
  });
  anim.antennaR.forEach((g, i) => {
    g.rotation.z = Math.sin(t * 1.25 + 1.7 + i * 0.45) * 0.07;
    g.rotation.x = 0.32 + Math.sin(t * 0.95 + 2.2 + i * 0.3) * 0.05;
  });

  // munch cycle: every 4 s the skewer comes up to the mouth, head nods,
  // palps go wild
  const cycle = t % 4;
  const e = cycle < 1.3 ? Math.sin((cycle / 1.3) * Math.PI) : 0;
  anim.head.rotation.x = 0.95 + e * 0.22 + Math.sin(t * 2) * 0.015;
  anim.skewer.position.y = -0.32 + e * 0.14;
  anim.skewer.rotation.x = -0.9 + e * 0.35;
  anim.palps.forEach((p, i) => {
    p.rotation.x = -0.5 + Math.sin(t * 26 + i) * 0.3 * e;
  });
  anim.frontLegs.forEach((leg) => {
    leg.femurJ.rotation.x = -0.5 - e * 0.25;
  });

  // idle breathing bob + one hind tarsus keeping time with the night
  anim.roach.position.y = 1.18 + Math.sin(t * 2) * 0.012;
  if (anim.tapTarsus) anim.tapTarsus.rotation.x = 0.35 + Math.max(0, Math.sin(t * 12.6)) * 0.45;

  // occasional cerci twitch
  anim.cerci.forEach(({ g, side }) => {
    const burst = Math.sin(t * 0.31 + side) > 0.85 ? 3 : 1;
    g.rotation.y = side * 0.45 + Math.sin(t * 7 + side * 2) * 0.04 * burst;
  });

  // lanterns sway
  for (const { g, phase } of anim.lanterns) {
    g.rotation.z = Math.sin(t * 0.7 + phase) * 0.07;
    g.rotation.x = Math.sin(t * 0.5 + phase * 1.3) * 0.04;
  }

  // dying-neon stutter on the oyster-omelet sign
  if (Math.random() < 0.08) {
    flickerVal = Math.random() < 0.12 ? 0.15 : 0.75 + Math.random() * 0.25;
  }
  for (const m of anim.flickerMats) m.color.setScalar(flickerVal);

  // coal pulse
  if (anim.coalMat) {
    anim.coalMat.emissiveIntensity = 1.6 + Math.sin(t * 3) * 0.4 + Math.random() * 0.3;
  }

  // steam
  for (const parts of anim.steams) {
    for (const p of parts) {
      p.life += dt * p.speed;
      if (p.life > 1) { p.life = 0; p.drift = Math.random() * Math.PI * 2; }
      const k = p.life;
      p.s.position.set(
        Math.sin(k * 5 + p.drift) * 0.12 * k,
        k * 1.5,
        Math.cos(k * 4 + p.drift) * 0.1 * k);
      const sc = 0.22 + k * 0.85;
      p.s.scale.set(sc, sc, 1);
      p.s.material.opacity = 0.34 * Math.sin(Math.min(k * 3, 1) * Math.PI * 0.5) * (1 - k);
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();
