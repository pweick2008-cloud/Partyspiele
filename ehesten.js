"use strict";

/* =========================================================
   Wer würde am ehesten? – Pass & Play
   Einer liest die Frage vor, die Gruppe entscheidet, wer es am
   ehesten und wer es am wenigsten tun würde. Am Ende gibt es eine
   Auswertung pro Spieler.
   ========================================================= */
const WWAE = (() => {
  const STORE = "wwae-v1";
  const USED = "wwae-used-v1";
  const MIN = 3;
  const MAX = 20;

  let names = [];
  let game = null; // { players, deck, pos, picks: [{ q, most, least }], most, least }

  const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  };
  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* egal */ }
  };

  /* ---------- Start ---------- */
  function openSetup() {
    const saved = load(STORE, null);
    // Beim ersten Mal die Namen aus Verräter übernehmen, falls vorhanden
    names = saved && Array.isArray(saved.names) ? saved.names : settings.names.filter((n) => n.trim()).slice();
    while (names.length < MIN) names.push("");
    names = names.slice(0, MAX);
    renderSetup();
    showScreen("wwae-setup", "setup");
  }

  function renderSetup() {
    const list = $("wwae-players");
    list.innerHTML = "";
    names.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.innerHTML = `<span class="num">${i + 1}.</span>`;
      const input = document.createElement("input");
      input.type = "text";
      input.value = name;
      input.placeholder = `Spieler ${i + 1}`;
      input.maxLength = 24;
      input.autocomplete = "off";
      input.autocapitalize = "words";
      input.addEventListener("input", () => { names[i] = input.value; save(STORE, { names }); });
      row.appendChild(input);
      list.appendChild(row);
    });
    $("wwae-count").textContent = names.length;
    $("wwae-error").hidden = true;
    $("wwae-total").textContent = `${WWAE_QUESTIONS.length} Fragen`;
  }

  function changeCount(dir) {
    if (dir > 0 && names.length < MAX) names.push("");
    if (dir < 0 && names.length > MIN) names.pop();
    save(STORE, { names });
    renderSetup();
  }

  function start() {
    const clean = names.map((n) => n.trim());
    const err = (t) => { $("wwae-error").textContent = t; $("wwae-error").hidden = false; };
    if (clean.some((n) => !n)) return err("Bitte gib allen Spielern einen Namen.");
    if (new Set(clean.map(normalize)).size !== clean.length) return err("Jeder Name darf nur einmal vorkommen.");

    // Zuletzt gespielte Fragen kommen ans Ende des Stapels
    const used = new Set(load(USED, []));
    const all = WWAE_QUESTIONS.map((_, i) => i);
    const deck = [...shuffle(all.filter((i) => !used.has(i))), ...shuffle(all.filter((i) => used.has(i)))];
    game = { players: clean, deck, pos: 0, picks: [], most: null, least: null };
    renderGame();
    showScreen("wwae-game", "game");
  }

  /* ---------- Fragen ---------- */
  function renderGame() {
    const q = WWAE_QUESTIONS[game.deck[game.pos % game.deck.length]];
    $("wwae-num").textContent = `Frage ${game.picks.length + 1}`;
    const card = $("wwae-question");
    if (card.dataset.pos !== String(game.pos)) {
      card.dataset.pos = String(game.pos);
      card.textContent = `${q}?`;
      const box = $("wwae-card");
      box.classList.remove("pop");
      void box.offsetWidth;
      box.classList.add("pop");
    }
    chips("wwae-most", "most");
    chips("wwae-least", "least");
    $("wwae-next").disabled = game.most === null || game.least === null;
  }

  function chips(boxId, key) {
    const box = $(boxId);
    box.innerHTML = "";
    game.players.forEach((name, i) => {
      box.appendChild(makeChip(name, game[key] === i, () => {
        game[key] = game[key] === i ? null : i;
        // Dieselbe Person kann nicht beides sein
        const other = key === "most" ? "least" : "most";
        if (game[other] === i) game[other] = null;
        renderGame();
      }));
    });
  }

  function next(skip) {
    const qi = game.deck[game.pos % game.deck.length];
    if (!skip) {
      game.picks.push({ q: qi, most: game.most, least: game.least });
      const used = load(USED, []).filter((x) => x !== qi);
      used.push(qi);
      save(USED, used.slice(-Math.floor(WWAE_QUESTIONS.length * 0.7)));
    }
    game.pos++;
    game.most = null;
    game.least = null;
    renderGame();
    window.scrollTo(0, 0);
  }

  /* ---------- Auswertung ---------- */
  function finish() {
    renderEnd();
    showScreen("wwae-end", "end");
  }

  function renderEnd() {
    const n = game.picks.length;
    $("wwae-end-sub").textContent = n ? `${n} ${n === 1 ? "Frage" : "Fragen"} gespielt` : "Noch keine Frage entschieden";
    const wrap = $("wwae-results");
    wrap.innerHTML = "";
    const stats = game.players.map((name, i) => ({
      name,
      most: game.picks.filter((p) => p.most === i).map((p) => WWAE_QUESTIONS[p.q]),
      least: game.picks.filter((p) => p.least === i).map((p) => WWAE_QUESTIONS[p.q])
    })).sort((a, b) => b.most.length - a.most.length || a.least.length - b.least.length);

    for (const s of stats) {
      const card = document.createElement("div");
      card.className = "card wwae-person";
      const list = (title, items) => items.length
        ? `<div class="wwae-list"><span class="role-label">${title}</span><ul>${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>`
        : "";
      card.innerHTML = `
        <div class="row-between">
          <h2>${escapeHtml(s.name)}</h2>
          <span class="wwae-tally"><span class="pill">${s.most.length}× am ehesten</span><span class="pill">${s.least.length}× am wenigsten</span></span>
        </div>
        ${list("Am ehesten", s.most)}${list("Am wenigsten", s.least)}
        ${!s.most.length && !s.least.length ? '<p class="muted small">Wurde kein einziges Mal gewählt – unauffällig oder verdächtig?</p>' : ""}`;
      wrap.appendChild(card);
    }
  }

  /* ---------- Events ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("wwae-stepper").addEventListener("click", (e) => {
      const b = e.target.closest("[data-dir]");
      if (b) changeCount(Number(b.dataset.dir));
    });
    $("wwae-start").addEventListener("click", start);
    $("wwae-next").addEventListener("click", () => next(false));
    $("wwae-skip").addEventListener("click", () => next(true));
    $("wwae-finish").addEventListener("click", finish);
    $("wwae-continue").addEventListener("click", () => { renderGame(); showScreen("wwae-game", "game"); });
    $("wwae-new").addEventListener("click", openSetup);
  });

  return { openSetup };
})();
