// Movie maker: asks Claude Opus (via /api/storyboard) to direct a short movie
// from the child's words + drawings, then animates it on a canvas while
// recording it to a video file the family can save.
(function () {
  const $ = (s) => document.querySelector(s);
  const W = 1280, H = 720, SEAM = W / 2;
  const MOTIONS = ["bounce", "zoom", "slide_left", "slide_right", "spin", "float", "wiggle", "pop"];
  const EFFECTS = ["stars", "hearts", "confetti", "bubbles", "sparkles", "rain", "none"];
  const BGS = { blue: "#4d6fb3", red: "#e0605a", green: "#4fa868", purple: "#8a63b8", orange: "#f08c3a", pink: "#e2779c", teal: "#3a9e9b", yellow: "#e6b422" };
  const INK = "#2b2b2b";
  const COLORS = ["#ef5b5b", "#ff9f45", "#e8b500", "#6bcb77", "#4d96ff", "#a77bca", "#ff8fab"];

  let run = null; // current playback session

  // ---------- helpers ----------
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (p) => 1 - Math.pow(1 - clamp(p, 0, 1), 3);
  const back = (p) => { p = clamp(p, 0, 1); const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const bounceOut = (p) => { p = clamp(p, 0, 1); const n = 7.5625, d = 2.75; if (p < 1 / d) return n * p * p; if (p < 2 / d) return n * (p -= 1.5 / d) * p + .75; if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + .9375; return n * (p -= 2.625 / d) * p + .984375; };

  function sketchRect(ctx, x, y, w, h, seed, lw = 5, color = INK) {
    const r = rng(seed);
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (let pass = 0; pass < 2; pass++) {
      const j = () => (r() - .5) * 6;
      ctx.beginPath();
      ctx.moveTo(x + j(), y + j());
      ctx.quadraticCurveTo(x + w / 2 + j(), y + j(), x + w + j(), y + j());
      ctx.quadraticCurveTo(x + w + j(), y + h / 2 + j(), x + w + j(), y + h + j());
      ctx.quadraticCurveTo(x + w / 2 + j(), y + h + j(), x + j(), y + h + j());
      ctx.quadraticCurveTo(x + j(), y + h / 2 + j(), x + j(), y + j());
      ctx.globalAlpha = pass ? .35 : 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  function star(ctx, x, y, r, rot = 0) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2; const rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath();
  }
  function heart(ctx, x, y, s) {
    ctx.beginPath(); ctx.moveTo(x, y + s * .3);
    ctx.bezierCurveTo(x - s, y - s * .5, x - s * .4, y - s * 1.1, x, y - s * .45);
    ctx.bezierCurveTo(x + s * .4, y - s * 1.1, x + s, y - s * .5, x, y + s * .3);
    ctx.closePath();
  }

  function wrap(ctx, text, maxW) {
    const words = text.split(/\s+/); const lines = []; let line = "";
    for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line); return lines;
  }

  // Book spread background shared by every shot
  function book(ctx, bg) {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = .12; ctx.fillStyle = "#fff";
    for (let y = 18; y < H; y += 36) for (let x = 18 + (y / 36 % 2) * 18; x < W; x += 36) { ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = "#e9e3d5"; ctx.fillRect(34, 40, W - 68, H - 70);
    ctx.fillStyle = "#fff"; ctx.fillRect(34, 34, W - 68, H - 70);
    const gl = ctx.createLinearGradient(SEAM - 60, 0, SEAM, 0); gl.addColorStop(0, "rgba(0,0,0,0)"); gl.addColorStop(1, "rgba(0,0,0,.12)");
    ctx.fillStyle = gl; ctx.fillRect(SEAM - 60, 34, 60, H - 70);
    const gr = ctx.createLinearGradient(SEAM, 0, SEAM + 60, 0); gr.addColorStop(0, "rgba(0,0,0,.12)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gr; ctx.fillRect(SEAM, 34, 60, H - 70);
    ctx.fillStyle = "#cfc8b8"; ctx.fillRect(SEAM - 1, 34, 2, H - 70);
  }

  // ---------- effects (pure functions of time → deterministic) ----------
  function effect(ctx, kind, t, seed, area = { x: 34, y: 34, w: W - 68, h: H - 70 }) {
    if (kind === "none") return;
    const r = rng(seed * 977 + 13);
    ctx.save();
    const N = kind === "confetti" ? 40 : kind === "rain" ? 46 : 18;
    for (let i = 0; i < N; i++) {
      const bx = area.x + r() * area.w, by = area.y + r() * area.h, sp = .4 + r(), ph = r() * 6.28, col = COLORS[(r() * COLORS.length) | 0], sz = 8 + r() * 14;
      ctx.globalAlpha = .9;
      if (kind === "stars" || kind === "sparkles") {
        const tw = (Math.sin(t * 4 * sp + ph) + 1) / 2;
        ctx.globalAlpha = .25 + tw * .75;
        ctx.fillStyle = kind === "stars" ? "#ffd93d" : col; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
        if (kind === "stars") { star(ctx, bx, by, sz * (.7 + tw * .5), ph); ctx.fill(); ctx.stroke(); }
        else { ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); const s = sz * (.5 + tw * .6); ctx.moveTo(bx - s, by); ctx.lineTo(bx + s, by); ctx.moveTo(bx, by - s); ctx.lineTo(bx, by + s); ctx.stroke(); }
      } else if (kind === "hearts" || kind === "bubbles") {
        const y = area.y + area.h - ((by + t * 90 * sp) % area.h);
        const x = bx + Math.sin(t * 2 + ph) * 18;
        if (kind === "hearts") { ctx.fillStyle = ["#ff6b8a", "#ef5b5b", "#ff8fab"][i % 3]; heart(ctx, x, y, sz); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); }
        else { ctx.strokeStyle = "#4d96ff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, sz, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(x - sz * .35, y - sz * .35, sz * .2, 0, 7); ctx.stroke(); }
      } else if (kind === "confetti") {
        const y = area.y + ((by + t * 160 * sp) % area.h);
        ctx.translate(bx + Math.sin(t * 3 + ph) * 20, y); ctx.rotate(t * 4 * sp + ph);
        ctx.fillStyle = col; ctx.fillRect(-6, -3, 12, 6);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else if (kind === "rain") {
        const y = area.y + ((by + t * 420 * sp) % area.h);
        ctx.strokeStyle = "#7fb3ff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx - 4, y + 16); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---------- segments ----------
  function drawPicture(ctx, img, cx, cy, w, h, seed) {
    const r = rng(seed);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((r() - .5) * .06);
    ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.fillRect(-w / 2 + 8, -h / 2 + 10, w, h);
    ctx.fillStyle = "#fff"; ctx.fillRect(-w / 2, -h / 2, w, h);
    if (img) ctx.drawImage(img, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20);
    sketchRect(ctx, -w / 2, -h / 2, w, h, seed, 5);
    // tape
    ctx.fillStyle = "rgba(255, 217, 61, .7)";
    ctx.save(); ctx.translate(-w / 2 + 20, -h / 2 + 4); ctx.rotate(-.6); ctx.fillRect(-36, -12, 72, 24); ctx.restore();
    ctx.save(); ctx.translate(w / 2 - 20, -h / 2 + 4); ctx.rotate(.6); ctx.fillRect(-36, -12, 72, 24); ctx.restore();
    ctx.restore();
  }

  function motionTransform(kind, p, t) {
    // returns {dx, dy, s, rot, a}
    const e = ease(p);
    switch (kind) {
      case "bounce": return { dx: 0, dy: -520 * (1 - bounceOut(p)), s: 1, rot: 0, a: 1 };
      case "zoom": return { dx: 0, dy: 0, s: .15 + .85 * back(p), rot: 0, a: clamp(p * 3, 0, 1) };
      case "slide_left": return { dx: -700 * (1 - back(p)), dy: 0, s: 1, rot: -.15 * (1 - e), a: 1 };
      case "slide_right": return { dx: 700 * (1 - back(p)), dy: 0, s: 1, rot: .15 * (1 - e), a: 1 };
      case "spin": return { dx: 0, dy: 0, s: .2 + .8 * e, rot: (1 - e) * Math.PI * 2, a: clamp(p * 3, 0, 1) };
      case "float": return { dx: 0, dy: 300 * (1 - e) + Math.sin(t * 2.2) * 10 * e, s: 1, rot: Math.sin(t * 1.6) * .03, a: e };
      case "wiggle": return { dx: 0, dy: 0, s: .4 + .6 * back(p), rot: Math.sin(t * 9) * .09 * Math.max(.3, 1 - p * .7), a: 1 };
      default: return { dx: 0, dy: 0, s: back(p), rot: 0, a: 1 };
    }
  }

  function sceneFrame(ctx, sc, t, imgs, idx, pageNo) {
    const bg = BGS[sc.bg] || BGS.blue;
    book(ctx, bg);
    effect(ctx, sc.effect, t, idx + 1);
    // left page: the drawing
    const m = motionTransform(sc.motion, t / .9, t);
    const idle = t > .9 ? Math.sin((t - .9) * 2.4) * 5 : 0;
    ctx.save();
    ctx.globalAlpha = m.a;
    ctx.translate(SEAM / 2 + 17 + m.dx, H / 2 + m.dy + idle);
    ctx.rotate(m.rot); ctx.scale(m.s, m.s);
    drawPicture(ctx, imgs[sc.drawing], 0, 0, 500, 375, idx * 31 + 7);
    ctx.restore();
    // right page: word + caption
    const word = sc.word;
    ctx.save();
    ctx.font = "700 150px Andika, 'Comic Sans MS', sans-serif";
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    const total = ctx.measureText(word).width;
    let x = SEAM + (SEAM - 34) / 2 - total / 2 + 8;
    [...word].forEach((ch, i) => {
      const start = .35 + i * .16;
      const p = (t - start) / .4;
      const w = ctx.measureText(ch).width;
      if (p > 0) {
        const s = back(p); const jump = t > 1.6 && t < 2.1 ? Math.sin((t - 1.6) * Math.PI * 2) * -16 : 0;
        ctx.save(); ctx.translate(x + w / 2, 260 + jump * (i % 2 ? 1 : .6)); ctx.scale(s, s);
        ctx.fillStyle = /[aeiou]/.test(ch) ? "#ef5b5b" : INK;
        ctx.fillText(ch, -w / 2, 0); ctx.restore();
      }
      x += w;
    });
    // underline scribble
    const up = clamp((t - .9) / .5, 0, 1);
    if (up > 0) {
      ctx.strokeStyle = "#ffd93d"; ctx.lineWidth = 12; ctx.lineCap = "round";
      ctx.beginPath(); const x0 = SEAM + (SEAM - 34) / 2 - total / 2; ctx.moveTo(x0, 345); ctx.quadraticCurveTo(x0 + total / 2, 360, x0 + total * up + 16, 342); ctx.stroke();
    }
    // caption
    const cp = clamp((t - 1.1) / .5, 0, 1);
    if (cp > 0) {
      ctx.globalAlpha = cp;
      ctx.font = "400 50px Andika, 'Comic Sans MS', sans-serif"; ctx.textAlign = "center";
      const lines = wrap(ctx, sc.caption, 520);
      lines.forEach((ln, i) => {
        const y = 450 + i * 64 + (1 - ease(cp)) * 20;
        // highlight the word inside the caption
        const re = new RegExp(`\\b(${word})\\b`, "i");
        const mm = ln.match(re);
        if (!mm) { ctx.fillStyle = INK; ctx.fillText(ln, SEAM + SEAM / 2 - 8, y); return; }
        const full = ctx.measureText(ln).width; let cx = SEAM + SEAM / 2 - 8 - full / 2;
        ctx.textAlign = "left";
        const before = ln.slice(0, mm.index), hit = ln.slice(mm.index, mm.index + mm[0].length), after = ln.slice(mm.index + mm[0].length);
        ctx.fillStyle = INK; ctx.fillText(before, cx, y); cx += ctx.measureText(before).width;
        ctx.fillStyle = "#2f7ff0"; ctx.font = "700 50px Andika, 'Comic Sans MS', sans-serif"; ctx.fillText(hit, cx, y); cx += ctx.measureText(hit).width;
        ctx.fillStyle = INK; ctx.font = "400 50px Andika, 'Comic Sans MS', sans-serif"; ctx.fillText(after, cx, y);
        ctx.textAlign = "center";
      });
    }
    ctx.restore();
    // page numbers
    ctx.save(); ctx.fillStyle = "#b0a99b"; ctx.font = "24px 'Patrick Hand', sans-serif"; ctx.textAlign = "center";
    ctx.fillText(String(pageNo * 2 - 1), SEAM / 2, H - 52); ctx.fillText(String(pageNo * 2), SEAM + SEAM / 2, H - 52); ctx.restore();
  }

  function titleFrame(ctx, sb, t, imgs, name) {
    book(ctx, BGS[sb.bg] || BGS.blue);
    effect(ctx, "sparkles", t, 99);
    // floating thumbnails
    imgs.slice(0, 6).forEach((img, i) => {
      const r = rng(i * 17 + 3);
      const side = i % 2 ? 1 : -1;
      const tx = SEAM + side * (330 + r() * 160), ty = 150 + (i >> 1) * 210 + r() * 30;
      const p = clamp((t - .2 - i * .12) / .7, 0, 1);
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = ease(p);
      ctx.translate(tx + side * 400 * (1 - back(p)), ty + Math.sin(t * 2 + i) * 6); ctx.rotate(side * (.08 + r() * .1));
      drawPicture(ctx, img, 0, 0, 170, 128, i + 50); ctx.restore();
    });
    ctx.save();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "88px 'Patrick Hand', 'Comic Sans MS', sans-serif";
    const lines = wrap(ctx, sb.title, 600);
    lines.forEach((ln, li) => {
      const full = ctx.measureText(ln).width; let x = SEAM - full / 2;
      [...ln].forEach((ch, i) => {
        const w = ctx.measureText(ch).width; const p = (t - .15 - (li * 8 + i) * .045) / .45;
        if (p > 0) {
          ctx.save(); ctx.translate(x + w / 2, 300 + li * 96 + Math.sin(t * 5 + i) * 4); ctx.scale(back(p), back(p)); ctx.rotate(Math.sin(i * 1.7) * .08);
          ctx.fillStyle = ch === " " ? INK : COLORS[(i + li * 3) % COLORS.length]; ctx.strokeStyle = INK; ctx.lineWidth = 3;
          ctx.strokeText(ch, 0, 0); ctx.fillText(ch, 0, 0); ctx.restore();
        }
        x += w;
      });
    });
    const bp = clamp((t - 1.2) / .5, 0, 1);
    if (bp > 0) {
      ctx.globalAlpha = bp; ctx.fillStyle = INK; ctx.font = "46px 'Patrick Hand', sans-serif";
      ctx.fillText(`by ${name}`, SEAM, 300 + lines.length * 96 + 10);
    }
    ctx.restore();
  }

  function endFrame(ctx, sb, t, imgs, name) {
    book(ctx, BGS[sb.bg] || BGS.blue);
    effect(ctx, sb.ending.effect, t, 7);
    const n = Math.min(imgs.length, 10);
    const cols = Math.min(n, 5), rows = Math.ceil(n / cols);
    const cw = 200, ch = 150, gap = 26;
    const gw = cols * cw + (cols - 1) * gap;
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = (i / cols) | 0;
      const x = SEAM - gw / 2 + c * (cw + gap) + cw / 2;
      const y = (rows === 1 ? 470 : 400 + r * (ch + 20)) ;
      const p = clamp((t - .1 - i * .12) / .5, 0, 1);
      if (p <= 0) continue;
      ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 4); ctx.scale(back(p), back(p)); ctx.rotate(Math.sin(i * 2.1) * .07);
      drawPicture(ctx, imgs[i], 0, 0, cw, ch, i + 80); ctx.restore();
    }
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const p = back(clamp(t / .6, 0, 1));
    ctx.translate(SEAM, 150); ctx.scale(p, p); ctx.rotate(Math.sin(t * 3) * .03);
    ctx.font = "104px 'Patrick Hand', sans-serif"; ctx.fillStyle = "#ef5b5b"; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.strokeText("The End!", 0, 0); ctx.fillText("The End!", 0, 0);
    ctx.restore();
    const cp = clamp((t - .6) / .5, 0, 1);
    if (cp > 0) {
      ctx.save(); ctx.globalAlpha = cp; ctx.textAlign = "center"; ctx.fillStyle = INK;
      ctx.font = "44px Andika, sans-serif";
      wrap(ctx, sb.ending.caption, 1000).forEach((ln, i) => ctx.fillText(ln, SEAM, 245 + i * 54));
      ctx.restore();
    }
  }

  // ---------- storyboard ----------
  function localStoryboard(name, drawings) {
    const n = drawings.length;
    const per = clamp((24 - 6.5) / n, 2.2, 4);
    const pick = (arr, i) => arr[i % arr.length];
    return {
      source: "local",
      title: `${name}'s Big Book`,
      bg: "blue",
      music: "bouncy",
      scenes: drawings.map((d, i) => ({ drawing: i, word: d.word, caption: d.sentence, motion: pick(["pop", "bounce", "slide_left", "zoom", "wiggle", "slide_right", "spin", "float"], i), effect: pick(["stars", "confetti", "hearts", "bubbles", "sparkles"], i), bg: pick(["orange", "green", "purple", "teal", "pink", "red", "blue", "yellow"], i), duration: per })),
      ending: { caption: `You read ${n} word${n > 1 ? "s" : ""}! Good job, ${name}!`, effect: "confetti" },
    };
  }

  // Clamp whatever comes back so the movie is always 15–30 seconds and valid.
  function sanitize(sb, name, drawings) {
    const fb = localStoryboard(name, drawings);
    if (!sb || !Array.isArray(sb.scenes)) return fb;
    const used = new Set();
    let scenes = sb.scenes.filter(s => s && Number.isInteger(s.drawing) && s.drawing >= 0 && s.drawing < drawings.length && !used.has(s.drawing) && used.add(s.drawing)).map(s => ({
      drawing: s.drawing,
      word: drawings[s.drawing].word,
      caption: (typeof s.caption === "string" && s.caption.trim() && s.caption.length < 70) ? s.caption.trim() : drawings[s.drawing].sentence,
      motion: MOTIONS.includes(s.motion) ? s.motion : "pop",
      effect: EFFECTS.includes(s.effect) ? s.effect : "stars",
      bg: BGS[s.bg] ? s.bg : "blue",
      duration: Number(s.duration) || 3,
    }));
    drawings.forEach((d, i) => { if (!used.has(i)) scenes.push({ ...fb.scenes[i] }); });
    const fixed = 3 + 3.5;
    let sum = scenes.reduce((a, s) => a + s.duration, 0);
    const target = clamp(sum + fixed, 15, 30) - fixed;
    scenes.forEach(s => s.duration = clamp(s.duration * target / sum, 1.9, 6));
    sum = scenes.reduce((a, s) => a + s.duration, 0);
    if (sum + fixed > 30) scenes.forEach(s => s.duration *= (30 - fixed) / sum);
    return {
      source: sb.source || "opus",
      title: typeof sb.title === "string" && sb.title.trim() ? sb.title.trim().slice(0, 40) : fb.title,
      bg: BGS[sb.bg] ? sb.bg : "blue",
      music: ["bouncy", "calm", "silly"].includes(sb.music) ? sb.music : "bouncy",
      scenes,
      ending: { caption: (sb.ending && typeof sb.ending.caption === "string" && sb.ending.caption.trim()) ? sb.ending.caption.trim().slice(0, 90) : fb.ending.caption, effect: (sb.ending && EFFECTS.includes(sb.ending.effect)) ? sb.ending.effect : "confetti" },
    };
  }

  function shrink(dataUrl, w = 512, h = 384) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h); res(c.toDataURL("image/jpeg", .72).split(",")[1]); };
      img.onerror = () => res(null);
      img.src = dataUrl;
    });
  }

  async function askOpus(name, drawings) {
    const images = await Promise.all(drawings.map(d => shrink(d.image)));
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 45000);
    try {
      const r = await fetch("/api/storyboard", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify({ name, scenes: drawings.map((d, i) => ({ word: d.word, image: images[i] })) }),
      });
      if (!r.ok) throw new Error("storyboard " + r.status);
      const sb = await r.json();
      return { ...sb, source: "opus" };
    } finally { clearTimeout(timer); }
  }

  // "Thinking" animation while Opus plans the movie
  function planningFrame(ctx, t, name) {
    book(ctx, BGS.blue);
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "64px 'Patrick Hand', sans-serif"; ctx.fillStyle = INK;
    ctx.fillText("Making your movie…", SEAM, 230);
    ctx.font = "34px 'Patrick Hand', sans-serif"; ctx.fillStyle = "#777";
    ctx.fillText("Claude is looking at your drawings", SEAM, 300);
    // scribbling pencil
    const px = SEAM + Math.sin(t * 3) * 160, py = 460 + Math.sin(t * 7) * 30;
    ctx.strokeStyle = COLORS[(t * 2 | 0) % COLORS.length]; ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.beginPath();
    for (let k = 0; k < 40; k++) { const tt = t - k * .03; ctx.lineTo(SEAM + Math.sin(tt * 3) * 160, 460 + Math.sin(tt * 7) * 30 + 14); }
    ctx.stroke();
    ctx.translate(px, py); ctx.rotate(.5);
    ctx.fillStyle = "#ffd93d"; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.fillRect(-12, -90, 24, 80); ctx.strokeRect(-12, -90, 24, 80);
    ctx.fillStyle = "#ff8fab"; ctx.fillRect(-12, -108, 24, 18); ctx.strokeRect(-12, -108, 24, 18);
    ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(0, 14); ctx.lineTo(12, -10); ctx.closePath(); ctx.fillStyle = "#f2c98f"; ctx.fill(); ctx.stroke();
    ctx.restore();
    for (let i = 0; i < 3; i++) { ctx.fillStyle = INK; ctx.globalAlpha = (Math.sin(t * 5 - i) + 1) / 2; ctx.beginPath(); ctx.arc(SEAM - 30 + i * 30, 590, 9, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  }

  // ---------- playback + recording ----------
  function pickMime() {
    if (!window.MediaRecorder) return null;
    const opts = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    return opts.find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || null;
  }

  function loadImages(drawings) {
    return Promise.all(drawings.map(d => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = d.image; })));
  }

  async function open({ name, drawings }) {
    close();
    const session = { cancelled: false, raf: 0, stopMusic: null, recorder: null, blob: null, drawings, name };
    run = session;
    const modal = $("#movie"), canvas = $("#movieCanvas"), video = $("#movieVideo");
    const ctx = canvas.getContext("2d");
    modal.hidden = false;
    canvas.hidden = false; video.hidden = true; video.removeAttribute("src");
    $("#making").classList.remove("hide");
    $("#replay").disabled = true; $("#saveVideo").disabled = true;
    $("#movieNote").textContent = "";
    $("#movieTitle").textContent = `${name}'s movie!`;

    // Plan (Opus) while showing a thinking animation
    const t0 = performance.now();
    const spin = () => { if (session.cancelled) return; planningFrame(ctx, (performance.now() - t0) / 1000, name); session.raf = requestAnimationFrame(spin); };
    spin();
    const fontsReady = Promise.all([document.fonts.load("700 150px Andika"), document.fonts.load("400 50px Andika"), document.fonts.load("88px 'Patrick Hand'")]).catch(() => {});
    let raw = null;
    try { raw = await askOpus(name, drawings); } catch (e) { console.warn("Using built-in storyboard:", e.message); }
    const [imgs] = await Promise.all([loadImages(drawings), fontsReady]);
    if (session.cancelled) return;
    cancelAnimationFrame(session.raf);
    const sb = sanitize(raw, name, drawings);
    session.sb = sb; session.imgs = imgs;
    $("#movieNote").textContent = sb.source === "opus" ? "🎬 Directed by Claude Opus" : "";
    play(session, true);
  }

  function timeline(sb) {
    const segs = [{ kind: "title", d: 3 }];
    sb.scenes.forEach((s, i) => segs.push({ kind: "scene", d: s.duration, sc: s, i }));
    segs.push({ kind: "end", d: 3.5 });
    let acc = 0; segs.forEach(s => { s.start = acc; acc += s.d; });
    return { segs, total: acc };
  }

  function renderAt(ctx, session, seg, lt) {
    const { sb, imgs, name } = session;
    if (seg.kind === "title") titleFrame(ctx, sb, lt, imgs, name);
    else if (seg.kind === "scene") sceneFrame(ctx, seg.sc, lt, imgs, seg.i, seg.i + 1);
    else endFrame(ctx, sb, lt, imgs, name);
  }

  function play(session, record) {
    const canvas = $("#movieCanvas"), ctx = canvas.getContext("2d");
    const { segs, total } = timeline(session.sb);
    const off = document.createElement("canvas"); off.width = W; off.height = H; const octx = off.getContext("2d");
    const prev = document.createElement("canvas"); prev.width = W; prev.height = H; const pctx = prev.getContext("2d");
    let lastIdx = -1;

    // audio + recorder
    const ac = Sound.ctx();
    let dest = null;
    const mime = record ? pickMime() : null;
    if (record && mime && canvas.captureStream) {
      try {
        const vs = canvas.captureStream(30);
        if (ac && ac.createMediaStreamDestination) { dest = ac.createMediaStreamDestination(); dest.stream.getAudioTracks().forEach(tr => vs.addTrack(tr)); }
        const rec = new MediaRecorder(vs, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
        const chunks = [];
        rec.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data);
        rec.onstop = () => {
          if (!chunks.length) return;
          session.blob = new Blob(chunks, { type: mime.split(";")[0] });
          session.ext = mime.includes("mp4") ? "mp4" : "webm";
          if (run === session) { $("#saveVideo").disabled = false; }
        };
        rec.start(500);
        session.recorder = rec;
      } catch (e) { console.warn("Recording not available", e); }
    }
    if (record && !session.recorder) $("#movieNote").textContent = "This browser can't save movies, but you can save the drawings!";
    session.stopMusic = Sound.music(dest, total, session.sb.music);

    const start = performance.now();
    const TR = .55; // page-turn transition length
    const frame = () => {
      if (session.cancelled) return;
      const t = (performance.now() - start) / 1000;
      if (t >= total) {
        const last = segs[segs.length - 1];
        renderAt(ctx, session, last, last.d);
        finish(session);
        return;
      }
      const idx = segs.findIndex(s => t >= s.start && t < s.start + s.d);
      const seg = segs[idx]; const lt = t - seg.start;
      if (idx !== lastIdx) {
        if (lastIdx >= 0) { const ps = segs[lastIdx]; renderAt(pctx, session, ps, ps.d); Sound.flip(dest); }
        lastIdx = idx;
        if (seg.kind === "scene") { setTimeout(() => !session.cancelled && Sound.say(seg.sc.word, { rate: .8 }).then(() => !session.cancelled && Sound.say(seg.sc.caption, { rate: .85, interrupt: false })), 400); Sound.pop(dest, .35); }
        if (seg.kind === "title") setTimeout(() => !session.cancelled && Sound.say(session.sb.title, { rate: .9 }), 300);
        if (seg.kind === "end") setTimeout(() => !session.cancelled && Sound.say("The end! " + session.sb.ending.caption, { rate: .9 }), 300);
      }
      if (idx > 0 && lt < TR) {
        // fake 3D page turn: old right page folds onto the seam, new left page unfolds
        renderAt(octx, session, seg, lt);
        const p = ease(lt / TR);
        ctx.drawImage(off, 0, 0);
        if (p < .5) {
          const s = 1 - p * 2;
          ctx.drawImage(prev, 0, 0, SEAM, H, 0, 0, SEAM, H);
          ctx.drawImage(prev, SEAM, 0, SEAM, H, SEAM, 0, SEAM * s, H);
          ctx.fillStyle = `rgba(0,0,0,${.25 * (1 - s)})`; ctx.fillRect(SEAM, 0, SEAM * s, H);
        } else {
          const s = (p - .5) * 2;
          ctx.drawImage(prev, 0, 0, SEAM, H, 0, 0, SEAM, H);
          ctx.drawImage(off, 0, 0, SEAM, H, SEAM - SEAM * s, 0, SEAM * s, H);
          ctx.fillStyle = `rgba(0,0,0,${.25 * (1 - s)})`; ctx.fillRect(SEAM - SEAM * s, 0, SEAM * s, H);
        }
      } else {
        renderAt(ctx, session, seg, lt);
      }
      session.raf = requestAnimationFrame(frame);
    };
    frame();
  }

  function finish(session) {
    $("#making").classList.add("hide");
    $("#replay").disabled = false;
    if (session.recorder && session.recorder.state !== "inactive") setTimeout(() => { try { session.recorder.stop(); } catch (e) {} }, 300);
  }

  function replay() {
    const s = run; if (!s) return;
    if (s.blob) {
      const v = $("#movieVideo"); const c = $("#movieCanvas");
      if (!s.url) s.url = URL.createObjectURL(s.blob);
      v.src = s.url; v.hidden = false; c.hidden = true; v.currentTime = 0; v.play().catch(() => {});
      return;
    }
    cancelAnimationFrame(s.raf); s.stopMusic && s.stopMusic();
    $("#replay").disabled = true; $("#making").classList.remove("hide");
    play(s, false);
  }

  function download(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  const slug = (s) => (s || "my").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my";

  async function saveVideo() {
    const s = run; if (!s || !s.blob) return;
    const file = `${slug(s.name)}-doodle-movie.${s.ext}`;
    try {
      const f = new File([s.blob], file, { type: s.blob.type });
      if (navigator.canShare && matchMedia("(pointer: coarse)").matches && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: "My Doodle Words movie" }); return; }
    } catch (e) { if (e.name === "AbortError") return; }
    download(s.blob, file);
  }

  function loadJSZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    return new Promise((res, rej) => { const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; sc.onload = () => res(window.JSZip); sc.onerror = rej; document.head.appendChild(sc); });
  }

  async function saveDrawings() {
    const s = run; if (!s) return;
    const btn = $("#saveDrawings"); btn.disabled = true;
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      s.drawings.forEach((d, i) => zip.file(`${String(i + 1).padStart(2, "0")}-${d.word}.png`, d.image.split(",")[1], { base64: true }));
      const blob = await zip.generateAsync({ type: "blob" });
      download(blob, `${slug(s.name)}-drawings.zip`);
    } catch (e) {
      s.drawings.forEach((d, i) => setTimeout(() => { fetch(d.image).then(r => r.blob()).then(b => download(b, `${i + 1}-${d.word}.png`)); }, i * 400));
    } finally { btn.disabled = false; }
  }

  function close() {
    if (!run) return;
    run.cancelled = true;
    cancelAnimationFrame(run.raf);
    run.stopMusic && run.stopMusic();
    if (run.recorder && run.recorder.state !== "inactive") { run.recorder.onstop = null; try { run.recorder.stop(); } catch (e) {} }
    if (run.url) URL.revokeObjectURL(run.url);
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    const v = $("#movieVideo"); v.pause();
    $("#movie").hidden = true;
    run = null;
  }

  $("#replay").onclick = replay;
  $("#saveVideo").onclick = saveVideo;
  $("#saveDrawings").onclick = saveDrawings;
  $("#movie").addEventListener("click", (e) => { if (e.target.id === "movie") close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && run) close(); });

  window.Movie = { open, close, _sanitize: sanitize };
})();
