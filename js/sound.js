// Tiny sound kit: page-flip swoosh, pops, cheerful music, and read-aloud.
(function () {
  let ctx = null;
  let enabled = true;
  try { enabled = localStorage.getItem("dw-sound") !== "off"; } catch (e) {}

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function noiseBuffer(c, seconds) {
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // Route a node to the speakers (if sound is on) and/or a recording destination.
  function route(node, dest) {
    if (dest) node.connect(dest);
    if (enabled) node.connect(ctx.destination);
  }

  function flip(dest) {
    const c = ac(); if (!c || (!enabled && !dest)) return;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 0.6);
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.8;
    const g = c.createGain();
    const t = c.currentTime;
    bp.frequency.setValueAtTime(600, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + 0.35);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    src.connect(bp).connect(g); route(g, dest);
    src.start(t); src.stop(t + 0.6);
  }

  function pop(dest, when = 0, pitch = 1) {
    const c = ac(); if (!c || (!enabled && !dest)) return;
    const t = c.currentTime + when;
    const o = c.createOscillator(); const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(420 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(980 * pitch, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); route(g, dest);
    o.start(t); o.stop(t + 0.2);
  }

  // Cheerful plinky tune. Returns a stop() function.
  const MOODS = {
    bouncy: { bpm: 132, notes: [0, 4, 7, 4, 9, 7, 4, 2, 0, 4, 7, 12, 9, 7, 4, 7], wave: "triangle" },
    calm:   { bpm: 92,  notes: [0, 4, 7, 11, 9, 7, 4, 2, 0, 2, 4, 7, 4, 2, 0, -1], wave: "sine" },
    silly:  { bpm: 150, notes: [0, 12, 7, 12, 5, 12, 4, 12, 2, 7, 11, 7, 0, 4, 7, 0], wave: "square" },
  };
  function music(dest, seconds, mood = "bouncy") {
    const c = ac(); if (!c) return () => {};
    const m = MOODS[mood] || MOODS.bouncy;
    const out = c.createGain(); out.gain.value = mood === "silly" ? 0.05 : 0.09;
    route(out, dest);
    const beat = 60 / m.bpm / 2;
    const base = 523.25; // C5
    const start = c.currentTime + 0.05;
    const total = Math.ceil(seconds / beat);
    for (let i = 0; i < total; i++) {
      const t = start + i * beat;
      const n = m.notes[i % m.notes.length];
      const o = c.createOscillator(); const g = c.createGain();
      o.type = m.wave; o.frequency.value = base * Math.pow(2, n / 12);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(1, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.9);
      o.connect(g).connect(out); o.start(t); o.stop(t + beat);
      if (i % 4 === 0) { // bass
        const b = c.createOscillator(); const bg = c.createGain();
        b.type = "sine"; b.frequency.value = base / 4 * Math.pow(2, [0, 5, 7, 5][(i / 4) % 4 | 0] / 12);
        bg.gain.setValueAtTime(0.0001, t);
        bg.gain.exponentialRampToValueAtTime(1.4, t + 0.02);
        bg.gain.exponentialRampToValueAtTime(0.0001, t + beat * 3.5);
        b.connect(bg).connect(out); b.start(t); b.stop(t + beat * 4);
      }
    }
    const end = start + seconds;
    out.gain.setValueAtTime(out.gain.value, end - 0.8);
    out.gain.linearRampToValueAtTime(0.0001, end);
    return () => { try { out.gain.cancelScheduledValues(c.currentTime); out.gain.setValueAtTime(0, c.currentTime); out.disconnect(); } catch (e) {} };
  }

  // ---- Read aloud ----
  let voice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
    voice = vs.find(v => /samantha|google us english|jenny|aria|female/i.test(v.name)) || vs.find(v => /en-US/i.test(v.lang)) || vs[0] || null;
  }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  function say(text, { rate = 0.85, pitch = 1.15, interrupt = true } = {}) {
    return new Promise(resolve => {
      if (!enabled || !("speechSynthesis" in window)) return resolve();
      if (interrupt) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = rate; u.pitch = pitch;
      let done = false; const fin = () => { if (!done) { done = true; resolve(); } };
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, 900 + text.length * 160);
      speechSynthesis.speak(u);
    });
  }

  window.Sound = {
    ctx: ac, flip, pop, music, say,
    get enabled() { return enabled; },
    set enabled(v) {
      enabled = v;
      try { localStorage.setItem("dw-sound", v ? "on" : "off"); } catch (e) {}
      if (!v && "speechSynthesis" in window) speechSynthesis.cancel();
    },
  };
})();
