"use strict";

/* =========================================================
   Geheime Auktion – ein Gerät in der Mitte (2 bis 4 Spieler)
   Jeder Spieler hat ein Bieterfeld an seiner Tischseite, zu ihm gedreht.
   Erst 20 s Lesezeit, dann darf geboten werden (ohne Zeitlimit).
   Nach jedem Gebot läuft „Zum Ersten, zum Zweiten, zum Dritten“ –
   bietet keiner mehr, ist das Los verkauft.
   Die Lose (auktion-lose.js) werden erst beim Start geladen.
   ========================================================= */
const LocalAuktion = (() => {
  const STORE = "auktion-v1";
  const USED = "auktion-used-v1";
  // Ecken: 1 unten links, 2 gegenüber oben rechts, 3 unten rechts, 4 oben links
  const SEATS = ["bl", "tr", "br", "tl"];

  let setup = { names: ["", ""], lots: 10 };
  let game = null;
  let timer = null;
  let cardTurn = 0; // Loskarte in der Mitte: 0 = zu den unteren, 1 = zu den oberen Spielern
  let losePromise = null;

  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* egal */ } };

  function loadLose() {
    if (typeof AUKTION_LOSE !== "undefined") return Promise.resolve();
    if (!losePromise) {
      losePromise = new Promise((resolve, reject) => {
        const el = document.createElement("script");
        el.src = "auktion-lose.js";
        el.onload = resolve;
        el.onerror = () => { losePromise = null; reject(new Error("Lose nicht geladen")); };
        document.head.appendChild(el);
      });
    }
    return losePromise;
  }

  /* ---------- Start ---------- */
  function openSetup() {
    const saved = load(STORE, null);
    if (saved && Array.isArray(saved.names)) setup = { ...setup, ...saved };
    setup.names = setup.names.slice(0, 4);
    while (setup.names.length < 2) setup.names.push("");
    renderSetup();
    showScreen("auk-setup", "setup");
  }

  function renderSetup() {
    const list = $("auk-players");
    list.innerHTML = "";
    setup.names.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.innerHTML = `<span class="num">${i + 1}.</span>`;
      const input = document.createElement("input");
      input.type = "text";
      input.value = name;
      input.maxLength = 16;
      input.placeholder = `Spieler ${i + 1}`;
      input.autocomplete = "off";
      input.addEventListener("input", () => { setup.names[i] = input.value; save(STORE, setup); });
      row.appendChild(input);
      list.appendChild(row);
    });
    $("auk-count").textContent = setup.names.length;
    const lots = $("auk-lot-count");
    lots.innerHTML = "";
    for (const n of AUK.LOT_COUNTS) lots.appendChild(makeChip(String(n), setup.lots === n, () => { setup.lots = n; save(STORE, setup); renderSetup(); }));
    $("auk-error").hidden = true;
  }

  async function start() {
    const names = setup.names.map((n) => n.trim());
    const err = (t) => { $("auk-error").textContent = t; $("auk-error").hidden = false; };
    if (names.some((n) => !n)) return err("Bitte gib allen Spielern einen Namen.");
    if (new Set(names.map(normalize)).size !== names.length) return err("Jeder Name darf nur einmal vorkommen.");
    try { await loadLose(); } catch (e) { return err("Die Lose konnten nicht geladen werden."); }
    const lots = aukBuildCatalog(AUKTION_LOSE, setup.lots, load(USED, []));
    save(USED, [...load(USED, []), ...lots.map((l) => l.id)].slice(-Math.floor(AUKTION_LOSE.length * 0.6)));
    game = {
      players: names.map((name, i) => ({ id: i, name, money: AUK.START_MONEY, seat: SEATS[i] })),
      lots,
      index: -1
    };
    cardTurn = 0;
    nextLot();
    // Mehrere Finger gleichzeitig auf dem Tablet sollen nicht zoomen
    DrawCanvas.lockZoom();
    showScreen("auk-board", "auktion");
  }

  /* ---------- Bieten ---------- */
  function nextLot() {
    game.index++;
    if (game.index >= game.lots.length) return finish();
    Object.assign(game, { phase: "read", bid: 0, bidder: null, endsAt: Date.now() + AUK.READ_MS });
    startTimer();
    render();
  }

  function bid(playerId, step) {
    if (!game || (game.phase !== "open" && game.phase !== "going")) return;
    const p = game.players[playerId];
    const amount = game.bid + step;
    if (game.bidder === playerId || amount > p.money) return;
    Object.assign(game, { bid: amount, bidder: playerId, phase: "going", endsAt: Date.now() + AUK.GOING_MS });
    if (navigator.vibrate) navigator.vibrate(15);
    render();
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(tick, 100);
  }

  function tick() {
    if (!game || (game.phase !== "read" && game.phase !== "open" && game.phase !== "going")) return;
    if (game.phase === "read" && Date.now() >= game.endsAt) {
      // Lesezeit vorbei: ab jetzt darf geboten werden, ohne Zeitlimit
      Object.assign(game, { phase: "open", endsAt: null });
    } else if (game.phase === "going" && Date.now() >= game.endsAt) {
      const lot = game.lots[game.index];
      if (game.bidder !== null) {
        lot.buyer = game.bidder;
        lot.price = game.bid;
        game.players[game.bidder].money -= game.bid;
      } else {
        lot.buyer = null;
        lot.price = 0;
      }
      game.phase = "sold";
      clearInterval(timer);
    }
    render();
  }

  // Keiner will bieten: Los geht zurück
  function pass() {
    if (!game || game.phase !== "open") return;
    const lot = game.lots[game.index];
    lot.buyer = null;
    lot.price = 0;
    game.phase = "sold";
    clearInterval(timer);
    render();
  }

  // Text zum Countdown: nach einem Gebot „Zum Ersten … Zum Dritten“
  function goingText(left) {
    if (game.phase === "read") return `Lesezeit – bieten in ${Math.ceil(left / 1000)} s`;
    if (game.phase === "open") return "Jetzt darf geboten werden!";
    const part = AUK.GOING_MS / 3;
    if (left > 2 * part) return "Zum Ersten …";
    if (left > part) return "Zum Zweiten …";
    return "Zum Dritten …";
  }

  function render() {
    const lot = game.lots[game.index];
    const board = $("auk-board");
    board.dataset.players = game.players.length;
    // Loskarte
    $("auk-lot-num").textContent = `Los ${game.index + 1} von ${game.lots.length} · ${lot.category}`;
    $("auk-lot-title").textContent = lot.title;
    $("auk-lot-desc").textContent = lot.desc;
    $("auk-lot-estimate").textContent = `Schätzpreis ${lot.estimate}`;
    $("auk-card").style.setProperty("--turn", `${cardTurn * 180}deg`);
    // Gebot und Countdown
    const left = Math.max(0, (game.endsAt || 0) - Date.now());
    const bidder = game.bidder !== null ? game.players[game.bidder].name : null;
    $("auk-bid").textContent = game.bid ? game.bid : "–";
    $("auk-bidder").textContent = game.phase === "sold"
      ? (bidder ? `Verkauft an ${bidder}!` : "Kein Gebot – das Los geht zurück.")
      : bidder ? `Höchstgebot: ${bidder}` : "Noch kein Gebot";
    $("auk-going").textContent = game.phase === "sold" ? "" : goingText(left);
    $("auk-going").classList.toggle("hot", game.phase === "going" && left < AUK.GOING_MS / 3);
    const share = game.phase === "read" ? left / AUK.READ_MS : game.phase === "going" ? left / AUK.GOING_MS : game.phase === "open" ? 1 : 0;
    $("auk-meter").style.transform = `scaleX(${share})`;
    $("auk-pass").hidden = game.phase !== "open";
    $("auk-next").hidden = game.phase !== "sold";
    $("auk-next").textContent = game.index >= game.lots.length - 1 ? "Zur Auflösung" : "Nächstes Los";
    $("auk-center").classList.toggle("sold", game.phase === "sold");
    // Bieterfelder
    for (const seat of SEATS) {
      const el = $(`auk-seat-${seat}`);
      const p = game.players.find((x) => x.seat === seat);
      el.hidden = !p;
      if (!p) continue;
      if (el.dataset.player !== String(p.id)) buildSeat(el, p);
      el.querySelector(".auk-money").textContent = p.money;
      el.classList.toggle("leading", game.bidder === p.id && game.phase !== "sold");
      el.classList.toggle("won", game.bidder === p.id && game.phase === "sold");
      el.querySelectorAll(".auk-step").forEach((b) => {
        const step = Number(b.dataset.step);
        b.disabled = (game.phase !== "open" && game.phase !== "going") || game.bidder === p.id || game.bid + step > p.money;
      });
    }
  }

  function buildSeat(el, p) {
    el.dataset.player = String(p.id);
    el.innerHTML = `
      <div class="auk-seat-inner">
        <div class="auk-seat-head"><strong></strong><span class="auk-money"></span></div>
        <div class="auk-steps">${AUK.STEPS.map((s) => `<button type="button" class="auk-step" data-step="${s}">+${s}</button>`).join("")}</div>
      </div>`;
    el.querySelector("strong").textContent = p.name;
    el.querySelectorAll(".auk-step").forEach((b) =>
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); bid(p.id, Number(b.dataset.step)); }));
  }

  /* ---------- Auflösung ---------- */
  let revealed = 0;
  function finish() {
    clearInterval(timer);
    // Lose, die nicht mehr versteigert wurden, fallen weg
    game.lots = game.lots.filter((l) => l.buyer !== undefined);
    game.phase = "done";
    DrawCanvas.unlockZoom();
    revealed = 0;
    renderReveal();
    showScreen("auk-reveal", "reveal");
  }

  function renderReveal() {
    AuktionView.renderReveal({
      lots: game.lots,
      players: game.players,
      revealed,
      listId: "auk-reveal-list",
      rankingId: "auk-ranking",
      nextId: "auk-reveal-next",
      allId: "auk-reveal-all",
      nameOf: (id) => game.players[id].name
    });
  }

  /* ---------- Events ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("auk-stepper").addEventListener("click", (e) => {
      const b = e.target.closest("[data-dir]");
      if (!b) return;
      const dir = Number(b.dataset.dir);
      if (dir > 0 && setup.names.length < 4) setup.names.push("");
      if (dir < 0 && setup.names.length > 2) setup.names.pop();
      save(STORE, setup);
      renderSetup();
    });
    $("auk-start").addEventListener("click", start);
    $("auk-next").addEventListener("click", () => nextLot());
    $("auk-pass").addEventListener("click", () => pass());
    $("auk-turn").addEventListener("click", () => { cardTurn = 1 - cardTurn; render(); });
    $("auk-quit").addEventListener("click", async () => {
      const ok = await showModal({ emoji: "", title: "Auktion beenden?", text: "Die restlichen Lose werden nicht mehr versteigert. Danach kommt die Auflösung.", ok: "Beenden", cancel: "Weiter bieten" });
      if (ok) finish();
    });
    $("auk-reveal-next").addEventListener("click", () => { revealed++; renderReveal(); });
    $("auk-reveal-all").addEventListener("click", () => { revealed = game.lots.length; renderReveal(); });
    $("auk-again").addEventListener("click", openSetup);
  });

  return { openSetup };
})();

/* =========================================================
   Gemeinsame Anzeige der Auflösung (Pass & Play und online)
   ========================================================= */
const AuktionView = (() => {
  function lotCard(lot, nameOf) {
    const card = document.createElement("div");
    card.className = `card auk-result ${lot.kind}`;
    const bought = lot.buyer !== null && lot.buyer !== undefined;
    const diff = bought ? lot.value - lot.price : 0;
    card.innerHTML = `
      <div class="row-between"><span class="role-label"></span><span class="auk-verdict"></span></div>
      <h3 class="auk-result-title"></h3>
      <p class="auk-result-desc"></p>
      <p class="auk-result-explain"></p>
      <div class="auk-result-nums"></div>`;
    card.querySelector(".role-label").textContent = lot.category;
    card.querySelector(".auk-verdict").textContent = AUK_KIND_LABEL[lot.kind];
    card.querySelector(".auk-result-title").textContent = lot.title;
    card.querySelector(".auk-result-desc").textContent = lot.desc;
    card.querySelector(".auk-result-explain").textContent = lot.explain;
    card.querySelector(".auk-result-nums").innerHTML = `
      <span>Schätzpreis <strong>${lot.estimate}</strong></span>
      <span>Echter Wert <strong>${lot.value}</strong></span>
      <span>${bought ? `${escapeHtml(nameOf(lot.buyer))} zahlte <strong>${lot.price}</strong>` : "Nicht versteigert"}</span>
      ${bought ? `<span class="auk-diff ${diff >= 0 ? "plus" : "minus"}">${diff >= 0 ? "+" : "−"}${Math.abs(diff)}</span>` : ""}`;
    return card;
  }

  function renderReveal({ lots, players, revealed, total = lots.length, listId, rankingId, nextId, allId, nameOf, canControl = true }) {
    const list = $(listId);
    list.innerHTML = "";
    lots.slice(0, revealed).forEach((lot) => list.appendChild(lotCard(lot, nameOf)));
    const done = revealed >= total;
    $(nextId).hidden = done || !canControl;
    $(allId).hidden = done || !canControl;
    $(nextId).textContent = revealed ? "Nächstes Los aufdecken" : "Erstes Los aufdecken";
    const rank = $(rankingId);
    rank.innerHTML = "";
    rank.closest(".card").hidden = !done;
    if (!done) return;
    aukStandings(players, lots).forEach((s, i) => {
      const li = document.createElement("li");
      li.className = "slf-rank" + (i === 0 ? " first" : "");
      li.innerHTML = `<span class="slf-place">${i + 1}.</span><span class="slf-rank-name"></span><span class="slf-gain muted small"></span><span class="slf-total">${s.total}</span>`;
      li.querySelector(".slf-rank-name").textContent = s.name;
      li.querySelector(".slf-gain").textContent = `${s.money} Geld + ${s.worth} Wert`;
      rank.appendChild(li);
    });
  }

  return { renderReveal };
})();
