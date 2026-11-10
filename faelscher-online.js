"use strict";

/* =========================================================
   Fälscher – Online (3 bis 8 Spieler, jeder am eigenen Handy)
   Schreiben und Abstimmen gleichzeitig; der Host schaltet weiter.
   Die Anzeige nutzt dieselben Bausteine wie Pass & Play (FzView).
   ========================================================= */
const FzOnline = (() => {
  let state = null;
  let draftKey = null; // für welche Frage das Textfeld gebaut wurde
  let pendingVote = null;

  const g = () => state.game;
  const isHost = () => Online.isHost();
  const nameOf = (id) => (g().players.find((p) => p.id === id) || {}).name || "?";

  function render(s) {
    state = s;
    const game = g();
    const box = $("fz-online");
    if (game.phase !== "write") draftKey = null;
    if (game.phase !== "vote") pendingVote = null;
    if (game.phase === "write") renderWrite(box);
    else if (game.phase === "vote") renderVote(box);
    else if (game.phase === "reveal") renderReveal(box);
    else renderFinal(box);
    return "fz-online";
  }

  /* ---------- Lobby-Einstellungen ---------- */
  function renderLobbySettings(s) {
    state = s;
    const host = isHost();
    $("fz-host-pill").textContent = host ? "Du bist Host" : "Nur der Host kann ändern";
    const box = $("fz-ocount");
    box.innerHTML = "";
    for (const n of FZ.COUNTS) box.appendChild(makeChip(String(n), s.fzSettings.count === n, host ? () => Online.send({ type: "fzSettings", settings: { count: n } }) : null));
    box.classList.toggle("static", !host);
  }

  // Wer ist fertig, auf wen wird gewartet?
  function waiting(label) {
    const game = g();
    const relevant = game.players.filter((p) => !p.left && p.done !== null);
    const wrap = document.createElement("div");
    wrap.className = "card";
    const open = relevant.filter((p) => !p.done);
    wrap.innerHTML = `<div class="row-between"><h2></h2><span class="pill">${relevant.length - open.length}/${relevant.length}</span></div><div class="fz-wait"></div>`;
    wrap.querySelector("h2").textContent = open.length ? `Warten auf …` : label;
    const chips = wrap.querySelector(".fz-wait");
    for (const p of open) {
      const c = document.createElement("span");
      c.className = "chip" + (p.connected ? "" : " offline");
      c.textContent = p.name + (p.id === state.you ? " (Du)" : "");
      chips.appendChild(c);
    }
    if (!open.length) chips.innerHTML = '<span class="muted small">Alle sind fertig.</span>';
    return wrap;
  }

  function hostButtons(box, forceLabel) {
    if (!isHost()) return;
    if (forceLabel) box.appendChild(FzView.button(forceLabel, "ghost", () =>
      Online.confirmHost("Nicht länger warten?", "Wer noch nicht fertig ist, ist in dieser Runde nicht dabei.", "fzForce")));
    box.appendChild(FzView.button("Spiel beenden (Host)", "ghost", () =>
      Online.confirmHost("Spiel beenden?", "Es geht direkt zum Endstand.", "fzEnd")));
  }

  const head = () => FzView.header(`Frage ${g().index + 1} von ${g().count}`, g().frage);

  /* ---------- Schreiben ---------- */
  function renderWrite(box) {
    const game = g();
    const key = `${game.gameId}-${game.index}`;
    const mine = game.myAnswer;
    // Das Textfeld nicht bei jeder Statusmeldung neu bauen (sonst geht Getipptes verloren)
    if (draftKey === key && !mine && box.querySelector("textarea")) {
      box.querySelector(".fz-waitslot").replaceChildren(waiting("Alle haben geschrieben"));
      return;
    }
    draftKey = mine ? null : key;
    box.innerHTML = "";
    box.appendChild(head());
    if (mine) {
      const card = document.createElement("div");
      card.className = "card fz-question";
      card.innerHTML = `<span class="role-label">Deine Fälschung</span><p class="fz-res-text"></p>`;
      card.querySelector("p").textContent = mine;
      box.appendChild(card);
      box.appendChild(FzView.button("Ändern", "ghost", () => Online.send({ type: "fzUnanswer" })));
    } else if (game.inGame) {
      box.appendChild(FzView.answerForm((text) => Online.send({ type: "fzAnswer", text }), sessionDraft(key)));
      const ta = box.querySelector("textarea");
      ta.addEventListener("input", () => saveDraft(key, ta.value));
    }
    const slot = document.createElement("div");
    slot.className = "fz-waitslot";
    slot.appendChild(waiting("Alle haben geschrieben"));
    box.appendChild(slot);
    hostButtons(box, "Nicht länger warten (Host)");
  }

  // Entwurf überlebt ein Neuladen der Seite
  const sessionDraft = (key) => { try { return sessionStorage.getItem(`fz-draft-${key}`) || ""; } catch (e) { return ""; } };
  const saveDraft = (key, v) => { try { sessionStorage.setItem(`fz-draft-${key}`, v); } catch (e) { /* egal */ } };

  /* ---------- Abstimmen ---------- */
  function renderVote(box) {
    const game = g();
    box.innerHTML = "";
    box.appendChild(head());
    if (game.merged) {
      box.appendChild(FzView.note("Deine Antwort war fast wörtlich die echte – du bekommst +2 und stimmst diesmal nicht ab."));
      box.appendChild(FzView.list(game.items));
    } else if (!game.allowed.length) {
      box.appendChild(FzView.note("Du stimmst in dieser Runde nicht ab."));
      box.appendChild(FzView.list(game.items));
    } else {
      box.appendChild(FzView.note(game.myVote ? "Stimme abgegeben. Du kannst sie noch ändern, bis alle abgestimmt haben." : "Welche Antwort ist die echte? Deine eigene kannst du nicht wählen."));
      const selected = pendingVote || game.myVote;
      box.appendChild(FzView.voteList(game.items, game.allowed, selected, (key) => {
        pendingVote = key;
        Online.send({ type: "fzVote", key });
      }, false));
    }
    box.appendChild(waiting("Alle haben abgestimmt"));
    hostButtons(box, "Abstimmung beenden (Host)");
  }

  /* ---------- Aufdecken ---------- */
  function renderReveal(box) {
    const game = g();
    box.innerHTML = "";
    box.appendChild(head());
    box.appendChild(FzView.reveal(game.round, game.votes, game.score, { erklaerung: game.erklaerung }, nameOf));
    const totals = Object.fromEntries(game.players.map((p) => [p.id, p.total]));
    box.appendChild(FzView.standings(fzRanking(game.players, totals), game.score.points));
    if (isHost()) {
      const last = game.index >= game.count - 1;
      box.appendChild(FzView.button(last ? "Zum Endstand" : "Nächste Frage", "primary big", () => Online.send({ type: "fzNext" })));
    } else {
      box.appendChild(FzView.note("Der Host startet die nächste Frage."));
    }
    hostButtons(box, null);
  }

  /* ---------- Ende ---------- */
  function renderFinal(box) {
    const game = g();
    box.innerHTML = "";
    const totals = Object.fromEntries(game.players.map((p) => [p.id, p.total]));
    box.appendChild(FzView.final(fzRanking(game.players, totals), game.log || [], nameOf));
    if (isHost()) {
      box.appendChild(FzView.button("Nochmal spielen", "primary big", () => Online.send({ type: "start" })));
      box.appendChild(FzView.button("Zurück zur Lobby", "ghost", () => Online.send({ type: "endGame" })));
    } else {
      box.appendChild(FzView.note("Warte auf den Host …"));
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".fz-leave").forEach((b) => b.addEventListener("click", () => Online.leaveLobby()));
  });

  return { render, renderLobbySettings };
})();
