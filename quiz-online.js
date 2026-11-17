"use strict";

/* =========================================================
   Quizwand – Online (2–10, jeder am eigenen Handy)
   Alle sehen dieselbe Wand. Wer dran ist, wählt ein Feld und
   antwortet; danach buzzern die anderen. Eindeutige Treffer erkennt
   der Server, sonst entscheidet der Host (keine KI online).
   ========================================================= */
const QzOnline = (() => {
  let state = null;
  let offset = 0; // Serverzeit − eigene Zeit
  let buzzTimer = null;
  let dataPromise = null;

  const g = () => state.game;
  const isHost = () => Online.isHost();
  const nameOf = (id) => (g().players.find((p) => p.id === id) || {}).name || "?";
  const me = () => state.you;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const button = (label, cls, onClick) => {
    const b = el("button", "btn " + cls, label);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  };

  function render(s) {
    // Zeitversatz nur bei einem neuen Stand vom Server berechnen
    if (s !== state) offset = (s.game.now || Date.now()) - Date.now();
    state = s;
    const game = g();
    const box = $("qz-online");
    // Getipptes nicht verlieren, wenn zwischendurch ein neuer Stand kommt
    const old = box.querySelector("#qz-input");
    const draft = old ? old.value : "";
    const hadFocus = old && document.activeElement === old;
    box.innerHTML = "";
    clearTimeout(buzzTimer);
    if (game.phase === "over") renderOver(box);
    else if (game.cur) renderQuestion(box);
    else renderBoard(box);
    const input = box.querySelector("#qz-input");
    if (input && draft) input.value = draft;
    if (input && (hadFocus || !draft)) setTimeout(() => input.focus(), 30);
    return "qz-online";
  }

  function scores(highlight) {
    const wrap = el("div", "quiz-scores");
    for (const p of g().players) {
      const s = el("div", "quiz-score" + (p.id === highlight ? " current" : "") + (p.left ? " left" : ""));
      s.appendChild(el("span", "quiz-score-name", p.name + (p.id === me() ? " (Du)" : "")));
      const v = el("span", "quiz-score-val" + (p.score < 0 ? " neg" : ""), String(p.score));
      s.appendChild(v);
      wrap.appendChild(s);
    }
    return wrap;
  }

  /* ---------- Wand ---------- */
  function renderBoard(box) {
    const game = g();
    const top = el("div", "quiz-top");
    top.appendChild(el("span", "quiz-page", `Seite ${game.page + 1} von 2${game.page ? " · doppelte Punkte" : ""}`));
    top.appendChild(el("span", "quiz-turn", game.turn === me() ? "Du wählst ein Feld" : `${nameOf(game.turn)} wählt ein Feld`));
    box.appendChild(top);
    const canPick = game.turn === me() || isHost();
    const grid = el("div", "quiz-grid");
    for (const col of game.cols) grid.appendChild(el("div", "quiz-head", col.name));
    for (let row = 0; row < 5; row++) {
      game.cols.forEach((col, c) => {
        const cell = col.cells[row];
        const b = el("button", "quiz-cell");
        b.type = "button";
        if (cell.done) {
          b.classList.add("done");
          b.disabled = true;
          b.appendChild(el("span", "quiz-cell-who", cell.winner ? nameOf(cell.winner) : "–"));
        } else {
          b.textContent = cell.value;
          b.disabled = !canPick;
          b.addEventListener("click", () => Online.send({ type: "qzPick", c, row }));
        }
        grid.appendChild(b);
      });
    }
    box.appendChild(grid);
    box.appendChild(scores(game.turn));
    if (isHost()) {
      if (game.left === 0) box.appendChild(button(game.page === 0 ? "Weiter zu Seite 2 (doppelte Punkte)" : "Zum Endstand", "primary big", () => Online.send({ type: "qzNextPage" })));
      else box.appendChild(button(game.page === 0 ? "Seite 1 vorzeitig beenden (Host)" : "Spiel vorzeitig beenden (Host)", "ghost", () =>
        Online.confirmHost(game.page === 0 ? "Seite 1 beenden?" : "Spiel beenden?", "Die offenen Felder fallen weg.", "qzNextPage")));
    } else if (game.turn !== me()) {
      box.appendChild(el("p", "muted small center", "Warte, bis ein Feld gewählt wird."));
    }
  }

  /* ---------- Frage ---------- */
  function questionCard(cur) {
    const card = el("div", "card quiz-q-card");
    const head = el("div", "quiz-q-head");
    head.appendChild(el("span", "", cur.cat));
    head.appendChild(el("span", "quiz-q-value", String(cur.value)));
    card.appendChild(head);
    if (cur.emoji) card.appendChild(el("div", "quiz-q-emoji", cur.emoji));
    if (cur.rezept) {
      const grid = el("div", "quiz-recipe");
      for (const item of cur.rezept) grid.appendChild(el("span", "quiz-slot" + (item ? "" : " empty"), item));
      card.appendChild(grid);
    }
    card.appendChild(el("p", "quiz-q-text", cur.frage));
    return card;
  }

  function attemptsCard(cur) {
    const list = cur.attempts.filter((a) => a.ok !== null || a.answer);
    if (!list.length) return null;
    const card = el("div", "card qz-attempts");
    list.forEach((a, i) => {
      const row = el("div", "qz-attempt " + (a.ok === true ? "right" : a.ok === false ? "wrong" : "pass"));
      row.appendChild(el("span", "qz-who", nameOf(a.p)));
      row.appendChild(el("span", "qz-ans", a.pass || a.ok === null ? "weiß es nicht" : `„${a.answer}“`));
      const pts = a.ok === true ? `+${cur.value}` : a.ok === false ? `−${cur.value / 2}` : "0";
      row.appendChild(el("span", "qz-pts", pts));
      card.appendChild(row);
    });
    return card;
  }

  function renderQuestion(box) {
    const game = g();
    const cur = game.cur;
    box.appendChild(questionCard(cur));
    const att = attemptsCard(cur);

    if (cur.phase === "answer") {
      if (att) box.appendChild(att);
      if (cur.answering === me()) {
        const form = el("form", "card quiz-answer");
        const first = !cur.attempts.length;
        form.appendChild(el("span", "role-label", first ? `Du antwortest (falsch kostet ${cur.value / 2})` : `Du klaust (falsch kostet ${cur.value / 2})`));
        const input = el("input");
        input.id = "qz-input";
        input.type = "text";
        input.maxLength = 120;
        input.autocomplete = "off";
        input.placeholder = cur.reverse ? "Eure Frage, z. B. „Was ist …?“" : "Antwort eintippen";
        form.appendChild(input);
        const submit = el("button", "btn primary big", "Antwort abgeben");
        submit.type = "submit";
        form.appendChild(submit);
        if (first) form.appendChild(button(`Weiß ich nicht (−${cur.value / 2})`, "ghost", () => Online.send({ type: "qzPass" })));
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const v = input.value.trim();
          if (!v) return input.focus();
          input.value = "";
          Online.send({ type: "qzAnswer", answer: v });
        });
        box.appendChild(form);
      } else {
        box.appendChild(el("p", "qz-status", `${nameOf(cur.answering)} ${cur.attempts.length ? "klaut" : "antwortet"} …`));
      }
    } else if (cur.phase === "self") {
      if (att) box.appendChild(att);
      const card = el("div", "card qz-judge");
      card.appendChild(el("span", "role-label", "Antwort"));
      card.appendChild(el("p", "quiz-v-who", `${nameOf(cur.pending.p)}: „${cur.pending.answer}“`));
      if (cur.pending.p === me()) {
        card.appendChild(el("p", "small muted", "Lösung:"));
        card.appendChild(el("p", "quiz-solution-text", cur.solution || ""));
        if (cur.hint) card.appendChild(el("p", "small muted", cur.hint));
        card.appendChild(el("p", "small", "War deine Antwort richtig? Sei ehrlich – bei „Richtig“ stimmen die anderen ab."));
        const row = el("div", "host-row");
        row.appendChild(button("Richtig", "yes", () => Online.send({ type: "qzSelf", ok: true })));
        row.appendChild(button("Falsch", "no", () => Online.send({ type: "qzSelf", ok: false })));
        card.appendChild(row);
      } else {
        card.appendChild(el("p", "small muted", `${nameOf(cur.pending.p)} sieht die Lösung und bewertet sich selbst …`));
      }
      box.appendChild(card);
    } else if (cur.phase === "vote") {
      if (att) box.appendChild(att);
      const v = cur.vote;
      const card = el("div", "card qz-judge");
      card.appendChild(el("span", "role-label", "Abstimmung"));
      card.appendChild(el("p", "quiz-v-who", `${nameOf(cur.pending.p)}: „${cur.pending.answer}“ – sagt: richtig`));
      card.appendChild(el("p", "small muted", "Lösung:"));
      card.appendChild(el("p", "quiz-solution-text", cur.solution || ""));
      if (cur.hint) card.appendChild(el("p", "small muted", cur.hint));
      card.appendChild(el("p", "small", `Gilt als richtig bei ${v.need.yes} ${v.need.yes === 1 ? "Stimme" : "Stimmen"} dafür, als falsch bei ${v.need.no} dagegen.`));
      card.appendChild(el("p", "qz-tally", `👍 ${v.yes}   ·   👎 ${v.no}`));
      if (v.voters.includes(me())) {
        if (v.mine === null) {
          const row = el("div", "host-row");
          row.appendChild(button("Zählt", "yes", () => Online.send({ type: "qzVote", ok: true })));
          row.appendChild(button("Zählt nicht", "no", () => Online.send({ type: "qzVote", ok: false })));
          card.appendChild(row);
        } else {
          card.appendChild(el("p", "small muted", `Du hast „${v.mine ? "zählt" : "zählt nicht"}“ gestimmt.`));
        }
      } else {
        card.appendChild(el("p", "small muted", "Die anderen stimmen ab …"));
      }
      if (isHost()) card.appendChild(button("Abstimmung beenden (Host)", "ghost small-btn", () => Online.confirmHost("Abstimmung beenden?", "Es zählt die Mehrheit der bisherigen Stimmen, bei Gleichstand gilt die Antwort.", "qzVoteEnd")));
      box.appendChild(card);
    } else if (cur.phase === "buzz") {
      if (att) box.appendChild(att);
      const card = el("div", "card quiz-steal");
      const mine = cur.remaining.includes(me());
      const armed = Date.now() + offset >= cur.buzzAt;
      card.appendChild(el("p", "small", armed ? `Buzzern! Richtig +${cur.value}, falsch −${cur.value / 2}.` : "Finger bereit …"));
      if (mine) {
        const wrap = el("div", "quiz-buzzers" + (armed ? " armed" : ""));
        wrap.dataset.count = "1";
        const b = el("button", "quiz-buzzer", "BUZZ");
        b.type = "button";
        b.style.setProperty("--buzz", "#ff5ca8");
        b.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          if (Date.now() + offset < cur.buzzAt) return;
          if (navigator.vibrate) navigator.vibrate(30);
          Online.send({ type: "qzBuzz" });
        });
        wrap.appendChild(b);
        card.appendChild(wrap);
      } else {
        card.appendChild(el("p", "muted small", "Du hast es schon versucht – die anderen dürfen buzzern."));
      }
      if (!armed) buzzTimer = setTimeout(() => render(state), Math.max(50, cur.buzzAt - (Date.now() + offset) + 30));
      if (isHost()) {
        card.appendChild(button("Keiner – Lösung zeigen (Host)", "ghost", () => Online.send({ type: "qzNobody" })));
      }
      box.appendChild(card);
    } else {
      // erledigt
      if (att) box.appendChild(att);
      const sol = el("div", "card quiz-solution");
      sol.appendChild(el("span", "role-label", "Lösung"));
      sol.appendChild(el("p", "quiz-solution-text", cur.solution || ""));
      box.appendChild(sol);
      if (cur.lastVote) box.appendChild(el("p", "small muted center", `Abstimmung: ${cur.lastVote.ok ? "zählt" : "zählt nicht"} (👍 ${cur.lastVote.yes} · 👎 ${cur.lastVote.no})`));
      if (isHost() || game.turn === me()) box.appendChild(button("Zurück zur Wand", "primary big", () => Online.send({ type: "qzBack" })));
      else box.appendChild(el("p", "muted small center", "Gleich geht es zurück zur Wand."));
    }
    box.appendChild(scores(cur.answering));
  }

  /* ---------- Ende ---------- */
  function renderOver(box) {
    const game = g();
    const header = el("header", "title");
    header.appendChild(el("h1", "", "Endstand"));
    const ranking = game.players.slice().sort((a, b) => b.score - a.score);
    const top = ranking.filter((p) => p.score === ranking[0].score);
    header.appendChild(el("p", "sub", top.length > 1 ? `Gleichstand: ${top.map((p) => p.name).join(" & ")}` : `${top[0].name} gewinnt!`));
    box.appendChild(header);
    const card = el("div", "card");
    const list = el("ol", "slf-ranking");
    for (const p of ranking) {
      const place = ranking.findIndex((x) => x.score === p.score) + 1;
      const li = el("li", "slf-rank" + (place === 1 ? " first" : "") + (p.id === me() ? " me" : ""));
      li.appendChild(el("span", "slf-place", `${place}.`));
      li.appendChild(el("span", "slf-rank-name", p.name));
      li.appendChild(el("span", ""));
      li.appendChild(el("span", "slf-total", String(p.score)));
      list.appendChild(li);
    }
    card.appendChild(list);
    box.appendChild(card);
    if (isHost()) {
      box.appendChild(button("Nochmal spielen", "primary big", () => Online.send({ type: "start" })));
      box.appendChild(button("Zurück zur Lobby", "ghost", () => Online.send({ type: "endGame" })));
    } else {
      box.appendChild(el("p", "muted small center", "Warte auf den Host …"));
    }
  }

  /* ---------- Lobby: Kategorien ---------- */
  function loadData() {
    if (typeof QUIZ_KATEGORIEN !== "undefined") return Promise.resolve();
    if (!dataPromise) {
      dataPromise = new Promise((resolve) => {
        const s = document.createElement("script");
        s.src = "quiz-fragen.js";
        s.onload = resolve;
        s.onerror = () => { dataPromise = null; resolve(); };
        document.head.appendChild(s);
      });
    }
    return dataPromise;
  }

  async function renderLobbySettings(s) {
    state = s;
    await loadData();
    if (typeof QUIZ_KATEGORIEN === "undefined") return;
    const host = isHost();
    const chosen = (s.xSettings && s.xSettings.quiz && s.xSettings.quiz.cats) || [];
    $("qz-host-pill").textContent = host ? "Du bist Host" : "Nur der Host kann ändern";
    $("qz-ocount").textContent = `${chosen.length} / 10`;
    $("qz-ocount").classList.toggle("done", chosen.length === 10);
    const box = $("qz-ocats");
    box.innerHTML = "";
    const playable = QUIZ_KATEGORIEN.filter((k) => [1, 2, 3, 4, 5].every((st) => k.fragen.some((q) => q.s === st)));
    for (const k of playable) {
      const on = chosen.includes(k.id);
      box.appendChild(makeChip(k.name, on, host ? () => {
        if (!on && chosen.length >= 10) return showToast("Es sind schon 10 Kategorien gewählt.");
        Online.send({ type: "qzSettings", cats: on ? chosen.filter((id) => id !== k.id) : [...chosen, k.id] });
      } : null));
    }
    box.classList.toggle("static", !host);
    $("qz-orandom").hidden = !host;
    $("qz-orandom").onclick = () => {
      const rest = shuffle(playable.map((k) => k.id).filter((id) => !chosen.includes(id)));
      Online.send({ type: "qzSettings", cats: [...chosen, ...rest].slice(0, 10) });
    };
  }

  return { render, renderLobbySettings };
})();
