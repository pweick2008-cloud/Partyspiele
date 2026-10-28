"use strict";

/* =========================================================
   Galerie – Online (3 bis 12 Spieler)
   Alle zeichnen denselben Begriff, danach wird in der Galerie für die
   beste Zeichnung abgestimmt. Nutzt das Zeichenfeld von Kritzeln
   (Handballen-Erkennung, Druck, Zoom-Sperre).
   ========================================================= */
const GalOnline = (() => {
  const COLORS = [
    "#111111", "#7a7a7a", "#c8c8c8", "#ffffff", "#e53935", "#f06292", "#fb8c00", "#fdd835", "#ffcc80",
    "#6d4c41", "#43a047", "#9ccc65", "#00897b", "#1e88e5", "#81d4fa", "#3949ab", "#8e24aa", "#b39ddb"
  ];
  const SIZES = [0.004, 0.009, 0.016, 0.03];
  const TIMES = [45, 60, 90, 120, 180];

  let state = null;
  let canvas = null; // eigenes Zeichenfeld
  let drawKey = null; // Runde, für die das Zeichenfeld vorbereitet ist
  let gallery = { key: null, drawings: new Map() }; // Kennung → Striche
  let galleryAsked = null;
  let clockTimer = null;
  let clockOffset = 0;

  const g = () => state.game;
  const isHost = () => Online.isHost();
  const nameOf = (id) => (g().players.find((p) => p.id === id) || {}).name || "?";

  function render(s) {
    state = s;
    const phase = s.game.phase;
    if (phase !== "draw") { stopClock(); DrawCanvas.unlockZoom(); if (canvas) canvas.disable(); }
    if (phase === "write") { renderWrite(); return "gal-write"; }
    if (phase === "draw") { renderDraw(); return "gal-draw"; }
    askGallery();
    if (phase === "vote") { renderVote(); return "gal-vote"; }
    renderResults();
    return "gal-results";
  }

  // Wird aufgerufen, wenn der Bildschirm verlassen wird (Lobby verlassen o. Ä.)
  function release() {
    stopClock();
    DrawCanvas.unlockZoom();
    if (canvas) canvas.disable();
  }

  /* ---------- Lobby-Einstellungen ---------- */
  function renderLobbySettings(s) {
    state = s;
    const host = isHost();
    const st = s.galSettings;
    $("gal-host-pill").textContent = host ? "Du bist Host" : "Nur der Host kann ändern";
    const times = $("gal-times");
    times.innerHTML = "";
    for (const t of TIMES) times.appendChild(makeChip(`${t} s`, st.time === t, host ? () => sendSettings({ time: t }) : null));
    times.classList.toggle("static", !host);
    const terms = $("gal-terms-count");
    terms.innerHTML = "";
    for (const n of [1, 2, 3]) terms.appendChild(makeChip(String(n), st.terms === n, host ? () => sendSettings({ terms: n }) : null));
    terms.classList.toggle("static", !host);
  }

  function sendSettings(settings) {
    Online.send({ type: "galSettings", settings });
  }

  function playerList(listId, countId, labels) {
    const list = $(listId);
    list.innerHTML = "";
    const relevant = g().players.filter((p) => !p.left && p.done !== null);
    for (const p of g().players.filter((x) => !x.left)) {
      const li = document.createElement("li");
      li.className = "lobby-player" + (p.connected ? "" : " offline");
      const badge = p.done === null ? `<span class="badge">${labels.idle}</span>`
        : `<span class="badge${p.done ? " win" : ""}">${p.done ? labels.done : labels.busy}</span>`;
      li.innerHTML = `<span class="avatar"></span><span class="profile-name"></span>${badge}`;
      li.querySelector(".avatar").textContent = p.name.charAt(0).toUpperCase();
      li.querySelector(".profile-name").textContent = p.name + (p.id === state.you ? " (Du)" : "");
      list.appendChild(li);
    }
    $(countId).textContent = `${relevant.filter((p) => p.done).length}/${relevant.length}`;
  }

  /* ---------- 1. Begriffe ---------- */
  let termsKey = null;
  function renderWrite() {
    const game = g();
    const mine = game.myTerms;
    const key = `${game.turnKey}|${game.termsPer}`;
    if (key !== termsKey) {
      termsKey = key;
      const box = $("gal-term-fields");
      box.innerHTML = "";
      for (let i = 0; i < game.termsPer; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 40;
        input.autocomplete = "off";
        input.placeholder = game.termsPer === 1 ? "z. B. Pinguin im Urlaub" : `Begriff ${i + 1}`;
        input.addEventListener("input", updateTermButton);
        box.appendChild(input);
      }
    }
    $("gal-write-sub").textContent = game.termsPer === 1 ? "Schreib einen Begriff, den alle zeichnen sollen" : `Schreib ${game.termsPer} Begriffe, die alle zeichnen sollen`;
    $("gal-write-form").hidden = !!mine;
    $("gal-write-sent").hidden = !mine;
    if (mine) $("gal-write-mine").innerHTML = mine.map((t) => `<span class="chip selected">${escapeHtml(t)}</span>`).join("");
    playerList("gal-write-list", "gal-write-count", { done: "fertig", busy: "schreibt …", idle: "–" });
    $("gal-write-force").hidden = !isHost();
    updateTermButton();
  }

  const termInputs = () => [...$("gal-term-fields").querySelectorAll("input")];
  function updateTermButton() {
    $("gal-write-send").disabled = termInputs().some((i) => i.value.trim().length < 2);
  }

  /* ---------- 2. Zeichnen ---------- */
  function ensureCanvas() {
    if (canvas) return;
    canvas = new DrawCanvas($("gal-canvas"));
    const colors = $("gal-colors");
    for (const c of COLORS) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "draw-color gal-color";
      b.style.background = c;
      b.dataset.color = c;
      b.setAttribute("aria-label", `Farbe ${c}`);
      b.addEventListener("click", () => {
        canvas.color = c;
        if (canvas.tool === "eraser") canvas.tool = "pen";
        updateToolbar();
      });
      colors.appendChild(b);
    }
    const sizes = $("gal-sizes");
    SIZES.forEach((sz, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "draw-size gal-size";
      b.dataset.size = sz;
      b.setAttribute("aria-label", `Strichstärke ${i + 1}`);
      b.innerHTML = `<span style="width:${6 + i * 6}px;height:${6 + i * 6}px"></span>`;
      b.addEventListener("click", () => { canvas.size = sz; updateToolbar(); });
      sizes.appendChild(b);
    });
    canvas.size = SIZES[1];
    document.querySelectorAll("[data-gtool]").forEach((b) =>
      b.addEventListener("click", () => { canvas.tool = b.dataset.gtool; updateToolbar(); }));
    $("gal-undo").addEventListener("click", () => canvas.undo());
    $("gal-clear").addEventListener("click", async () => {
      const ok = await showModal({ emoji: "", title: "Alles löschen?", text: "Die ganze Zeichnung wird geleert.", ok: "Leeren", cancel: "Abbrechen" });
      if (ok) canvas.clearAll();
    });
    updateToolbar();
  }

  function updateToolbar() {
    document.querySelectorAll(".gal-color").forEach((b) => b.classList.toggle("selected", b.dataset.color === canvas.color && canvas.tool !== "eraser"));
    document.querySelectorAll(".gal-size").forEach((b) => b.classList.toggle("selected", Number(b.dataset.size) === canvas.size));
    document.querySelectorAll("[data-gtool]").forEach((b) => b.classList.toggle("selected", b.dataset.gtool === canvas.tool));
  }

  function renderDraw() {
    ensureCanvas();
    const game = g();
    if (game.turnKey !== drawKey) {
      drawKey = game.turnKey;
      canvas.reset();
      Online.send({ type: "galMine" }); // eigene Striche nach Neuladen zurückholen
    }
    const done = game.myDone;
    const me = game.players.find((p) => p.id === state.you);
    const drawing = me && me.done !== null;
    $("gal-round").textContent = `Begriff ${game.round} von ${game.rounds}`;
    $("gal-term").textContent = game.term;
    $("gal-tools").hidden = done || !drawing;
    $("gal-done").hidden = done || !drawing;
    $("gal-edit").hidden = !done;
    $("gal-draw-hint").textContent = !drawing
      ? "Du zeichnest in dieser Runde nicht mit."
      : done ? "Fertig! Du kannst noch weiterzeichnen, solange die Zeit läuft." : "Alle zeichnen gleichzeitig denselben Begriff.";
    if (drawing && !done) {
      if (!canvas.input) canvas.enable({ send: (op) => Online.send({ type: "galOp", op }) });
      DrawCanvas.lockZoom();
    } else {
      canvas.disable();
      DrawCanvas.unlockZoom();
    }
    playerList("gal-draw-list", "gal-draw-count", { done: "fertig", busy: "zeichnet …", idle: "–" });
    $("gal-draw-force").hidden = !isHost();
    clockOffset = game.now - Date.now();
    startClock();
  }

  function startClock() {
    stopClock();
    const tick = () => {
      if (!state || !g().endsAt) return;
      const left = Math.max(0, Math.ceil((g().endsAt - (Date.now() + clockOffset)) / 1000));
      $("gal-timer").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      $("gal-timer").classList.toggle("urgent", left <= 10);
    };
    tick();
    clockTimer = setInterval(tick, 250);
  }

  function stopClock() {
    clearInterval(clockTimer);
    clockTimer = null;
  }

  /* ---------- Galerie ---------- */
  function askGallery() {
    const key = g().turnKey;
    if (gallery.key === key || galleryAsked === key) return;
    galleryAsked = key;
    Online.send({ type: "galGallery" });
  }

  function handleMessage(msg) {
    if (msg.type === "galMine" && canvas && msg.key === drawKey) {
      canvas.setOps(msg.ops || []);
    } else if (msg.type === "galGallery") {
      gallery = { key: msg.key, drawings: new Map((msg.drawings || []).map((d) => [d.key, d.ops])) };
      if (state && state.game && state.game.type === "galerie") {
        if (g().phase === "vote") renderVote();
        else if (g().phase === "results" || g().phase === "over") renderResults();
      }
    }
  }

  // Eine Zeichnung als Bild im Rahmen (nur anzeigen, nicht zeichnen).
  // Fertige Rahmen werden wiederverwendet, damit nichts flackert.
  const frames = new Map();
  function frame(key) {
    const loaded = gallery.key === g().turnKey && gallery.drawings.has(key);
    const id = `${g().turnKey}|${key}|${loaded}`;
    if (frames.has(id)) return frames.get(id);
    if (frames.size > 60) frames.clear();
    const wrap = document.createElement("div");
    wrap.className = "gal-frame";
    const c = document.createElement("canvas");
    c.className = "draw-canvas";
    wrap.appendChild(c);
    const ops = gallery.key === g().turnKey ? gallery.drawings.get(key) : null;
    requestAnimationFrame(() => {
      const view = new DrawCanvas(c);
      if (ops) view.setOps(ops);
    });
    if (!ops) wrap.classList.add("loading");
    frames.set(id, wrap);
    return wrap;
  }

  /* ---------- 3. Abstimmen ---------- */
  function renderVote() {
    const game = g();
    $("gal-vote-sub").textContent = `„${game.term}“ · Begriff ${game.round} von ${game.rounds}`;
    $("gal-vote-hint").textContent = !game.canVote
      ? "Hier gibt es keine fremde Zeichnung, für die du stimmen kannst."
      : game.myVote ? "Stimme abgegeben – du kannst sie noch ändern, bis alle abgestimmt haben."
        : "Tippe auf die beste Zeichnung. Deine eigene kannst du nicht wählen.";
    const list = $("gal-vote-list");
    list.innerHTML = "";
    game.items.forEach((item, i) => {
      const card = document.createElement("div");
      card.className = "gal-item" + (game.myVote === item.key ? " selected" : "") + (item.mine ? " mine" : "");
      card.appendChild(frame(item.key));
      const label = document.createElement("span");
      label.className = "gal-label";
      label.textContent = item.mine ? "Deine Zeichnung" : `Nr. ${i + 1}`;
      card.appendChild(label);
      if (!item.mine && game.canVote) {
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.addEventListener("click", () => Online.send({ type: "galVote", key: item.key }));
      }
      list.appendChild(card);
    });
    playerList("gal-vote-players", "gal-vote-count", { done: "abgestimmt", busy: "schaut …", idle: "–" });
    $("gal-vote-force").hidden = !isHost();
  }

  /* ---------- 4. Ergebnis ---------- */
  function renderResults() {
    const game = g();
    const over = game.phase === "over";
    const host = isHost();
    $("gal-results-title").textContent = over ? "Endstand" : "Ergebnis";
    $("gal-results-sub").textContent = game.term
      ? `„${game.term}“${game.termAuthor ? ` – Begriff von ${nameOf(game.termAuthor)}` : ""}`
      : "";
    const list = $("gal-results-list");
    list.innerHTML = "";
    const items = (game.items || []).slice().sort((a, b) => b.votes - a.votes);
    if (!items.length) list.innerHTML = '<p class="muted center">Diesmal hat niemand etwas gezeichnet.</p>';
    for (const item of items) {
      const card = document.createElement("div");
      card.className = "gal-item" + (item.winner ? " winner" : "");
      card.appendChild(frame(item.key));
      const label = document.createElement("div");
      label.className = "gal-plate";
      label.innerHTML = `<strong></strong><span>${item.votes} ${item.votes === 1 ? "Stimme" : "Stimmen"} · +${item.points}</span>`;
      label.querySelector("strong").textContent = nameOf(item.owner) + (item.owner === state.you ? " (Du)" : "");
      card.appendChild(label);
      list.appendChild(card);
    }

    const ranked = game.players.slice().sort((a, b) => b.total - a.total);
    const rank = $("gal-ranking");
    rank.innerHTML = "";
    let place = 0;
    let prev = null;
    ranked.forEach((p, i) => {
      if (p.total !== prev) place = i + 1;
      prev = p.total;
      const li = document.createElement("li");
      li.className = "slf-rank" + (p.id === state.you ? " me" : "") + (place === 1 ? " first" : "");
      li.innerHTML = `<span class="slf-place">${place}.</span><span class="slf-rank-name"></span><span class="slf-gain muted small"></span><span class="slf-total">${p.total}</span>`;
      li.querySelector(".slf-rank-name").textContent = p.name + (p.id === state.you ? " (Du)" : "");
      li.querySelector(".slf-gain").textContent = `+${(game.roundPoints || {})[p.id] || 0}`;
      rank.appendChild(li);
    });
    $("gal-next").hidden = !host || over;
    $("gal-again").hidden = !host || !over;
    $("gal-to-lobby").hidden = !host || !over;
    $("gal-results-wait").hidden = host;
  }

  /* ---------- Events ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("gal-write-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const terms = termInputs().map((i) => i.value.trim());
      if (terms.every((t) => t.length >= 2)) Online.send({ type: "galTerms", terms });
    });
    $("gal-write-edit").addEventListener("click", () => Online.send({ type: "galUnterms" }));
    $("gal-done").addEventListener("click", () => Online.send({ type: "galDone" }));
    $("gal-edit").addEventListener("click", () => Online.send({ type: "galUndone" }));
    const force = (title, text) => () => Online.confirmHost(title, text, "galForce");
    $("gal-write-force").addEventListener("click", force("Nicht länger warten?", "Es werden nur die Begriffe gezeichnet, die schon da sind."));
    $("gal-draw-force").addEventListener("click", force("Zeichnen beenden?", "Alle Zeichnungen kommen so in die Galerie, wie sie gerade sind."));
    $("gal-vote-force").addEventListener("click", force("Abstimmung beenden?", "Es zählen nur die Stimmen, die schon abgegeben sind."));
    $("gal-next").addEventListener("click", () => Online.send({ type: "galNext" }));
    $("gal-again").addEventListener("click", () => Online.send({ type: "start" }));
    $("gal-to-lobby").addEventListener("click", () => Online.send({ type: "endGame" }));
    document.querySelectorAll(".gal-leave").forEach((b) => b.addEventListener("click", () => Online.leaveLobby()));
  });

  return { render, renderLobbySettings, handleMessage, release };
})();
