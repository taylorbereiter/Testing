/* Browser UI for the baseball game. Assumes the engine functions and the
   TUNED config are already in scope (the build inlines them). Pure DOM + rAF,
   no dependencies, designed thumb-first for phones: tap anywhere to swing. */

(function () {
  const $ = (id) => document.getElementById(id);
  const PLATE_Y = 84; // % down the track where the ball crosses the plate
  let game = null;
  let pitchState = null; // { startTs, travelMs, idealMs, swung, raf }

  function start() {
    game = newGame({ seed: (Math.random() * 1e9) | 0, tuning: TUNED });
    renderBoard();
    setMessage("Play ball!", "");
    setPrompt("Tap anywhere to take your first pitch");
    $("ball").style.opacity = "0";
    $("overlay").classList.add("hidden");
    armForPitch();
  }

  // Wait for the user to initiate the next pitch.
  function armForPitch() {
    if (game.over) return showFinal();
    if (cpuToBat(game)) return runCpuHalf();
    setPrompt("Tap to throw — then tap again to SWING");
    field().onpointerdown = throwPitch;
  }

  function throwPitch() {
    if (game.over || cpuToBat(game)) return;
    const p = pitch(game);
    if (!p) return;
    setMessage("", "");
    const ball = $("ball");
    ball.style.opacity = "1";
    ball.className = "ball " + p.type;
    pitchState = {
      startTs: performance.now(),
      travelMs: p.travelMs,
      idealMs: p.idealContactMs,
      inZone: p.inZone,
      swung: false,
    };
    setPrompt(p.inZone ? "" : "");
    field().onpointerdown = swing; // next tap is the swing
    animate();
  }

  function animate() {
    const ps = pitchState;
    if (!ps) return;
    const elapsed = performance.now() - ps.startTs;
    const frac = elapsed / ps.travelMs;
    const y = frac * PLATE_Y;
    $("ball").style.top = Math.min(y, 100) + "%";
    // Lateral break for curve/changeup to make pitch type readable.
    const ball = $("ball");
    const breakAmt = ball.classList.contains("curve")
      ? Math.sin(frac * Math.PI) * 16
      : ball.classList.contains("changeup")
        ? Math.sin(frac * Math.PI) * -8
        : 0;
    ball.style.transform = `translateX(${breakAmt}px)`;

    // Grace period past the plate before it counts as "taken".
    if (elapsed >= ps.travelMs + 120) {
      if (!ps.swung) takePitch();
      return;
    }
    ps.raf = requestAnimationFrame(animate);
  }

  function swing() {
    const ps = pitchState;
    if (!ps || ps.swung) return;
    ps.swung = true;
    cancelAnimationFrame(ps.raf);
    const tapMs = performance.now() - ps.startTs;
    const timingErrorMs = tapMs - ps.idealMs;
    flashBat();
    const res = resolveSwing(game, { swing: true, timingErrorMs });
    finishPitch(res, timingErrorMs);
  }

  function takePitch() {
    const ps = pitchState;
    if (!ps || ps.swung) return;
    ps.swung = true;
    const res = resolveSwing(game, { swing: false });
    finishPitch(res, null);
  }

  function finishPitch(res, timingErrorMs) {
    pitchState = null;
    $("ball").style.opacity = "0";
    describe(res, timingErrorMs);
    renderBoard();
    field().onpointerdown = null;
    setTimeout(() => {
      if (game.over) showFinal();
      else armForPitch();
    }, res.kind === "hit" || res.terminal ? 950 : 600);
  }

  function runCpuHalf() {
    setPrompt("");
    setMessage(`Bottom ${game.inning} — opponent batting…`, "cpu");
    setTimeout(() => {
      const runs = playCpuHalf(game);
      setMessage(
        runs === 0 ? "Opponent retired in order!" : `Opponent scores ${runs}!`,
        runs === 0 ? "good" : "cpu",
      );
      renderBoard();
      setTimeout(() => (game.over ? showFinal() : armForPitch()), 1100);
    }, 900);
  }

  // --- Rendering -----------------------------------------------------------
  function renderBoard() {
    $("inning").textContent = `${game.half === "top" ? "▲" : "▼"} ${game.inning}/${TUNED.innings}`;
    $("ps").textContent = game.score.player;
    $("cs").textContent = game.score.cpu;
    $("outs").innerHTML = [0, 1, 2]
      .map((i) => `<span class="dot ${i < game.outs ? "on" : ""}"></span>`)
      .join("");
    $("count").textContent = `${game.balls}-${game.strikes}`;
    for (let b = 0; b < 3; b++)
      $("base" + b).classList.toggle("on", game.bases[b]);
  }

  function describe(res, err) {
    if (!res || res.kind === "noop") return;
    const labels = {
      single: ["SINGLE!", "good"],
      double: ["DOUBLE!", "good"],
      triple: ["TRIPLE!", "good"],
      hr: ["💥 HOME RUN! 💥", "great"],
    };
    let text, cls;
    if (res.kind === "hit") {
      [text, cls] = labels[res.outcome];
      if (res.runs) text += ` (+${res.runs})`;
    } else if (res.kind === "out-in-play") {
      text = res.quality === "weak" ? "Weak grounder — out" : "Caught — out";
      cls = "cpu";
    } else if (res.kind === "swing-strike") {
      text = timingHint(err, "Swing and a miss");
      cls = "cpu";
    } else if (res.kind === "called-strike") {
      text = "Called strike";
      cls = "cpu";
    } else if (res.kind === "ball") {
      text = "Ball";
      cls = "";
    }
    if (res.terminal === "strikeout") (text = "STRUCK OUT"), (cls = "cpu");
    if (res.terminal === "walk")
      (text = "Walk" + (res.runs ? ` (+${res.runs})` : "")), (cls = "good");
    setMessage(text, cls);
  }

  function timingHint(err, base) {
    if (err == null) return base;
    if (err > 60) return base + " — late";
    if (err < -60) return base + " — early";
    return base + " — just off";
  }

  function showFinal() {
    const w = winner(game);
    const o = $("overlay");
    o.classList.remove("hidden");
    $("final-title").textContent =
      w === "player" ? "🏆 You win!" : w === "cpu" ? "Opponent wins" : "Tie game";
    $("final-score").textContent = `${game.score.player} – ${game.score.cpu}`;
  }

  // --- Helpers -------------------------------------------------------------
  const field = () => $("field");
  function setMessage(t, cls) {
    const m = $("message");
    m.textContent = t;
    m.className = "message " + (cls || "");
  }
  function setPrompt(t) {
    $("prompt").textContent = t;
  }
  function flashBat() {
    const b = $("bat");
    b.classList.remove("swing");
    void b.offsetWidth;
    b.classList.add("swing");
  }

  window.addEventListener("DOMContentLoaded", () => {
    $("play-again").onclick = start;
    start();
  });
})();
