// ─────────────────────────────────────────────────────────────────────────────
// main.js — bootstraps the world, day/night cycle, UI, and the render loop
// ─────────────────────────────────────────────────────────────────────────────
window.EC = window.EC || {};

EC.boot = function (THREE) {
  const $ = id => document.getElementById(id);

  // ── renderer / scene / camera ──────────────────────────────────────────────
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const quality = { shadows: !isTouch, pixelCap: isTouch ? 1.35 : 1.8 };

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: $('view') });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelCap));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  if (quality.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x9fc5e8, 60, 900);
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2200);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── world & lights ─────────────────────────────────────────────────────────
  const world = EC.buildWorld(THREE, scene, quality);

  const hemi = new THREE.HemisphereLight(0xbed8f0, 0x4a4a3a, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.2);
  sun.position.set(150, 200, 120);
  scene.add(sun);
  scene.add(sun.target);
  if (quality.shadows) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -130; sc.right = 130; sc.top = 130; sc.bottom = -130;
    sc.near = 10; sc.far = 700;
    sun.shadow.bias = -0.0005;
  }

  const sunBall = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe9b8, fog: false }));
  scene.add(sunBall);
  const moonBall = new THREE.Mesh(new THREE.SphereGeometry(9, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xdfe8f2, fog: false }));
  scene.add(moonBall);

  // stars
  {
    const n = 900, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, e = Math.random() * Math.PI * 0.48 + 0.05;
      const r = 950;
      pos[i * 3] = Math.cos(a) * Math.cos(e) * r;
      pos[i * 3 + 1] = Math.sin(e) * r;
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfd8ea, size: 1.7, transparent: true, opacity: 0, fog: false, sizeAttenuation: false }));
    scene.add(stars);
  }

  // point lights from the world (lanterns / interiors)
  const lamps = world.lampPoints.map(lp => {
    const l = new THREE.PointLight(lp.color, 0, lp.range, 1.8);
    l.position.set(lp.x, lp.y, lp.z);
    scene.add(l);
    return { l, lp };
  });
  // the player's lantern after dark
  const lantern = new THREE.PointLight(0xffc88a, 0, 16, 1.6);
  scene.add(lantern);

  // ── clouds & gulls ─────────────────────────────────────────────────────────
  const cloudMat = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(64, 64, 8, 64, 64, 62);
    rg.addColorStop(0, 'rgba(255,255,255,0.85)');
    rg.addColorStop(0.6, 'rgba(255,255,255,0.4)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    return new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0.55, depthWrite: false, fog: false });
  })();
  const clouds = [];
  for (let i = 0; i < 14; i++) {
    const sp = new THREE.Sprite(cloudMat);
    const s = 90 + Math.random() * 180;
    sp.scale.set(s, s * (0.35 + Math.random() * 0.2), 1);
    sp.position.set((Math.random() - 0.5) * 1500, 170 + Math.random() * 120, (Math.random() - 0.5) * 1500);
    sp.renderOrder = -1;
    scene.add(sp);
    clouds.push(sp);
  }
  const gulls = [];
  {
    const wingMat = new THREE.MeshBasicMaterial({ color: 0xf2f2ee, side: THREE.DoubleSide });
    const wingGeo = new THREE.PlaneGeometry(0.85, 0.22);
    for (let i = 0; i < 7; i++) {
      const g = new THREE.Group();
      const wl = new THREE.Mesh(wingGeo, wingMat); wl.position.x = -0.42; g.add(wl);
      const wr = new THREE.Mesh(wingGeo, wingMat); wr.position.x = 0.42; g.add(wr);
      scene.add(g);
      gulls.push({
        g, wl, wr,
        cx: 60 + Math.random() * 90, cz: -90 + Math.random() * 160,
        r: 14 + Math.random() * 26, h: 14 + Math.random() * 14,
        a: Math.random() * 7, sp: 0.25 + Math.random() * 0.3, ph: Math.random() * 7,
      });
    }
  }

  // ── hotspots ───────────────────────────────────────────────────────────────
  const hotTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.beginPath(); g.arc(64, 64, 52, 0, 7);
    g.fillStyle = 'rgba(24,20,10,0.82)'; g.fill();
    g.lineWidth = 7; g.strokeStyle = '#d8b84a'; g.stroke();
    g.fillStyle = '#f0dfa8'; g.font = 'bold italic 78px Georgia, serif';
    g.textAlign = 'center'; g.fillText('i', 66, 92);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  // markers are occluded by walls, fade with distance, and can be toggled off
  let showHotspots = true;
  const hotspots = EC.HOTSPOTS.map((h, i) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: hotTex, transparent: true, depthTest: true }));
    sp.scale.set(1.25, 1.25, 1);
    sp.position.set(h.pos[0], h.pos[2], h.pos[1]);
    sp.userData.hotspot = i;
    scene.add(sp);
    return sp;
  });
  $('btn-info').onclick = () => {
    showHotspots = !showHotspots;
    $('btn-info').classList.toggle('dim', !showHotspots);
  };

  // ── characters ─────────────────────────────────────────────────────────────
  const mgr = EC.createCharacters(THREE, scene, world);

  // ── controls ───────────────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const controls = new EC.Controls(THREE, camera, renderer.domElement, world, onTap);

  function onTap(cx, cy) {
    if (document.body.classList.contains('ui-open')) return;
    const ndc = new THREE.Vector2((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const targets = hotspots.concat(mgr.chars.filter(c => c.group.visible).map(c => c.hit));
    const hits = raycaster.intersectObjects(targets, false);
    for (const h of hits) {
      if (h.distance > 38) break;
      if (h.object.userData.hotspot !== undefined) { showHotspot(h.object.userData.hotspot); return; }
      if (h.object.userData.charId) { showCharacter(h.object.userData.charId); return; }
    }
  }

  // ── time ───────────────────────────────────────────────────────────────────
  const SPEEDS = [0, 120, 360];     // game-seconds per real second (1× ⇒ 12-min days)
  let speedI = 1;
  let gameH = 11.55;                // start just before the gravediggers & Act II

  function fmtTime(h) {
    const hh = Math.floor(h) % 24, mm = Math.floor((h % 1) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  // ── UI: HUD, panels, cards ─────────────────────────────────────────────────
  const ui = {
    clock: $('clock'), zone: $('zone'), sub: $('subtitle'), toast: $('toast'),
    card: $('card'), cardBody: $('card-body'), menu: $('menu'), compass: $('compass-n'),
  };
  let zoneShown = '';

  $('btn-menu').onclick = () => openMenu('visit');
  $('card-close').onclick = () => { ui.card.style.display = 'none'; document.body.classList.remove('ui-open'); };
  $('menu-close').onclick = closeMenu;
  document.querySelectorAll('.tab').forEach(b => b.onclick = () => openMenu(b.dataset.tab));
  for (let i = 0; i < 3; i++) {
    $('spd' + i).onclick = () => {
      speedI = i;
      document.querySelectorAll('.spd').forEach((b, j) => b.classList.toggle('on', j === speedI));
    };
  }

  function openMenu(tab) {
    document.body.classList.add('ui-open');
    ui.menu.style.display = 'flex';
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    const box = $('menu-body');
    if (tab === 'visit') {
      box.innerHTML = '<h3>Visit a place</h3>' + EC.PLACES.map((p, i) =>
        `<button class="row" data-place="${i}">${p.name}</button>`).join('');
      box.querySelectorAll('[data-place]').forEach(b => b.onclick = () => {
        const p = EC.PLACES[+b.dataset.place];
        controls.teleport(p.pos[0], p.pos[1], p.face);
        closeMenu();
      });
    } else if (tab === 'playbill') {
      const sorted = [...EC.SCENES].sort((a, b) => a.hour - b.hour);
      box.innerHTML = '<h3>Playbill — scenes of the day</h3><p class="hint">Every castle day, the residents perform Hamlet. “Go” jumps time and carries you to the spot.</p>' +
        sorted.map(s =>
          `<div class="play-row"><span class="ptime">${fmtTime(s.hour)}</span><span class="pname"><b>${s.title}</b><br><i>${s.ref}</i></span><button class="go" data-scene="${s.id}">Go</button></div>`).join('');
      box.querySelectorAll('[data-scene]').forEach(b => b.onclick = () => {
        const r = mgr.jumpToScene(b.dataset.scene);
        if (r) {
          gameH = r.def.hour + 0.01;
          const dx = r.pos.x, dz = r.pos.z;
          // stand 7 m back from the scene, facing it
          const px = dx - 7 * Math.sin(0.6), pz = dz + 7 * Math.cos(0.6);
          controls.teleport(px, pz, Math.atan2(-(dx - px), -(dz - pz)));
        }
        closeMenu();
      });
    } else if (tab === 'people') {
      box.innerHTML = '<h3>The residents of Elsinore</h3>' + mgr.chars.map(c =>
        `<div class="play-row"><span class="pname"><b>${c.info.name}</b> — ${c.info.title}<br><i>${c.group.visible ? c.activityDesc : 'withdrawn (not abroad at this hour)'}</i></span>` +
        `<button class="go" data-char="${c.id}">${c.group.visible ? 'Find' : 'About'}</button></div>`).join('');
      box.querySelectorAll('[data-char]').forEach(b => b.onclick = () => {
        const c = mgr.byId[b.dataset.char];
        if (c.group.visible) {
          const a = Math.random() * Math.PI * 2;
          const px = c.pos.x + Math.sin(a) * 3, pz = c.pos.z + Math.cos(a) * 3;
          controls.teleport(px, pz, Math.atan2(-(c.pos.x - px), -(c.pos.z - pz)));
          closeMenu();
        } else {
          closeMenu();
          showCharacter(c.id);
        }
      });
    } else if (tab === 'about') {
      box.innerHTML = EC.ABOUT_HTML;
    } else if (tab === 'help') {
      box.innerHTML = `<h3>How to explore</h3>
        ${isTouch
          ? '<p><b>Move:</b> left joystick.<br><b>Look:</b> drag anywhere else on the screen.<br><b>Interact:</b> tap a person or a gold ⓘ marker.</p>'
          : '<p><b>Move:</b> W A S D (or ↑ ↓). <b>Turn:</b> Q / E or ← →. <b>Run:</b> hold Shift.<br><b>Look:</b> press and drag on the view (touchpad: click-drag — no mouse needed).<br><b>Interact:</b> click a person or a gold ⓘ marker.</p>'}
        <p><b>Time:</b> ⏸ pauses, 1× ≈ a 12-minute day, 3× for a 4-minute day. The Ghost walks only after midnight.</p>
        <p><b>Scenes:</b> open the <b>Playbill</b> and press “Go” to jump straight into any scene. <b>ⓘ markers</b> teach the real castle’s history.</p>
        <p>You cannot fall from the ramparts, and the Sound is too cold to swim — walk the ramps and the bridge.</p>
        <p class="hint">An educational walking replica of Kronborg Castle (“Elsinore”), full scale: courtyard 50×40 m, Great Hall 62 m, ramparts and moat included. All dialogue is from Shakespeare’s Hamlet.</p>`;
    }
  }

  function closeMenu() {
    ui.menu.style.display = 'none';
    document.body.classList.remove('ui-open');
  }

  function showCard(html) {
    ui.cardBody.innerHTML = html;
    ui.card.style.display = 'block';
    document.body.classList.add('ui-open');
  }

  function showHotspot(i) {
    const h = EC.HOTSPOTS[i];
    showCard(`<h3>ⓘ ${h.title}</h3><p>${h.text}</p>`);
  }

  function showCharacter(id) {
    const c = mgr.byId[id];
    const info = c.info;
    showCard(`<h3>${info.name}</h3><p class="hint">${info.title} — currently ${c.group.visible ? c.activityDesc : 'withdrawn from sight'}</p>
      <p>${info.bio}</p>
      <p><b>Did you know?</b> ${info.facts}</p>
      ${info.quotes.map(q => `<p class="quote">“${q}”</p>`).join('')}`);
  }

  // toast + subtitles from the scene engine
  let toastTimer = 0;
  function toast(html, ms) {
    ui.toast.innerHTML = html;
    ui.toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { ui.toast.style.display = 'none'; }, ms || 9000);
  }

  mgr.listeners.onSceneStart = def => {
    const p = EC.NAV.nodePos(def.place);
    const far = controls.pos.distanceTo(new THREE.Vector3(p.x, p.y + 1.7, p.z)) > 32;
    toast(`<b>Now playing: ${def.title}</b><br><i>${def.ref}</i>` +
      (far ? ` <button id="toast-go">Watch</button>` : ''), 12000);
    const btn = $('toast-go');
    if (btn) btn.onclick = () => {
      const px = p.x - 6, pz = p.z + 5;
      controls.teleport(px, pz, Math.atan2(-(p.x - px), -(p.z - pz)));
      ui.toast.style.display = 'none';
    };
  };
  let subTimer = 0;
  mgr.listeners.onLine = (def, speaker, text) => {
    if (controls.pos.distanceTo(speaker.pos) > 30) return;
    ui.sub.innerHTML = `<b>${speaker.info.name.toUpperCase()}</b> — ${text}`;
    ui.sub.style.display = 'block';
    clearTimeout(subTimer);
    subTimer = setTimeout(() => { ui.sub.style.display = 'none'; }, Math.min(12000, 2500 + text.length * 55));
  };
  mgr.listeners.onSceneEnd = (def, deaths) => {
    if (deaths) toast('<i>“The rest is silence.” — and yet, at Elsinore, the play is performed anew each day…</i>', 10000);
  };

  // ── intro ──────────────────────────────────────────────────────────────────
  $('intro-controls').innerHTML = isTouch
    ? 'Left joystick to walk · drag to look around · tap people and ⓘ markers'
    : 'WASD / arrows to walk · click-drag to look (touchpad friendly) · Q/E turn · Shift run · click people and ⓘ markers';
  $('start').onclick = () => {
    $('intro').style.display = 'none';
    controls.enabled = true;
    toast('<b>Welcome to Elsinore.</b><br>Cross the bridge and enter through the Dark Gate. The court is about its day — open ☰ for the Playbill.', 11000);
  };

  // ── sky / day-night ────────────────────────────────────────────────────────
  const skyDay = new THREE.Color(0x9fc5e8), skyNight = new THREE.Color(0x070d1d),
    skyDawn = new THREE.Color(0xd9966a), tmp = new THREE.Color(), tmp2 = new THREE.Color();
  const waterDay = new THREE.Color(0x2e4a5e), waterNight = new THREE.Color(0x0a1420);

  function updateSky() {
    const th = (gameH - 6) / 12 * Math.PI;          // 0 at 06:00, π at 18:00
    const alt = Math.sin(th);
    const day = Math.max(0, Math.min(1, alt * 1.7 + 0.12));
    const dawn = Math.max(0, 1 - Math.abs(alt) * 4) * (day > 0.02 ? 1 : 0.4);

    tmp.copy(skyNight).lerp(skyDay, day).lerp(skyDawn, dawn * 0.55);
    scene.background = scene.background || new THREE.Color();
    scene.background.copy(tmp);
    scene.fog.color.copy(tmp);
    scene.fog.far = 350 + day * 600;

    const cx = Math.cos(th), sy = Math.sin(th);
    sunBall.position.set(controls.pos.x + cx * 800, sy * 600, controls.pos.z + 350);
    sunBall.visible = sy > -0.05;
    moonBall.position.set(controls.pos.x - cx * 750, Math.max(80, -sy * 550), controls.pos.z + 300);
    moonBall.visible = sy < 0.1;

    if (sy > 0) {
      sun.color.setHex(0xfff2dc);
      tmp2.set(0xff9a50);
      sun.color.lerp(tmp2, dawn * 0.7);
      sun.intensity = 0.4 + day * 2.0;
      sun.position.set(cx * 300, Math.max(30, sy * 400), 200);
    } else {
      sun.color.setHex(0x93acd4);                    // moonlight
      sun.intensity = 0.6;
      sun.position.set(-cx * 300, Math.max(60, -sy * 350), 180);
    }
    hemi.intensity = 0.35 + day * 0.78;
    stars.material.opacity = Math.max(0, Math.min(1, -alt * 2.2));
    world.waterMat.color.copy(waterNight).lerp(waterDay, day);

    const night = 1 - day;
    world.glassMat.emissiveIntensity = night * 0.85;
    world.lanternMat.emissiveIntensity = night * 1.0;
    world.flameMat.emissiveIntensity = 0.15 + night * 0.95;
    cloudMat.opacity = 0.12 + day * 0.45;
    for (const { l, lp } of lamps) l.intensity = lp.nightOnly ? lp.intensity * night : lp.intensity;
    lantern.intensity = 14 * night;
    return day;
  }

  // ── main loop ──────────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let zoneT = 0;

  function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, clock.getDelta());
    gameH = (gameH + dt * SPEEDS[speedI] / 3600) % 24;

    controls.update(dt);
    mgr.update(dt, gameH, controls.pos, world.groundHeightAt);
    updateSky();

    // flags wave
    const t = performance.now() * 0.001;
    for (const f of world.flags) {
      f.rotation.y = Math.sin(t * 2.2 + f.position.x) * 0.18;
      f.scale.y = 1 + Math.sin(t * 3.1) * 0.03;
    }
    // hotspots: bob, distance fade, toggle
    for (let i = 0; i < hotspots.length; i++) {
      const sp = hotspots[i];
      const d = controls.pos.distanceTo(sp.position);
      const op = showHotspots ? Math.max(0, Math.min(1, (52 - d) / 14)) * 0.95 : 0;
      sp.visible = op > 0.03;
      if (sp.visible) {
        sp.material.opacity = op;
        sp.position.y = EC.HOTSPOTS[i].pos[2] + Math.sin(t * 1.8 + i) * 0.12;
      }
    }
    // ships sail the Sound; the water glitters
    for (const s of world.ships) {
      s.g.position.z += s.speed * dt;
      if (s.g.position.z > 420) s.g.position.z = -420;
      if (s.g.position.z < -420) s.g.position.z = 420;
      s.g.rotation.z = Math.sin(t * 0.9 + s.g.position.x) * 0.025;
    }
    world.waveTex.offset.x = (t * 0.004) % 1;
    world.waveTex.offset.y = (t * 0.0023) % 1;
    // clouds drift; gulls wheel over the Sound
    for (const c of clouds) {
      c.position.x += dt * 4;
      if (c.position.x - controls.pos.x > 850) c.position.x -= 1700;
    }
    for (const gu of gulls) {
      gu.a += dt * gu.sp;
      gu.g.position.set(gu.cx + Math.cos(gu.a) * gu.r, gu.h + Math.sin(t * 0.7 + gu.ph) * 2.2, gu.cz + Math.sin(gu.a) * gu.r);
      gu.g.rotation.y = -gu.a;
      const flap = Math.sin(t * 9 + gu.ph) * 0.55;
      gu.wl.rotation.y = flap; gu.wr.rotation.y = -flap;
    }
    // lantern follows the player
    lantern.position.set(controls.pos.x, controls.pos.y + 0.4, controls.pos.z);

    // HUD
    ui.clock.textContent = (gameH >= 6 && gameH < 18 ? '☀ ' : '☾ ') + fmtTime(gameH);
    ui.compass.style.transform = `rotate(${controls.yaw * 180 / Math.PI}deg)`;
    zoneT -= dt;
    if (zoneT <= 0) {
      zoneT = 0.5;
      const z = world.zoneAt(controls.pos.x, controls.pos.z, controls.pos.y - 1.7);
      if (z !== zoneShown) {
        zoneShown = z;
        ui.zone.textContent = z;
        ui.zone.classList.remove('pop');
        void ui.zone.offsetWidth;
        ui.zone.classList.add('pop');
      }
    }

    renderer.render(scene, camera);
  }
  loop();
};
