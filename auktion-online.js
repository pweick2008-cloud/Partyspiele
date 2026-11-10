"use strict";

/* =========================================================
   Geheime Auktion – Online (2 bis 20 Spieler, jeder am eigenen Handy)
   Der Server entscheidet über Zeit und Zuschlag; hier wird nur
   angezeigt und geboten.
   ========================================================= */
const AukOnline = (() => {
  let state = null;
  let clock = null;
  let clockOffset = 0;

  const g = () => state.game;
  const isHost = () => Online.isHost();
  const nameOf = (id) => (g().players.find((p) => p.id === id) || {}).name || "?";

  function render(s) {
    state = s;
    if (g().phase === "reveal") {
      stopClock();
      renderReveal();
      return "auk-oreveal";
    }
    renderBoard();
    return "auk-online";
  }

  /* ---------- Lobby-Einstellungen ---------- */
  function renderLobbySettings(s) {
    state = s;
    const host = isHost();
    $("auk-host-pill").textContent = host ? "Du bist Host" : "Nur der Host kann ändern";
    const box = $("auk-olots");
    box.innerHTML = "";
    for (const n of AUK.LOT_COUNTS) {
      box.appendChild(makeChip(String(n), s.aukSettings.lots === n, host ? () => Online.send({ type: "aukSettings", settings: { lots: n } }) : null));
    }
    box.classList.toggle("static", !host);
  }

  /* ---------- Bieten ---------- */
  function renderBoard() {
    const game = g();
    const lot = game.lot;
    const me = game.players.find((p) => p.id === state.you) || { money: 0 };
    $("auk-olot-num").textContent = `Los ${game.index + 1} von ${game.count} · ${lot.category}`;
    $("auk-olot-title").textContent = lot.title;
    $("auk-olot-desc").textContent = lot.desc;
    $("auk-olot-estimate").textContent = `Schätzpreis ${lot.estimate}`;
    $("auk-omoney").textContent = me.money;
    $("auk-obid").textContent = game.bid || "–";
    const sold = game.phase === "sold";
    $("auk-obidder").textContent = sold
      ? (game.sold.buyer ? `Verkauft an ${game.sold.buyer === state.you ? "dich" : nameOf(game.sold.buyer)}!` : "Kein Gebot – das Los geht zurück.")
      : game.bidder ? (game.bidder === state.you ? "Du hast das Höchstgebot" : `Höchstgebot: ${nameOf(game.bidder)}`) : "Noch kein Gebot";
    $("auk-ocenter").classList.toggle("sold", sold);
    $("auk-ocenter").classList.toggle("mine", !sold && game.bidder === state.you);
    // Gebotsknöpfe
    const box = $("auk-osteps");
    if (!box.children.length) {
      for (const s of AUK.STEPS) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "auk-step";
        b.dataset.step = s;
        b.textContent = `+${s}`;
        b.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          if (b.disabled) return;
          Online.send({ type: "aukBid", step: s, lot: g().index });
        });
        box.appendChild(b);
      }
    }
    box.querySelectorAll(".auk-step").forEach((b) => {
      b.disabled = !game.inGame || sold || game.bidder === state.you || game.bid + Number(b.dataset.step) > me.money;
    });
    // Mitbieter
    const list = $("auk-oplayers");
    list.innerHTML = "";
    for (const p of game.players) {
      const li = document.createElement("li");
      li.className = "lobby-player" + (p.connected ? "" : " offline") + (game.bidder === p.id && !sold ? " leading" : "");
      li.innerHTML = `<span class="avatar"></span><span class="profile-name"></span><span class="badge"></span>`;
      li.querySelector(".avatar").textContent = p.name.charAt(0).toUpperCase();
      li.querySelector(".profile-name").textContent = p.name + (p.id === state.you ? " (Du)" : "");
      li.querySelector(".badge").textContent = `${p.money} € · ${p.lots} ${p.lots === 1 ? "Los" : "Lose"}`;
      list.appendChild(li);
    }
    $("auk-onext").hidden = !isHost() || !sold;
    $("auk-ofinish").hidden = !isHost();
    clockOffset = game.now - Date.now();
    startClock();
  }

  function startClock() {
    if (clock) return;
    const tick = () => {
      if (!state || !state.game || state.game.type !== "auktion" || g().phase === "reveal") return stopClock();
      const game = g();
      const left = Math.max(0, (game.endsAt || 0) - (Date.now() + clockOffset));
      let text = "";
      let share = 0;
      if (game.phase === "open") {
        text = `Erstes Gebot? Noch ${Math.ceil(left / 1000)} s`;
        share = left / AUK.OPEN_MS;
      } else if (game.phase === "going") {
        const part = AUK.GOING_MS / 3;
        text = left > 2 * part ? "Zum Ersten …" : left > part ? "Zum Zweiten …" : "Zum Dritten …";
        share = left / AUK.GOING_MS;
      } else if (game.phase === "sold") {
        text = `Nächstes Los in ${Math.ceil(left / 1000)} s`;
      }
      $("auk-ogoing").textContent = text;
      $("auk-ogoing").classList.toggle("hot", game.phase === "going" && left < AUK.GOING_MS / 3);
      $("auk-ometer").style.transform = `scaleX(${Math.max(0, Math.min(1, share))})`;
    };
    tick();
    clock = setInterval(tick, 100);
  }

  function stopClock() {
    clearInterval(clock);
    clock = null;
  }

  /* ---------- Auflösung ---------- */
  function renderReveal() {
    const game = g();
    const host = isHost();
    AuktionView.renderReveal({
      lots: game.lots,
      players: game.players,
      revealed: game.revealed,
      total: game.allLots ? game.lots.length : Infinity,
      listId: "auk-oreveal-list",
      rankingId: "auk-oranking",
      nextId: "auk-oreveal-next",
      allId: "auk-oreveal-all",
      nameOf,
      canControl: host
    });
    $("auk-oreveal-wait").hidden = host || !!game.allLots;
    $("auk-oagain").hidden = !host || !game.allLots;
    $("auk-oto-lobby").hidden = !host || !game.allLots;
  }

  /* ---------- Events ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("auk-onext").addEventListener("click", () => Online.send({ type: "aukNext" }));
    $("auk-ofinish").addEventListener("click", () =>
      Online.confirmHost("Auktion beenden?", "Die restlichen Lose werden nicht mehr versteigert. Danach kommt die Auflösung.", "aukFinish"));
    $("auk-oreveal-next").addEventListener("click", () => Online.send({ type: "aukReveal" }));
    $("auk-oreveal-all").addEventListener("click", () => Online.send({ type: "aukReveal", all: true }));
    $("auk-oagain").addEventListener("click", () => Online.send({ type: "start" }));
    $("auk-oto-lobby").addEventListener("click", () => Online.send({ type: "endGame" }));
    document.querySelectorAll(".auk-leave").forEach((b) => b.addEventListener("click", () => Online.leaveLobby()));
  });

  return { render, renderLobbySettings, release: stopClock };
})();
