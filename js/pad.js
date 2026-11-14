// Drawing pad: crayon colors, three sizes, eraser, undo, clear.
(function () {
  const COLORS = [
    ["black", "#2b2b2b"], ["red", "#ef3b3b"], ["orange", "#ff8c1a"], ["yellow", "#ffd21f"],
    ["green", "#3dbb57"], ["blue", "#2f7ff0"], ["purple", "#9254c8"], ["pink", "#ff6fa1"],
    ["brown", "#9a6332"], ["gray", "#9aa0a6"],
  ];

  function crayonSVG(c) {
    return `<svg viewBox="0 0 30 60" aria-hidden="true">
      <path d="M8 18 L15 2 L22 18 Z" fill="${c}" stroke="#2b2b2b" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="7" y="17" width="16" height="40" rx="3" fill="${c}" stroke="#2b2b2b" stroke-width="2.5"/>
      <path d="M7 26 L23 26 M7 47 L23 47" stroke="#2b2b2b" stroke-width="2" opacity=".55"/>
    </svg>`;
  }

  function create({ canvas, crayonsEl, toolsEl, onChange }) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const W = canvas.width, H = canvas.height;
    let color = COLORS[1][1], size = 14, erasing = false;
    let drawing = false, last = null, history = [], dirty = false;

    function blank() { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); }
    blank();

    // palette
    crayonsEl.innerHTML = "";
    COLORS.forEach(([name, c], i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "crayon" + (i === 1 ? " active" : "");
      b.setAttribute("role", "radio"); b.setAttribute("aria-label", name + " crayon");
      b.setAttribute("aria-checked", i === 1 ? "true" : "false");
      b.innerHTML = crayonSVG(c);
      b.onclick = () => {
        color = c; erasing = false;
        crayonsEl.querySelectorAll(".crayon").forEach(x => { x.classList.remove("active"); x.setAttribute("aria-checked", "false"); });
        b.classList.add("active"); b.setAttribute("aria-checked", "true");
        toolsEl.querySelector("#eraser").classList.remove("active");
        Sound.pop(null, 0, 1 + i * 0.05);
      };
      crayonsEl.appendChild(b);
    });

    toolsEl.querySelectorAll("[data-size]").forEach(b => {
      b.onclick = () => {
        size = +b.dataset.size;
        toolsEl.querySelectorAll("[data-size]").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
      };
    });
    toolsEl.querySelector("#eraser").onclick = (e) => { erasing = !erasing; e.currentTarget.classList.toggle("active", erasing); };
    toolsEl.querySelector("#undo").onclick = undo;
    toolsEl.querySelector("#clear").onclick = () => { if (!dirty) return; snapshot(); blank(); dirty = false; onChange && onChange(false); };

    function snapshot() {
      history.push(ctx.getImageData(0, 0, W, H));
      if (history.length > 25) history.shift();
    }
    function undo() {
      if (!history.length) return;
      ctx.putImageData(history.pop(), 0, 0);
      dirty = history.length > 0 || !isBlank();
      onChange && onChange(dirty);
    }
    function isBlank() {
      const d = ctx.getImageData(0, 0, W, H).data;
      for (let i = 0; i < d.length; i += 4 * 97) if (d[i] < 250 || d[i + 1] < 250 || d[i + 2] < 250) return false;
      return true;
    }

    function pos(e) {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height), p: e.pressure || 0.5 };
    }
    function stroke(a, b) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = erasing ? "#fff" : color;
      const w = erasing ? size * 2.2 : size;
      ctx.lineWidth = w;
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      if (!erasing) { // waxy crayon texture
        ctx.globalAlpha = 0.18; ctx.lineWidth = Math.max(1, w * 0.25);
        const j = w * 0.3;
        ctx.beginPath(); ctx.moveTo(a.x + j, a.y - j); ctx.lineTo(b.x + j, b.y - j); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    canvas.addEventListener("pointerdown", e => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      snapshot(); drawing = true; last = pos(e);
      stroke(last, { x: last.x + 0.1, y: last.y + 0.1 });
    });
    canvas.addEventListener("pointermove", e => {
      if (!drawing) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs) { const p = pos(ev); stroke(last, p); last = p; }
    });
    const end = () => {
      if (!drawing) return; drawing = false;
      const was = dirty; dirty = !isBlank();
      if (dirty !== was || dirty) onChange && onChange(dirty);
    };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);

    return {
      get dirty() { return dirty; },
      toDataURL: () => canvas.toDataURL("image/png"),
      reset() { blank(); history = []; dirty = false; },
      load(url) { const img = new Image(); img.onload = () => { blank(); ctx.drawImage(img, 0, 0, W, H); dirty = true; }; img.src = url; },
    };
  }

  window.Pad = { create };
})();
