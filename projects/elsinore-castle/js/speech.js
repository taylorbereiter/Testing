// ─────────────────────────────────────────────────────────────────────────────
// speech.js — character narration. Two engines:
//   • browser voice (free, built-in speechSynthesis — safe for student devices)
//   • ElevenLabs (optional; user pastes their API key, stored ONLY in this
//     browser's localStorage on this device; responses cached per session so
//     repeat clicks don't re-bill)
// ─────────────────────────────────────────────────────────────────────────────
window.EC = window.EC || {};

EC.createVoice = function (notify) {
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } };

  const state = {
    mode: LS('ec-voice-mode') || 'browser',          // off | browser | eleven
    key: LS('ec-eleven-key') || '',
    scenes: LS('ec-voice-scenes') === '1',           // read scene lines aloud (browser voice)
  };
  const cache = new Map();                            // charId|text → object URL
  let current = null;

  function save() {
    store('ec-voice-mode', state.mode);
    store('ec-eleven-key', state.key);
    store('ec-voice-scenes', state.scenes ? '1' : '0');
  }

  function stop() {
    if (current) { current.pause(); current = null; }
    try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* unsupported */ }
  }

  function browserSpeak(text, prof) {
    if (!('speechSynthesis' in window)) { notify('This browser has no built-in voices.'); return; }
    stop();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.pitch = prof.p || 1;
    u.rate = prof.r || 1;
    speechSynthesis.speak(u);
  }

  async function elevenSpeak(charId, text, prof) {
    const ck = charId + '|' + text;
    if (!cache.has(ck)) {
      const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + prof.el + '?output_format=mp3_44100_64', {
        method: 'POST',
        headers: { 'xi-api-key': state.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.45, similarity_boost: 0.7 },
        }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      cache.set(ck, URL.createObjectURL(await res.blob()));
    }
    stop();
    current = new Audio(cache.get(ck));
    current.play();
  }

  // clicking a character: name, title and one of their famous quotes
  function speakCharacter(c) {
    if (state.mode === 'off') return;
    const info = c.info;
    const q = info.quotes[Math.random() * info.quotes.length | 0];
    const text = info.name + ', ' + info.title + '. ' + q;
    const prof = EC.VOICES[c.id] || { p: 1, r: 1 };
    if (state.mode === 'eleven' && state.key && prof.el) {
      elevenSpeak(c.id, text, prof).catch(e => {
        notify('ElevenLabs voice failed (' + e.message + ') — using the browser voice instead.');
        browserSpeak(text, prof);
      });
    } else {
      browserSpeak(text, prof);
    }
  }

  // scene dialogue read-aloud (browser voice only — keeps API costs at zero)
  function speakLine(charId, text) {
    if (!state.scenes || state.mode === 'off') return;
    const prof = EC.VOICES[charId] || { p: 1, r: 1 };
    browserSpeak(text.replace(/\([^)]*\)\s*/g, ''), prof);   // strip stage directions
  }

  return { state, save, stop, speakCharacter, speakLine };
};
