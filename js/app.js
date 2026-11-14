// App flow: intro → name → page flip → word pages (endless) → movie.
(function () {
  const $ = (s) => document.querySelector(s);
  const state = {
    name: "",
    queue: [],
    current: null,
    page: 1,
    pages: [],   // [{ entry, image (dataURL) | null, img (decoded Image) | null }]
    idx: 0,      // which page is open
    busy: false,
  };
  try { state.name = localStorage.getItem("dw-name") || ""; } catch (e) {}

  // ---------- words ----------
  const VERBS = new Set(["eat", "dig", "run", "hop", "hug", "sit", "hit", "nap", "ran", "kick", "jump", "swim", "sing", "see"]);
  const ADJ = new Set(["red", "big", "hot", "sad", "wet", "up"]);
  const NUM = new Set(["six", "ten"]);
  const MASS = new Set(["jam", "ham", "milk", "gum", "rain"]);
  const LONG = { a: "ay", e: "ee", i: "eye", o: "oh", u: "you" };

  function sentenceFor(w) {
    const b = `<b>${w}</b>`;
    if (VERBS.has(w)) return { html: `I can ${b}!`, text: `I can ${w}!` };
    if (ADJ.has(w)) return { html: `It is ${b}.`, text: `It is ${w}.` };
    if (NUM.has(w)) return { html: `I see ${b} dots.`, text: `I see ${w} dots.` };
    if (MASS.has(w)) return { html: `I see ${b}.`, text: `I see ${w}.` };
    const an = /^[aeiou]/.test(w) ? "an" : "a";
    return { html: `I see ${an} ${b}.`, text: `I see ${an} ${w}.` };
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function nextWord() {
    if (!state.queue.length) {
      const fresh = shuffle(WORDS.slice());
      if (state.current && fresh[0].w === state.current.w) fresh.push(fresh.shift());
      state.queue = fresh;
    }
    return state.queue.shift();
  }

  function soundFor(entry, i) {
    const part = entry.parts[i];
    if (entry.silentE) {
      if (i === entry.parts.length - 1) return null;
      if (/^[aeiou]$/.test(part) && i === entry.parts.length - 3) return LONG[part];
    }
    return SOUNDS[part] || part;
  }

  // ---------- workspace rendering ----------
  function renderWord(target, entry, page) {
    const wordEl = target.querySelector(".word");
    wordEl.innerHTML = "";
    entry.parts.forEach((p, i) => {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "tile" + (p.length > 1 ? " multi" : "");
      t.dataset.i = i;
      const silent = entry.silentE && i === entry.parts.length - 1;
      t.innerHTML = [...p].map(ch => `<span class="ch${/[aeiou]/.test(ch) ? " vowel" : ""}${silent ? " silent" : ""}">${ch}</span>`).join("");
      t.setAttribute("aria-label", silent ? "quiet e" : `sound ${p}`);
      wordEl.appendChild(t);
    });
    wordEl.classList.remove("pop"); void wordEl.offsetWidth; wordEl.classList.add("pop");
    const s = sentenceFor(entry.w);
    target.querySelector(".sentence").innerHTML = s.html;
    target.querySelector(".hello").textContent = state.name ? `Hi, ${state.name}!` : "Hi!";
    const n = drawings().length;
    target.querySelector(".stars").textContent = n ? "⭐".repeat(Math.min(n, 8)) + (n > 8 ? ` ${n}` : "") : "";
    target.querySelectorAll(".page-num")[0].textContent = page * 2 - 1;
  }

  function showWord(entry) {
    state.current = entry;
    renderWord($("#wsLeft"), entry, state.page);
    $("#numRight").textContent = state.page * 2;
    $("#backBtn").hidden = state.page <= 1;
  }

  // Pages the child has drawn on, in page order.
  function drawings() {
    return state.pages.filter(p => p.image).map(p => ({ word: p.entry.w, sentence: sentenceFor(p.entry.w).text, image: p.image }));
  }

  function openPage(i) {
    state.idx = i; state.page = i + 1;
    const pg = state.pages[i];
    pad.load(pg.img);
    showWord(pg.entry);
  }

  // Tile taps + sound-it-out
  $("#word").addEventListener("click", (e) => {
    const t = e.target.closest(".tile"); if (!t) return;
    const s = soundFor(state.current, +t.dataset.i);
    light(+t.dataset.i);
    if (s) Sound.say(s, { rate: 0.7 }); else toast("This e is quiet! 🤫");
  });
  function light(i) {
    document.querySelectorAll("#word .tile").forEach((t, j) => t.classList.toggle("lit", j === i));
  }
  $("#hearWord").onclick = () => {
    const w = $("#word"); w.classList.remove("cheer"); void w.offsetWidth; w.classList.add("cheer");
    Sound.say(state.current.w, { rate: 0.75 });
  };
  $("#soundOut").onclick = async () => {
    const e = state.current;
    for (let i = 0; i < e.parts.length; i++) {
      if (state.current !== e) return;
      light(i);
      const s = soundFor(e, i);
      if (s) await Sound.say(s, { rate: 0.7 });
      else await new Promise(r => setTimeout(r, 450));
      await new Promise(r => setTimeout(r, 120));
    }
    light(-1);
    if (state.current !== e) return;
    const w = $("#word"); w.classList.remove("cheer"); void w.offsetWidth; w.classList.add("cheer");
    await Sound.say(e.w, { rate: 0.8 });
  };

  // ---------- drawing pad ----------
  const pad = Pad.create({ canvas: $("#pad"), crayonsEl: $("#crayons"), toolsEl: $(".tools") });

  // ---------- page flip ----------
  const portrait = () => matchMedia("(max-aspect-ratio: 5/6)").matches;

  function cloneLayer(layer) {
    const c = layer.cloneNode(true);
    c.removeAttribute("id");
    c.querySelectorAll("[id]").forEach(n => n.removeAttribute("id"));
    const src = layer.querySelectorAll("canvas"), dst = c.querySelectorAll("canvas");
    src.forEach((cv, i) => { try { dst[i].getContext("2d").drawImage(cv, 0, 0); } catch (e) {} });
    c.classList.add("clone");
    c.style.position = "absolute"; c.style.zIndex = "auto";
    c.setAttribute("aria-hidden", "true");
    return c;
  }

  // Flip the right (or bottom) page over. `oldLayer` = snapshot of what's showing now;
  // `update()` changes the real workspace to the next state underneath.
  // `back` = true flips the left (or top) page back to the previous page.
  function flip(oldLayer, update, reverse = false) {
    return new Promise(resolve => {
      const spread = $("#spread");
      const pt = portrait();
      const cover = oldLayer; // the half that doesn't move stays still
      cover.style.clipPath = reverse
        ? (pt ? "inset(50% 0 0 0)" : "inset(0 0 0 50%)")
        : (pt ? "inset(0 0 50% 0)" : "inset(0 50% 0 0)");
      cover.style.zIndex = "20";
      if (!cover.parentNode) spread.appendChild(cover);

      update();

      const leaf = document.createElement("div");
      leaf.className = reverse ? "leaf rev" : "leaf";
      const front = document.createElement("div"); front.className = "face front";
      const back = document.createElement("div"); back.className = "face back";
      const frontClone = cover === $("#intro") ? cloneLayer(cover) : cover.cloneNode(true);
      frontClone.style.clipPath = "none"; frontClone.classList.add("clone");
      // copy canvas pixels into the clone
      cover.querySelectorAll("canvas").forEach((cv, i) => { const d = frontClone.querySelectorAll("canvas")[i]; if (d) d.getContext("2d").drawImage(cv, 0, 0); });
      front.appendChild(frontClone);
      back.appendChild(cloneLayer($("#workspace")));
      front.insertAdjacentHTML("beforeend", '<div class="shade"></div>');
      back.insertAdjacentHTML("beforeend", '<div class="shade"></div>');
      leaf.append(front, back);
      spread.appendChild(leaf);

      Sound.flip();
      const axis = pt ? "rotateX" : "rotateY";
      const end = (pt ? 180 : -180) * (reverse ? -1 : 1);
      const dur = 900;
      const a = leaf.animate([
        { transform: `${axis}(0deg)` },
        { transform: `${axis}(${end / 2}deg) ${pt ? "" : "scaleX(1.02)"}`, offset: 0.5 },
        { transform: `${axis}(${end}deg)` },
      ], { duration: dur, easing: "cubic-bezier(.45,.05,.35,1)", fill: "forwards" });
      front.querySelector(".shade").animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur / 2, fill: "forwards" });
      back.querySelector(".shade").animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur / 2, delay: dur / 2, fill: "both" });
      a.finished.then(() => {
        leaf.remove();
        if (cover === $("#intro")) { cover.hidden = true; cover.style.clipPath = ""; }
        else cover.remove();
        resolve();
      });
    });
  }

  // ---------- intro & name ----------
  const intro = Intro.play($("#stage"), revealName);
  $("#skipIntro").onclick = () => intro.skip();

  function revealName() {
    $("#skipIntro").classList.add("hide");
    $("#nameCard").classList.add("show");
    $("#nameNext").classList.add("show");
    const inp = $("#nameInput");
    if (state.name) inp.value = state.name;
    if (!matchMedia("(pointer: coarse)").matches) setTimeout(() => inp.focus({ preventScroll: true }), 350);
  }
  $("#sayQ").onclick = () => Sound.say("What is your name?");

  $("#nameCard").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (state.busy) return;
    const name = $("#nameInput").value.trim().replace(/\s+/g, " ");
    if (!name) {
      const c = $("#nameCard"); c.classList.remove("wiggle"); void c.offsetWidth; c.classList.add("wiggle");
      Sound.say("Type your name!");
      return;
    }
    state.name = name.charAt(0).toUpperCase() + name.slice(1);
    try { localStorage.setItem("dw-name", state.name); } catch (e) {}
    $("#nameInput").blur();
    state.busy = true;
    await flip($("#intro"), () => {
      state.pages = [{ entry: nextWord(), image: null, img: null }];
      openPage(0);
      $("#workspace").removeAttribute("aria-hidden");
    });
    state.busy = false;
    Sound.say(`Hi ${state.name}! Read the word. Then draw it!`);
  });

  // ---------- next / back ----------
  function saveCurrent() {
    const pg = state.pages[state.idx];
    if (!pg) return false;
    if (pad.dirty) {
      pg.image = pad.toDataURL();
      const img = new Image(); img.src = pg.image; pg.img = img;
      return true;
    }
    pg.image = null; pg.img = null;
    return false;
  }

  async function turn(to, back) {
    if (state.busy) return;
    state.busy = true;
    if (saveCurrent() && !back) Sound.pop();
    if (to >= state.pages.length) state.pages.push({ entry: nextWord(), image: null, img: null });
    const target = state.pages[to];
    if (target.img && !target.img.complete) await target.img.decode().catch(() => {});
    const snap = cloneLayer($("#workspace"));
    await flip(snap, () => openPage(to), back);
    state.busy = false;
  }
  $("#nextWord").onclick = () => turn(state.idx + 1, false);
  $("#backBtn").onclick = () => { if (state.idx > 0) turn(state.idx - 1, true); };

  // ---------- done → movie ----------
  $("#doneBtn").onclick = () => {
    if (state.busy) return;
    saveCurrent();
    const list = drawings();
    if (!list.length) {
      toast("Draw a picture first! ✏️");
      Sound.say("Draw a picture first!");
      return;
    }
    renderWord($("#wsLeft"), state.current, state.page);
    Movie.open({ name: state.name, drawings: list });
  };
  $("#moreWords").onclick = () => {
    Movie.close();
    turn(state.pages.length, false); // a brand-new word
  };

  // ---------- misc ----------
  const st = $("#soundToggle");
  const paintSound = () => { st.textContent = Sound.enabled ? "🔈" : "🔇"; st.setAttribute("aria-pressed", String(Sound.enabled)); };
  st.onclick = () => { Sound.enabled = !Sound.enabled; paintSound(); };
  paintSound();
  document.addEventListener("pointerdown", () => Sound.ctx(), { once: true });

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  window.toast = toast;

  $("#workspace").setAttribute("aria-hidden", "true");
  showWord(nextWord()); // pre-render so the flip reveals a real page
  state.queue.unshift(state.current); // ...but keep that word for the real first page
})();
