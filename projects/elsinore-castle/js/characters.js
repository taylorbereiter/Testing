// ─────────────────────────────────────────────────────────────────────────────
// characters.js — AI residents of Elsinore: bodies, schedules, scenes, speech
// ─────────────────────────────────────────────────────────────────────────────
window.EC = window.EC || {};

EC.createCharacters = function (THREE, scene, world) {
  const NAV = EC.NAV;
  const chars = [];
  const byId = {};

  // ── sprite helpers ─────────────────────────────────────────────────────────
  function textSprite(scale) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 192;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sp.scale.set(scale * (512 / 192), scale, 1);
    sp.renderOrder = 10;
    return { sp, c, tex };
  }

  function drawName(s, name, title) {
    const g = s.c.getContext('2d');
    g.clearRect(0, 0, 512, 192);
    g.font = 'bold 56px Georgia, serif';
    g.textAlign = 'center';
    g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,0.75)';
    g.strokeText(name, 256, 100);
    g.fillStyle = '#f3e9c8';
    g.fillText(name, 256, 100);
    g.font = '34px Georgia, serif';
    g.strokeText(title, 256, 150);
    g.fillStyle = '#cdbf9a';
    g.fillText(title, 256, 150);
    s.tex.needsUpdate = true;
  }

  function drawBubble(s, text) {
    const g = s.c.getContext('2d');
    g.clearRect(0, 0, 512, 192);
    // wrap
    g.font = '28px Georgia, serif';
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      if (g.measureText(line + ' ' + w).width > 440 && line) { lines.push(line); line = w; }
      else line = line ? line + ' ' + w : w;
    }
    lines.push(line);
    const shown = lines.slice(0, 5);
    if (lines.length > 5) shown[4] += ' …';
    const hgt = shown.length * 32 + 26;
    const top = 192 - hgt - 14;
    g.fillStyle = 'rgba(20,16,10,0.85)';
    g.strokeStyle = 'rgba(220,200,150,0.9)';
    g.lineWidth = 3;
    roundRect(g, 16, top, 480, hgt, 14);
    g.fill(); g.stroke();
    // tail
    g.beginPath();
    g.moveTo(240, top + hgt); g.lineTo(256, 190); g.lineTo(272, top + hgt);
    g.fillStyle = 'rgba(20,16,10,0.85)';
    g.fill();
    g.fillStyle = '#f3ecd8';
    g.textAlign = 'center';
    shown.forEach((l, i) => g.fillText(l, 256, top + 38 + i * 32));
    s.tex.needsUpdate = true;
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  // ── body builder ───────────────────────────────────────────────────────────
  function makeBody(info) {
    const C = info.colors;
    const ghost = !!C.ghost;
    const mats = [];
    function mat(color, extra) {
      const m = new THREE.MeshLambertMaterial(Object.assign({ color, transparent: true, opacity: 1 }, extra));
      if (ghost) { m.emissive = new THREE.Color(0x7ab8d8); m.emissiveIntensity = 0.6; m.opacity = 0.55; }
      mats.push(m);
      return m;
    }
    const robeM = mat(C.robe), trimM = mat(C.trim), skinM = mat(0xd9b08a), hairM = mat(C.hair);
    const g = new THREE.Group();
    const gown = ['ophelia', 'gertrude', 'playerqueen'].includes(info.id) || C.hat === 'crown';

    // legs (pivot at hip)
    const legs = [];
    for (const s of [-1, 1]) {
      const piv = new THREE.Group();
      piv.position.set(s * 0.11, 0.95, 0);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.9, 7), trimM);
      leg.position.y = -0.45;
      piv.add(leg);
      g.add(piv);
      legs.push(piv);
    }
    // torso / robe
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.17, gown ? 0.2 : 0.26, 0.72, 9), robeM);
    torso.position.y = 1.32;
    g.add(torso);
    if (gown) {
      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.44, 1.0, 9), robeM);
      skirt.position.y = 0.5;
      g.add(skirt);
    } else {
      const tunic = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.35, 9), robeM);
      tunic.position.y = 0.85;
      g.add(tunic);
    }
    // belt
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.09, 9), trimM);
    belt.position.y = 1.0;
    g.add(belt);
    // arms (pivot at shoulder)
    const arms = [];
    for (const s of [-1, 1]) {
      const piv = new THREE.Group();
      piv.position.set(s * 0.25, 1.62, 0);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.62, 7), robeM);
      arm.position.y = -0.3;
      piv.add(arm);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), skinM);
      hand.position.y = -0.62;
      piv.add(hand);
      g.add(piv);
      arms.push(piv);
    }
    // head + hair
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), skinM);
    head.position.y = 1.82;
    g.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.175, 10, 10), hairM);
    hair.scale.set(1, 0.82, 1);
    hair.position.set(0, 1.88, -0.03);
    g.add(hair);
    // hats
    if (C.hat === 'crown') {
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.12, 9), mat(0xd8b84a, { emissive: 0x4a3808 }));
      crown.position.y = 2.02;
      g.add(crown);
      for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), mat(0xd8b84a));
        const a = (i / 5) * Math.PI * 2;
        spike.position.set(Math.cos(a) * 0.14, 2.12, Math.sin(a) * 0.14);
        g.add(spike);
      }
    } else if (C.hat === 'cap') {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.09, 9), trimM);
      cap.position.y = 2.0;
      g.add(cap);
    } else if (C.hat === 'helmet') {
      const helm = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8, 0, Math.PI * 2, 0, Math.PI / 1.9), mat(0x9aa4ae, { emissive: ghost ? 0x7ab8d8 : 0x000000 }));
      helm.position.y = 1.86;
      g.add(helm);
      const crest = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.3), trimM);
      crest.position.y = 2.05;
      g.add(crest);
    }
    // props (right arm)
    const armR = arms[1];
    function addProp(mesh, x, y, z) { mesh.position.set(x, y, z); armR.add(mesh); }
    switch (C.prop) {
      case 'sword': addProp(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.85, 0.1), mat(0xb8bcc4)), 0, -0.95, 0.18); break;
      case 'spear': addProp(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 6), mat(0x7a5a38)), 0.06, -0.45, 0);
        addProp(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 6), mat(0xb8bcc4)), 0.06, 0.78, 0); break;
      case 'book': addProp(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.08), mat(0x6e2a1a)), 0, -0.66, 0.12); break;
      case 'scroll': addProp(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.34, 6), mat(0xe8e0c8)), 0, -0.66, 0.12); break;
      case 'shovel': addProp(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), mat(0x7a5a38)), 0.05, -0.4, 0);
        addProp(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.04), mat(0x8a8a8e)), 0.05, -1.2, 0); break;
      case 'vial': addProp(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 6), mat(0x3a7a4a, { emissive: 0x1a4a2a })), 0, -0.66, 0.12); break;
      case 'flowers':
        for (const [c, dx] of [[0xc05070, -0.05], [0xd0c050, 0.03], [0x9060c0, 0.08]]) {
          addProp(new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), mat(c)), dx, -0.6 - Math.abs(dx), 0.1);
        }
        break;
    }
    g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
    return { group: g, legs, arms, mats };
  }

  // ── Character ──────────────────────────────────────────────────────────────
  const WALK = 1.5, HURRY = 2.6;

  class Character {
    constructor(id) {
      this.id = id;
      this.info = EC.CHAR_INFO[id];
      const b = makeBody(Object.assign({ id }, this.info));
      this.group = b.group;
      this.legs = b.legs;
      this.arms = b.arms;
      this.mats = b.mats;
      this.baseOpacity = this.info.colors.ghost ? 0.55 : 1;
      this.pos = new THREE.Vector3(0, 0, 0);
      this.heading = 0;
      this.targetHeading = 0;
      this.path = [];
      this.walkT = 0;
      this.moving = false;
      this.hurry = false;
      this.fade = 0;            // 0 hidden … 1 shown
      this.fadeTarget = 0;
      this.inScene = false;
      this.fallen = 0;          // 0 upright … 1 lying
      this.fallenTarget = 0;
      this.actI = -1;           // current schedule slot
      this.pause = 0;
      this.barkCd = 10 + Math.random() * 25;
      this.say_t = 0;
      this.anim = null;         // 'dig' etc.
      this.crouch = 0;
      this.crouchTarget = 0;
      // hit box for tapping
      this.hit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.3, 1.1), new THREE.MeshBasicMaterial({ visible: false }));
      this.hit.position.y = 1.15;
      this.hit.userData.charId = id;
      this.group.add(this.hit);
      // labels
      this.nameS = textSprite(0.5);
      drawName(this.nameS, this.info.name, this.info.title);
      this.nameS.sp.position.y = 2.45;
      this.group.add(this.nameS.sp);
      this.bubble = textSprite(1.35);
      this.bubble.sp.position.y = 3.4;
      this.bubble.sp.visible = false;
      this.group.add(this.bubble.sp);
      this.group.visible = false;
      scene.add(this.group);
      this.activityDesc = 'asleep within the castle';
    }

    setNode(nodeId, dx, dz) {
      const p = NAV.nodePos(nodeId);
      this.pos.set(p.x + (dx || 0), p.y, p.z + (dz || 0));
      this.path = [];
    }

    say(text, dur) {
      drawBubble(this.bubble, text);
      this.bubble.sp.visible = true;
      this.say_t = dur || Math.min(11, Math.max(3, text.length * 0.065));
      this.lastLine = text;
    }

    goto(nodeId, dx, dz, hurry) {
      const start = NAV.nearestNode(this.pos.x, this.pos.z, this.pos.y);
      const ids = NAV.findPath(start, nodeId) || [nodeId];
      this.path = ids.map(id => NAV.nodePos(id));
      // drop the first waypoint if it's behind us / we're basically on it
      if (this.path.length > 1) {
        const p0 = this.path[0];
        if (Math.hypot(p0.x - this.pos.x, p0.z - this.pos.z) < 1.5) this.path.shift();
      }
      const last = NAV.nodePos(nodeId);
      this.path.push({ x: last.x + (dx || 0), y: last.y, z: last.z + (dz || 0) });
      this.hurry = !!hurry;
    }

    update(dt, gameHour, playerPos, ghAt) {
      // fade
      this.fade += (this.fadeTarget - this.fade) * Math.min(1, dt * 2.2);
      const vis = this.fade > 0.02;
      this.group.visible = vis;
      if (vis) {
        for (const m of this.mats) m.opacity = this.baseOpacity * this.fade;
        this.nameS.sp.material.opacity = this.fade;
      }
      // schedule (when not in a scene)
      if (!this.inScene && !this.holdUntil) this.runSchedule(dt, gameHour);
      if (this.holdUntil && performance.now() > this.holdUntil) this.holdUntil = 0;

      // movement along path
      this.moving = false;
      if (this.path.length && this.fallen < 0.5) {
        const t = this.path[0];
        const dx = t.x - this.pos.x, dz = t.z - this.pos.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.45) this.path.shift();
        else {
          const sp = (this.hurry ? HURRY : WALK) * dt;
          this.pos.x += dx / d * Math.min(sp, d);
          this.pos.z += dz / d * Math.min(sp, d);
          this.targetHeading = Math.atan2(dx, dz);
          this.moving = true;
        }
      }
      this.pos.y = ghAt(this.pos.x, this.pos.z);
      // heading smoothing
      let dh = this.targetHeading - this.heading;
      while (dh > Math.PI) dh -= Math.PI * 2;
      while (dh < -Math.PI) dh += Math.PI * 2;
      this.heading += dh * Math.min(1, dt * 7);

      // pose / walk anim
      this.walkT += dt * (this.moving ? (this.hurry ? 9 : 6.4) : 2);
      const sw = this.moving ? Math.sin(this.walkT) * 0.55 : 0;
      this.legs[0].rotation.x = sw;
      this.legs[1].rotation.x = -sw;
      let armSw = this.moving ? -sw * 0.8 : Math.sin(this.walkT * 0.4) * 0.04;
      if (this.anim === 'dig' && !this.moving) {
        const digT = Math.sin(this.walkT * 1.4);
        this.arms[1].rotation.x = -0.8 + digT * 0.5;
        this.arms[0].rotation.x = -0.6 + digT * 0.4;
      } else if (this.fencing) {
        const fz = Math.sin(performance.now() * 0.012 + (this.id === 'hamlet' ? 0 : Math.PI));
        this.arms[1].rotation.x = -1.2 + fz * 0.6;
        this.arms[0].rotation.x = 0.2;
        this.group.position.x = this.pos.x + Math.sin(performance.now() * 0.004) * (this.id === 'hamlet' ? 0.5 : -0.5);
      } else {
        this.arms[0].rotation.x = armSw;
        this.arms[1].rotation.x = -armSw;
      }
      // falling / crouch
      this.fallen += (this.fallenTarget - this.fallen) * Math.min(1, dt * 3);
      this.crouch += (this.crouchTarget - this.crouch) * Math.min(1, dt * 4);
      this.group.rotation.z = this.fallen * Math.PI / 2;
      this.group.scale.y = 1 - this.crouch * 0.25;

      this.group.position.set(
        this.fencing ? this.group.position.x : this.pos.x,
        this.pos.y + this.fallen * 0.55 + Math.abs(this.moving ? Math.sin(this.walkT) * 0.045 : 0),
        this.pos.z);
      this.group.rotation.y = this.heading;

      // speech bubble timing & facing
      if (this.say_t > 0) {
        this.say_t -= dt;
        if (this.say_t <= 0) this.bubble.sp.visible = false;
      }
      // ambient barks
      if (!this.inScene && vis && playerPos) {
        const pd = this.pos.distanceTo(playerPos);
        if (pd < 11) {
          // face the player a bit when idle and near
          if (!this.moving && pd < 6) this.targetHeading = Math.atan2(playerPos.x - this.pos.x, playerPos.z - this.pos.z);
          this.barkCd -= dt;
          if (this.barkCd <= 0 && EC.BARKS[this.id]) {
            const lines = EC.BARKS[this.id];
            this.say(lines[Math.floor(Math.random() * lines.length)]);
            this.barkCd = 22 + Math.random() * 30;
          }
        }
      }
    }

    runSchedule(dt, gameHour) {
      const sched = EC.SCHEDULES[this.id];
      if (!sched) return;
      let slot = null, idx = -1;
      for (let i = 0; i < sched.length; i++) {
        if (gameHour >= sched[i][0] && gameHour < sched[i][1]) { slot = sched[i][2]; idx = i; break; }
      }
      if (idx !== this.actI) {
        this.actI = idx;
        this.pause = 0;
        if (!slot || slot.type === 'off') {
          this.fadeTarget = 0;
          this.activityDesc = 'withdrawn to private quarters';
        } else {
          this.anim = slot.anim || null;
          if (this.fade < 0.05) {
            // reappear directly at the activity's first node
            const n = slot.node || slot.nodes[0];
            this.setNode(n, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
          }
          this.fadeTarget = 1;
          if (slot.type === 'idle') {
            this.goto(slot.node, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
            this.activityDesc = 'at ' + slot.node;
          } else {
            this.patrolI = 0;
            this.goto(slot.nodes[0]);
          }
          this.activityDesc = {
            idle: 'attending to affairs', wander: 'taking the air about the castle',
            patrol: 'keeping the watch',
          }[slot.type] || 'about the castle';
          if (this.anim === 'dig') this.activityDesc = 'digging a grave, and singing at it';
        }
      }
      if (!slot || slot.type === 'off' || this.path.length) return;
      // arrived — decide next leg
      if (slot.type === 'wander') {
        this.pause -= dt;
        if (this.pause <= 0) {
          const n = slot.nodes[Math.floor(Math.random() * slot.nodes.length)];
          this.goto(n, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
          this.pause = 4 + Math.random() * 9;
        }
      } else if (slot.type === 'patrol') {
        this.pause -= dt;
        if (this.pause <= 0) {
          this.patrolI = ((this.patrolI || 0) + 1) % slot.nodes.length;
          this.goto(slot.nodes[this.patrolI]);
          this.pause = 1.5;
        }
      }
    }
  }

  for (const id of Object.keys(EC.CHAR_INFO)) {
    const c = new Character(id);
    chars.push(c);
    byId[id] = c;
  }
  // sensible spawn points (before first schedule tick)
  byId.gravedigger.setNode('graveyard');
  byId.sexton2.setNode('gyB');
  byId.ghost.setNode('rampN');

  // ── scene engine ───────────────────────────────────────────────────────────
  const sceneStates = EC.SCENES.map(s => ({ def: s, played: false, phase: 'idle', lineI: -1, lineT: 0, parts: [] }));
  let lastHour = 0;
  const listeners = { onSceneStart: null, onLine: null, onSceneEnd: null };

  function lineDuration(text) {
    return Math.min(13, Math.max(3, 1.2 + text.split(' ').length * 0.42));
  }

  function participants(def) {
    return Object.keys(def.marks).filter(id => def.marks[id] && byId[id]);
  }

  function beginGather(st, snap) {
    st.phase = 'gather';
    st.parts = participants(st.def);
    for (const id of st.parts) {
      const c = byId[id];
      c.inScene = true;
      c.fadeTarget = 1;
      c.fencing = false;
      const [node, dx, dz] = st.def.marks[id];
      if (snap || c.fade < 0.05) c.setNode(node, dx, dz);
      else c.goto(node, dx, dz, true);
      c.activityDesc = 'playing in “' + st.def.title + '” (' + st.def.ref + ')';
    }
    // the ghost hides until its cue unless it opens the scene
    if (st.def.marks.ghost && byId.ghost && st.def.id !== 'watch') byId.ghost.fadeTarget = 0;
    if (st.def.id === 'watch') byId.ghost.fadeTarget = 0;
    st.gatherT = 0;
  }

  function beginPlay(st) {
    st.phase = 'play';
    st.lineI = -1;
    st.lineT = 0.7;
    if (listeners.onSceneStart) listeners.onSceneStart(st.def);
  }

  function doAction(st, action) {
    const g = byId.ghost;
    switch (action) {
      case 'ghostShow': g.fadeTarget = 1; break;
      case 'ghostWalk': g.fadeTarget = 1; g.goto('rampN', 4, -2); break;
      case 'ghostFade': g.fadeTarget = 0; break;
      case 'laertesExit': { const l = byId.laertes; l.goto('bridgeW', 0, 0); l.holdUntil = performance.now() + 90000; break; }
      case 'kingFlees':
        for (const id of ['claudius', 'gertrude', 'polonius']) {
          const c = byId[id];
          c.goto('cyN', (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, true);
          c.holdUntil = performance.now() + 100000;
        }
        break;
      case 'poison': byId.lucianus.crouchTarget = 1; byId.playerking.fallenTarget = 1; break;
      case 'fence': byId.hamlet.fencing = true; byId.laertes.fencing = true; break;
      case 'fence2': break;
      case 'gertrudeFalls': byId.gertrude.fallenTarget = 1; break;
      case 'laertesFalls': byId.laertes.fencing = false; byId.hamlet.fencing = false; byId.laertes.fallenTarget = 1; break;
      case 'kingFalls': byId.claudius.fallenTarget = 1; break;
      case 'hamletFalls': byId.hamlet.fallenTarget = 1; break;
    }
  }

  function endScene(st) {
    st.phase = 'idle';
    st.played = true;
    const fallen = st.parts.filter(id => byId[id].fallenTarget > 0 || byId[id].crouchTarget > 0);
    for (const id of st.parts) {
      const c = byId[id];
      c.fencing = false;
      if (c.fallenTarget > 0 || c.crouchTarget > 0) {
        // the dead lie a while, then the day resets — the play is performed anew
        setTimeout(() => { c.fallenTarget = 0; c.crouchTarget = 0; c.inScene = false; c.actI = -99; }, 45000);
      } else {
        c.inScene = false;
        c.actI = -99; // force schedule re-evaluation
      }
    }
    if (st.def.marks.ghost) byId.ghost.inScene = false;
    if (listeners.onSceneEnd) listeners.onSceneEnd(st.def, fallen.length > 0);
  }

  function update(dt, gameHour, playerPos, ghAt) {
    // new day → reset scene flags
    if (gameHour < lastHour - 1) for (const st of sceneStates) { st.played = false; }
    lastHour = gameHour;

    for (const st of sceneStates) {
      const def = st.def;
      if (st.phase === 'idle') {
        if (!st.played && gameHour >= def.hour - 0.45 && gameHour < def.hour + 0.6) beginGather(st, false);
        else if (!st.played && gameHour >= def.hour + 0.6) st.played = true; // missed (time skipped)
      } else if (st.phase === 'gather') {
        st.gatherT += dt;
        const arrived = st.parts.every(id => byId[id].path.length === 0);
        if ((gameHour >= def.hour && (arrived || st.gatherT > 30)) || gameHour > def.hour + 0.55) beginPlay(st);
      } else if (st.phase === 'play') {
        st.lineT -= dt;
        if (st.lineT <= 0) {
          st.lineI++;
          if (st.lineI >= def.lines.length) { endScene(st); continue; }
          const line = def.lines[st.lineI];
          const speaker = byId[line.who];
          const dur = lineDuration(line.text);
          st.lineT = dur + 0.6;
          if (line.action) doAction(st, line.action);
          if (speaker) {
            speaker.say(line.text, dur);
            // others turn toward the speaker
            for (const id of st.parts) {
              if (id === line.who) continue;
              const c = byId[id];
              if (!c.moving && c.fallen < 0.5) {
                c.targetHeading = Math.atan2(speaker.pos.x - c.pos.x, speaker.pos.z - c.pos.z);
              }
            }
            if (listeners.onLine) listeners.onLine(def, speaker, line.text);
          }
        }
      }
    }

    for (const c of chars) c.update(dt, gameHour, playerPos, ghAt);
  }

  // jump straight to a scene (Playbill “Go”): returns where the player should stand
  function jumpToScene(id) {
    const st = sceneStates.find(s => s.def.id === id);
    if (!st) return null;
    for (const s2 of sceneStates) if (s2.phase !== 'idle') endScene(s2);
    st.played = false;
    beginGather(st, true);
    beginPlay(st);
    const p = NAV.nodePos(st.def.place);
    return { def: st.def, pos: p };
  }

  function nextScene(gameHour) {
    let best = null, bd = Infinity;
    for (const st of sceneStates) {
      let d = st.def.hour - gameHour;
      if (d <= 0.02) d += 24;
      if (d < bd) { bd = d; best = st; }
    }
    return best ? best.def : null;
  }

  return { chars, byId, update, jumpToScene, nextScene, listeners, sceneStates };
};
