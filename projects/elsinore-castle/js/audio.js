// ─────────────────────────────────────────────────────────────────────────────
// audio.js — procedural sound: wind, waves, bells, footsteps, gulls, the
// Ghost's drone, dialogue cues and evening court music. All synthesized with
// the Web Audio API — no audio files, works offline.
// ─────────────────────────────────────────────────────────────────────────────
window.EC = window.EC || {};

EC.createAudio = function () {
  let ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    return null;
  }

  const master = ctx.createGain();
  master.gain.value = 0.6;
  master.connect(ctx.destination);
  let enabled = true;

  // shared noise buffer
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  {
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function noiseLoop(type, freq, q) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q || 0.7;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
    return { f, g };
  }

  // ── continuous layers ──────────────────────────────────────────────────────
  const wind = noiseLoop('bandpass', 420, 0.6);
  const waves = noiseLoop('lowpass', 320, 0.8);

  // the Ghost's drone: two detuned low sines
  const droneG = ctx.createGain();
  droneG.gain.value = 0;
  droneG.connect(master);
  for (const f of [55, 55.8, 110.4]) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const og = ctx.createGain();
    og.gain.value = f > 100 ? 0.3 : 1;
    o.connect(og); og.connect(droneG);
    o.start();
  }

  // ── one-shot helpers ───────────────────────────────────────────────────────
  function pluck(freq, vol, dur) {
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(freq * 5, t);
    f.frequency.exponentialRampToValueAtTime(freq * 1.4, t + (dur || 0.5));
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.5));
    o.connect(f); f.connect(g); g.connect(master);
    o.start(t);
    o.stop(t + (dur || 0.5) + 0.05);
  }

  function bellStrike(when, vol) {
    // church-bell partials
    for (const [ratio, pv, dec] of [[1, 1, 3.2], [2.0, 0.45, 2.2], [2.92, 0.28, 1.4], [4.07, 0.12, 0.9]]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = 392 * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(vol * pv, when + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dec);
      o.connect(g); g.connect(master);
      o.start(when);
      o.stop(when + dec + 0.1);
    }
  }

  function toll(strikes, vol) {
    const t = ctx.currentTime + 0.05;
    for (let i = 0; i < strikes; i++) bellStrike(t + i * 1.15, vol);
  }

  function footstep(hard, vol) {
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.playbackRate.value = 0.85 + Math.random() * 0.3;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = hard ? 950 : 480;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (hard ? 0.09 : 0.13));
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t, Math.random() * 1.5, 0.15);
  }

  function gullCry() {
    const t = ctx.currentTime;
    const reps = 1 + (Math.random() * 3 | 0);
    for (let i = 0; i < reps; i++) {
      const t0 = t + i * (0.28 + Math.random() * 0.1);
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(1150 + Math.random() * 200, t0);
      o.frequency.exponentialRampToValueAtTime(700, t0 + 0.3);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1000;
      f.Q.value = 2.5;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.035, t0 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
      o.connect(f); f.connect(g); g.connect(master);
      o.start(t0);
      o.stop(t0 + 0.4);
    }
  }

  // ── court lute (D aeolian) ─────────────────────────────────────────────────
  const SCALE = [146.83, 220, 293.66, 329.63, 349.23, 392, 440, 466.16, 523.25, 587.33];
  let noteI = 4, noteT = 1;

  // ── state ──────────────────────────────────────────────────────────────────
  let lastHourI = -1, lastBellReal = 0;
  let gullT = 5, stepPhase = 0;
  let windWander = 420;

  function update(dt, s) {
    if (!enabled || ctx.state !== 'running') return;
    const t = performance.now() * 0.001;
    const day = s.day;

    // wind: stronger up high, at night, and near the coast
    windWander += (Math.random() - 0.5) * 40 * dt;
    windWander = Math.max(280, Math.min(620, windWander));
    wind.f.frequency.value = windWander;
    const high = s.y > 4 ? 1 : 0;
    const gust = 0.6 + 0.4 * Math.sin(t * 0.31) * Math.sin(t * 0.17);
    const indoor = s.indoor ? 0.25 : 1;
    wind.g.gain.setTargetAtTime((0.014 + high * 0.02 + (1 - day) * 0.008) * gust * indoor, ctx.currentTime, 0.3);

    // waves: proximity to the open water (the ring outside |70| and the sea east/north)
    const edge = Math.max(Math.abs(s.x), Math.abs(s.z));
    const seaProx = Math.max(0, Math.min(1, (edge - 55) / 45));
    const swell = 0.55 + 0.45 * Math.sin(t * 0.42) * Math.sin(t * 0.275 + 1.3);
    waves.g.gain.setTargetAtTime(0.05 * seaProx * swell * indoor, ctx.currentTime, 0.4);

    // gulls by day near the water
    gullT -= dt;
    if (gullT <= 0) {
      gullT = 6 + Math.random() * 12;
      if (day > 0.3 && seaProx > 0.35 && !s.indoor) gullCry();
    }

    // the Ghost's drone
    const ghostVol = s.ghostD < 26 ? (1 - s.ghostD / 26) * 0.09 * (0.8 + 0.2 * Math.sin(t * 1.7)) : 0;
    droneG.gain.setTargetAtTime(ghostVol, ctx.currentTime, 0.5);

    // footsteps (two per walk-bob cycle)
    if (s.moving) {
      const ph = Math.floor(s.bobT / Math.PI);
      if (ph !== stepPhase) {
        stepPhase = ph;
        footstep(s.hardGround, 0.07);
      }
    }

    // the castle bell on the hour; twelve tolls at midnight
    const hourI = Math.floor(s.gameH);
    if (hourI !== lastHourI) {
      const real = performance.now();
      if (lastHourI >= 0 && real - lastBellReal > 20000) {
        lastBellReal = real;
        if (hourI === 0) toll(12, 0.10);
        else toll(1, 0.055);
      }
      lastHourI = hourI;
    }

    // court lute in and around the Great Hall, evenings
    if (s.gameH > 18.2 && s.gameH < 22.4) {
      const hd = Math.hypot(s.x - 0, s.z + 27);
      if (hd < 45) {
        noteT -= dt;
        if (noteT <= 0) {
          noteT = [0.32, 0.32, 0.45, 0.64, 0.9, 1.4][Math.random() * 6 | 0];
          if (Math.random() < 0.82) {
            noteI += [-2, -1, -1, 0, 1, 1, 2, 3][Math.random() * 8 | 0];
            noteI = Math.max(1, Math.min(SCALE.length - 1, noteI));
            const vol = (1 - hd / 45) * 0.05;
            pluck(SCALE[noteI], vol, 0.6);
            if (Math.random() < 0.22) pluck(SCALE[Math.max(0, noteI - 3)], vol * 0.6, 0.8);
          }
        }
      }
    }
  }

  return {
    update,
    setEnabled(v) {
      enabled = v;
      master.gain.setTargetAtTime(v ? 0.6 : 0, ctx.currentTime, 0.08);
    },
    resume() { if (ctx.state === 'suspended') ctx.resume(); },
    // a soft lute cue when a character begins a line nearby
    cue() { if (enabled) pluck(SCALE[2 + (Math.random() * 4 | 0)] * 2, 0.03, 0.35); },
  };
};
