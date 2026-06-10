// ─────────────────────────────────────────────────────────────────────────────
// controls.js — first-person walking: virtual joystick (touch), drag-look
// (works with a touchpad: click-drag, no pointer lock), WASD/arrows, collision.
// ─────────────────────────────────────────────────────────────────────────────
window.EC = window.EC || {};

EC.Controls = class {
  constructor(THREE, camera, dom, world, onTap) {
    this.THREE = THREE;
    this.camera = camera;
    this.dom = dom;
    this.world = world;
    this.onTap = onTap;

    this.pos = new THREE.Vector3(-108, 1.7, 0);
    this.groundY = 0;
    this.yaw = -Math.PI / 2;   // facing east, toward the castle
    this.pitch = 0;
    this.keys = {};
    this.joy = { active: false, id: null, x: 0, y: 0 };
    this.look = { id: null, lx: 0, ly: 0 };
    this.taps = new Map();
    this.enabled = false;
    this.isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });
    window.addEventListener('blur', () => { this.keys = {}; });

    dom.addEventListener('pointerdown', e => this.pointerDown(e));
    window.addEventListener('pointermove', e => this.pointerMove(e));
    window.addEventListener('pointerup', e => this.pointerUp(e));
    window.addEventListener('pointercancel', e => this.pointerUp(e, true));
    dom.addEventListener('contextmenu', e => e.preventDefault());

    this.buildJoystick();
  }

  buildJoystick() {
    const base = document.createElement('div');
    base.id = 'joy-base';
    base.innerHTML = '<div id="joy-knob"></div>';
    document.body.appendChild(base);
    this.joyBase = base;
    this.joyKnob = base.querySelector('#joy-knob');
    if (!this.isTouch) base.style.display = 'none';

    base.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      this.joy.active = true;
      this.joy.id = e.pointerId;
      base.setPointerCapture(e.pointerId);
      this.joyMove(e);
    });
    base.addEventListener('pointermove', e => { if (this.joy.id === e.pointerId) this.joyMove(e); });
    const end = e => {
      if (this.joy.id !== e.pointerId) return;
      this.joy.active = false; this.joy.id = null; this.joy.x = 0; this.joy.y = 0;
      this.joyKnob.style.transform = 'translate(-50%,-50%)';
    };
    base.addEventListener('pointerup', end);
    base.addEventListener('pointercancel', end);
  }

  joyMove(e) {
    const r = this.joyBase.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2);
    const m = Math.hypot(dx, dy);
    if (m > 1) { dx /= m; dy /= m; }
    this.joy.x = dx; this.joy.y = dy;
    this.joyKnob.style.transform = `translate(calc(-50% + ${dx * 38}px), calc(-50% + ${dy * 38}px))`;
  }

  pointerDown(e) {
    if (!this.enabled) return;
    this.taps.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 });
    if (this.look.id === null) {
      this.look.id = e.pointerId;
      this.look.lx = e.clientX;
      this.look.ly = e.clientY;
    }
  }

  pointerMove(e) {
    const tap = this.taps.get(e.pointerId);
    if (tap) tap.moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) ||
      (Math.abs(e.clientX - tap.x) + Math.abs(e.clientY - tap.y)) * 0.1;
    if (e.pointerId === this.look.id) {
      const dx = e.clientX - this.look.lx, dy = e.clientY - this.look.ly;
      this.look.lx = e.clientX; this.look.ly = e.clientY;
      const k = this.isTouch ? 0.0042 : 0.0034;
      this.yaw -= dx * k;
      this.pitch -= dy * k;
      this.pitch = Math.max(-1.25, Math.min(1.25, this.pitch));
    }
  }

  pointerUp(e, cancel) {
    if (e.pointerId === this.look.id) this.look.id = null;
    const tap = this.taps.get(e.pointerId);
    this.taps.delete(e.pointerId);
    if (!cancel && tap && this.enabled) {
      const dt = performance.now() - tap.t;
      const dist = Math.hypot(e.clientX - tap.x, e.clientY - tap.y);
      if (dt < 350 && dist < 12 && this.onTap) this.onTap(e.clientX, e.clientY);
    }
  }

  teleport(x, z, yaw) {
    this.pos.x = x; this.pos.z = z;
    this.groundY = this.world.groundHeightAt(x, z);
    this.pos.y = this.groundY + 1.7;
    if (yaw !== undefined) this.yaw = yaw;
    this.pitch = 0;
  }

  collide(nx, nz) {
    // axis-aligned slide against world colliders, radius 0.42
    const R = 0.42;
    const py0 = this.groundY + 0.3, py1 = this.groundY + 1.8;
    let x = nx, z = nz;
    for (const [x0, x1, y0, y1, z0, z1] of this.world.colliders) {
      if (y1 < py0 || y0 > py1) continue;
      if (x + R > x0 && x - R < x1 && z + R > z0 && z - R < z1) {
        // push out along the axis of least penetration
        const pxd = Math.min(x + R - x0, x1 - (x - R));
        const pzd = Math.min(z + R - z0, z1 - (z - R));
        if (pxd < pzd) x += (x < (x0 + x1) / 2) ? -pxd : pxd;
        else z += (z < (z0 + z1) / 2) ? -pzd : pzd;
      }
    }
    return [x, z];
  }

  update(dt) {
    if (!this.enabled) return;
    const k = this.keys;
    let f = 0, s = 0, turn = 0;
    if (k.KeyW || k.ArrowUp) f += 1;
    if (k.KeyS || k.ArrowDown) f -= 1;
    if (k.KeyA) s -= 1;
    if (k.KeyD) s += 1;
    if (k.KeyQ || k.ArrowLeft) turn += 1;
    if (k.KeyE || k.ArrowRight) turn -= 1;
    f += -this.joy.y;
    s += this.joy.x;
    this.yaw += turn * 2.1 * dt;

    const run = (k.ShiftLeft || k.ShiftRight) ? 2.1 : 1;
    const mag = Math.min(1, Math.hypot(f, s));
    if (mag > 0.01) {
      const speed = 4.2 * run * mag * dt;
      const ang = Math.atan2(s, f);
      const dir = this.yaw - ang;       // forward = (-sin yaw, -cos yaw)
      let nx = this.pos.x - Math.sin(dir) * speed;
      let nz = this.pos.z - Math.cos(dir) * speed;
      // ground rules: no big steps, no swimming
      const gh = this.world.groundHeightAt(nx, nz);
      if (Math.abs(gh - this.groundY) <= 1.0 && gh > -1.4) {
        [nx, nz] = this.collide(nx, nz);
        const gh2 = this.world.groundHeightAt(nx, nz);
        if (Math.abs(gh2 - this.groundY) <= 1.0 && gh2 > -1.4) {
          this.pos.x = nx; this.pos.z = nz;
          this.groundY = gh2;
        }
      }
      // head bob
      this.bobT = (this.bobT || 0) + dt * 7 * run;
    }
    // smooth eye height
    const eyeTarget = this.groundY + 1.7 + (mag > 0.01 ? Math.abs(Math.sin(this.bobT || 0)) * 0.05 : 0);
    this.pos.y += (eyeTarget - this.pos.y) * Math.min(1, dt * 9);

    this.camera.position.copy(this.pos);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
};
