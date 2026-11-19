"use strict";

/* =========================================================
   Mein Partner kann – Online (2–6 Zweierteams, jeder am eigenen Handy)
   Die Teams ergeben sich aus der Lobby (der Host kann mischen).
   Jeder Bieter bietet am eigenen Handy. Kontrollieren (Karten, Uhr,
   Urteil) dürfen die anderen Teams und der Host.
   ========================================================= */
const PkOnline = (() => {
  let state = null;
  let offset = 0;
  let clock = null;
  let audio = null;
  let beeped = null;
  let bid = { key: null, value: 1 };

  const g = () => state.game;
  const isHost = () => Online.isHost();
  const me = () => state.you;
  const nameOf = (id) => {
    for (const t of g().teams) for (const m of t.members) if (m.id === id) return m.name;
    return "?";
  };
  const TYPE = { w: "Wissen", d: "Denken", p: "Körper", s: "Spaß" };
  const teamName = (t) => t.members.map((m) => m.name).join(" & ");

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

  function beep(freq, ms) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), gain = audio.createGain();
      o.frequency.value = freq; gain.gain.value = 0.25;
      o.connect(gain).connect(audio.destination);
      o.start(); o.stop(audio.currentTime + ms / 1000);
    } catch (e) { /* kein Ton */ }
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  function render(s) {
    // Zeitversatz nur bei einem neuen Stand vom Server berechnen
    if (s !== state) offset = (s.game.now || Date.now()) - Date.now();
    state = s;
    const game = g();
    const box = $("pk-online");
    box.innerHTML = "";
    clearInterval(clock);
    clock = null;
    if (game.phase === "over") renderOver(box);
    else renderRound(box);
    return "pk-online";
  }

  /* ---------- Runde ---------- */
  function renderRound(box) {
    const game = g();
    const a = game.task;
    const meta = el("div", "pk-meta");
    meta.appendChild(el("span", "", `Aufgabe ${game.round + 1} von ${game.rounds}`));
    const tags = el("span", "pk-tags");
    const tt = el("span", "pk-tag", TYPE[a.t]);
    tt.dataset.type = a.t;
    tags.appendChild(tt);
    tags.appendChild(el("span", "pk-tag time", a.m === "dauer" ? "Stoppuhr" : a.z ? `${a.z} Sekunden` : "ohne Zeitlimit"));
    meta.appendChild(tags);
    box.appendChild(meta);
    const task = el("div", "card pk-task");
    task.appendChild(el("p", "pk-question", a.q));
    if (a.h) task.appendChild(el("p", "small muted", a.h));
    box.appendChild(task);

    // Teams
    const roles = el("div", "pk-roles");
    game.teams.forEach((t, i) => {
      const out = game.phase === "bid" && !game.active.includes(i);
      const turn = game.phase === "bid" && game.turn === i;
      const lead = game.high && game.high.team === i;
      const row = el("div", "pk-role" + (out ? " out" : "") + (turn ? " turn" : "") + (lead ? " lead" : "") + (i === game.myTeam ? " mine" : ""));
      row.appendChild(el("span", "pk-role-score", String(t.score)));
      const names = el("span", "pk-role-names");
      names.appendChild(el("strong", "", nameOf(t.bidder)));
      names.appendChild(document.createTextNode(" bietet · "));
      names.appendChild(el("strong", "", nameOf(t.doer)));
      names.appendChild(document.createTextNode(" tritt an"));
      row.appendChild(names);
      row.appendChild(el("span", "pk-role-state", out ? "gepasst" : lead ? String(game.high.amount) : ""));
      roles.appendChild(row);
    });
    box.appendChild(roles);

    if (game.phase === "bid") renderBid(box);
    else renderDo(box);

    if (isHost()) box.appendChild(button("Spiel beenden (Host)", "ghost", () => Online.confirmHost("Spiel beenden?", "Es geht direkt zum Endstand.", "pkEnd")));
  }

  function renderBid(box) {
    const game = g();
    const a = game.task;
    const team = game.teams[game.turn];
    const card = el("div", "card pk-bid");
    card.appendChild(el("span", "role-label", team.bidder === me() ? "Du bist dran" : `${nameOf(team.bidder)} ist dran`));
    card.appendChild(el("p", "pk-bid-high", game.high ? `Höchstgebot: ${game.high.amount} ${a.e} (${nameOf(game.teams[game.high.team].bidder)})` : "Noch kein Gebot"));
    if (team.bidder === me()) {
      const key = `${game.gameId}-${game.round}-${game.high ? game.high.amount : 0}`;
      const min = game.high ? game.high.amount + 1 : 1;
      if (bid.key !== key) bid = { key, value: min };
      const steps = el("div", "pk-bid-steps");
      const num = el("span", "pk-bid-num");
      const strong = el("strong", "", String(bid.value));
      num.appendChild(strong);
      num.appendChild(el("span", "", a.e));
      const go = button("", "primary big", () => Online.send({ type: "pkBid", amount: bid.value }));
      const update = () => { strong.textContent = bid.value; go.textContent = `„${nameOf(team.doer)} schafft ${bid.value}!“`; };
      for (const d of [-5, -1]) {
        const b = el("button", "pk-step", d > 0 ? `+${d}` : `−${-d}`);
        b.type = "button";
        b.addEventListener("click", () => { bid.value = Math.max(min, bid.value + d); update(); });
        steps.appendChild(b);
      }
      steps.appendChild(num);
      for (const d of [1, 5]) {
        const b = el("button", "pk-step", `+${d}`);
        b.type = "button";
        b.addEventListener("click", () => { bid.value = Math.min(999, bid.value + d); update(); });
        steps.appendChild(b);
      }
      card.appendChild(steps);
      update();
      card.appendChild(go);
      if (game.high) card.appendChild(button(`Passen – ${nameOf(game.teams[game.high.team].doer)} soll es zeigen`, "ghost", () => Online.send({ type: "pkPass" })));
    } else {
      card.appendChild(el("p", "small muted", game.myTeam === game.turn ? "Dein Partner bietet gerade. Nichts verraten!" : "Warte auf das Gebot …"));
      if (isHost() && game.high) card.appendChild(button("Für dieses Team passen (Host)", "ghost small-btn", () => Online.send({ type: "pkPass" })));
    }
    if (!game.high && (team.bidder === me() || isHost())) card.appendChild(button("Andere Aufgabe", "ghost", () => Online.send({ type: "pkSwap" })));
    box.appendChild(card);
  }

  function renderDo(box) {
    const game = g();
    const a = game.task;
    const team = game.teams[game.high.team];
    const amount = game.high.amount;
    const card = el("div", "card pk-do");
    card.appendChild(el("p", "pk-do-who", team.doer === me() ? "Du" : nameOf(team.doer)));
    card.appendChild(el("p", "pk-do-goal", a.m === "dauer"
      ? `${team.doer === me() ? "musst" : "muss"} ${amount} Sekunden durchhalten`
      : `${team.doer === me() ? "musst" : "muss"} ${amount} ${a.e} schaffen${a.z ? ` – in ${a.z} Sekunden` : ""}`));

    // Uhr
    const needsClock = a.m === "dauer" || a.z > 0;
    if (needsClock) {
      const c = el("div", "pk-clock");
      const num = el("span", "pk-clock-num");
      const label = el("span", "pk-clock-label");
      c.appendChild(num);
      c.appendChild(label);
      card.appendChild(c);
      const tick = () => {
        const t = game.timer;
        const elapsed = t ? Date.now() + offset - t.startedAt : 0;
        const done = t && elapsed >= t.target;
        if (a.m === "dauer") {
          num.textContent = (t ? Math.floor(elapsed / 100) / 10 : 0).toFixed(1).replace(".", ",");
          label.textContent = done ? "Geschafft – Ziel erreicht!" : `Ziel: ${amount} Sekunden`;
        } else {
          num.textContent = String(t ? Math.max(0, Math.ceil((t.target - elapsed) / 1000)) : a.z);
          label.textContent = done ? "Zeit ist um!" : "Sekunden";
        }
        c.classList.toggle("done", !!done);
        c.classList.toggle("good", !!done && a.m === "dauer");
        c.classList.toggle("urgent", !!t && !done && a.m !== "dauer" && t.target - elapsed <= 5000);
        if (done && t && beeped !== t.startedAt) { beeped = t.startedAt; beep(990, 700); }
        if (done && a.m !== "dauer") { clearInterval(clock); clock = null; }
      };
      tick();
      if (game.timer && game.phase === "do") clock = setInterval(tick, 100);
      if (!game.timer && game.checker && game.phase === "do") {
        card.appendChild(button(a.m === "dauer" ? "Stoppuhr starten" : "Zeit starten", "primary big", () => { beep(660, 120); Online.send({ type: "pkClock" }); }));
      }
    }

    // Karten
    const s = game.stapel;
    if (s && game.phase === "do") {
      const deck = el("div", "pk-deck");
      const doing = game.myTeam === game.high.team;
      deck.appendChild(el("span", "role-label", s.art === "einzeln" ? (s.titel || "Vorgabe")
        : s.art === "folge" ? (doing ? "Das andere Team liest vor" : s.titel)
        : team.doer === me() && s.card ? "Schau auf dein Display"
        : s.zeigen ? "Der Partner schaut auf sein Display"
        : doing ? "Das andere Team liest vor" : "Zum Vorlesen"));
      if (s.art === "folge") {
        if (s.list) {
          const ol = el("ol", "pk-deck-list" + (s.list.every((x) => x.length <= 2) ? " kurz" : ""));
          for (const x of s.list) ol.appendChild(el("li", "", x));
          const wrap = el("div", "pk-deck-card");
          wrap.appendChild(ol);
          deck.appendChild(wrap);
        }
      } else if (s.card) {
        const wrap = el("div", "pk-deck-card");
        const v = el("span", "pk-deck-v" + (s.card.gross ? " gross" : "") + (s.card.farbe ? " stroop" : ""), s.card.v);
        if (s.card.farbe) v.style.color = s.card.farbe;
        wrap.appendChild(v);
        if (s.card.l) wrap.appendChild(el("span", "pk-deck-l", `Lösung: ${s.card.l}`));
        deck.appendChild(wrap);
      }
      if (game.checker && !doing) {
        if (s.zeigen && s.hasSolution && !s.shown) deck.appendChild(button("Lösung zeigen", "ghost small-btn", () => Online.send({ type: "pkCard", reveal: true })));
        if (s.art === "karten") {
          const reached = s.right >= amount;
          deck.appendChild(el("div", "pk-deck-count" + (reached ? " reached" : ""), reached ? `${s.right} richtig – Gebot erreicht!` : `${s.right} von ${amount} richtig`));
          const row = el("div", "host-row");
          row.appendChild(button("Richtig ✓", "yes", () => Online.send({ type: "pkCard", ok: true })));
          row.appendChild(button("Falsch / weiter", "ghost", () => Online.send({ type: "pkCard", ok: false })));
          deck.appendChild(row);
        } else {
          deck.appendChild(button(s.art === "folge" ? "Neue Liste" : "Neu ziehen", "ghost small-btn", () => Online.send({ type: "pkCard", ok: false })));
        }
      } else if (s.art === "karten") {
        deck.appendChild(el("div", "pk-deck-count", `${s.right} von ${amount} richtig`));
      }
      card.appendChild(deck);
    }

    if (game.phase === "do") {
      if (game.checker) {
        const row = el("div", "host-row");
        row.appendChild(button("Geschafft (+2)", "yes", () => Online.send({ type: "pkJudge", ok: true })));
        row.appendChild(button("Nicht geschafft (−1)", "no", () => Online.send({ type: "pkJudge", ok: false })));
        card.appendChild(row);
      } else {
        card.appendChild(el("p", "small muted center", "Die anderen Teams kontrollieren und entscheiden."));
      }
    } else {
      const res = el("p", "pk-result " + (game.result ? "good" : "bad"), game.result ? `Geschafft! +2 für ${teamName(team)}` : `Nicht geschafft. −1 für ${teamName(team)}`);
      card.appendChild(res);
    }
    box.appendChild(card);
    if (game.phase === "result") {
      if (isHost()) box.appendChild(button(game.round + 1 >= game.rounds ? "Zum Endstand" : "Nächste Aufgabe", "primary big", () => Online.send({ type: "pkNext" })));
      else box.appendChild(el("p", "muted small center", "Der Host startet die nächste Aufgabe."));
    }
  }

  /* ---------- Ende ---------- */
  function renderOver(box) {
    const game = g();
    const ranking = game.teams.slice().sort((a, b) => b.score - a.score);
    const top = ranking.filter((t) => t.score === ranking[0].score);
    const header = el("header", "title");
    header.appendChild(el("h1", "", "Endstand"));
    header.appendChild(el("p", "sub", top.length > 1 ? "Gleichstand an der Spitze" : `${teamName(top[0])} gewinnen!`));
    box.appendChild(header);
    const card = el("div", "card");
    const list = el("ol", "slf-ranking");
    for (const t of ranking) {
      const place = ranking.findIndex((x) => x.score === t.score) + 1;
      const li = el("li", "slf-rank" + (place === 1 ? " first" : "") + (t.id === game.myTeam ? " me" : ""));
      li.appendChild(el("span", "slf-place", `${place}.`));
      li.appendChild(el("span", "slf-rank-name", teamName(t)));
      li.appendChild(el("span", ""));
      li.appendChild(el("span", "slf-total", String(t.score)));
      list.appendChild(li);
    }
    card.appendChild(list);
    box.appendChild(card);
    if (game.log && game.log.length) {
      const d = el("details", "card");
      d.appendChild(el("summary", "", "Alle Aufgaben"));
      const ul = el("ul", "pk-log");
      for (const e of game.log) ul.appendChild(el("li", e.ok ? "good" : "bad", `${e.doer}: ${e.amount} ${e.unit} – ${e.ok ? "geschafft" : "nicht geschafft"}`));
      d.appendChild(ul);
      box.appendChild(d);
    }
    if (isHost()) {
      box.appendChild(button("Nochmal spielen", "primary big", () => Online.send({ type: "start" })));
      box.appendChild(button("Zurück zur Lobby", "ghost", () => Online.send({ type: "endGame" })));
    } else {
      box.appendChild(el("p", "muted small center", "Warte auf den Host …"));
    }
  }

  /* ---------- Lobby ---------- */
  function renderLobbySettings(s) {
    state = s;
    const host = isHost();
    const st = (s.xSettings && s.xSettings.partner) || { types: ["w", "d", "p", "s"], rounds: 10 };
    const teams = (s.xSettings && s.xSettings.partnerTeams) || [];
    const name = (id) => (s.players.find((p) => p.id === id) || {}).name || "?";
    $("pkx-host-pill").textContent = host ? "Du bist Host" : "Nur der Host kann ändern";
    const list = $("pkx-teams");
    list.innerHTML = "";
    teams.forEach((t, i) => {
      const li = el("li", "lobby-player");
      li.appendChild(el("span", "avatar", String(i + 1)));
      li.appendChild(el("span", "profile-name", `${name(t[0])} & ${name(t[1])}`));
      list.appendChild(li);
    });
    const odd = s.players.length % 2 === 1;
    $("pkx-odd").hidden = !odd;
    if (odd) $("pkx-odd").textContent = `${name(s.players[s.players.length - 1].id)} hat noch keinen Partner – ihr braucht eine gerade Spielerzahl.`;
    $("pkx-shuffle").hidden = !host || s.players.length < 4;
    $("pkx-shuffle").onclick = () => Online.send({ type: "pkSettings", settings: { shuffle: true } });
    const types = $("pkx-types");
    types.innerHTML = "";
    for (const [id, label] of [["w", "Wissen"], ["d", "Denken"], ["p", "Körper"], ["s", "Spaß"]]) {
      const on = st.types.includes(id);
      types.appendChild(makeChip(label, on, host ? () => {
        if (on && st.types.length === 1) return showToast("Mindestens eine Art muss gewählt sein.");
        Online.send({ type: "pkSettings", settings: { types: on ? st.types.filter((x) => x !== id) : [...st.types, id] } });
      } : null));
    }
    types.classList.toggle("static", !host);
    const rounds = $("pkx-rounds");
    rounds.innerHTML = "";
    for (const n of [6, 8, 10, 12, 16, 20]) rounds.appendChild(makeChip(String(n), st.rounds === n, host ? () => Online.send({ type: "pkSettings", settings: { rounds: n } }) : null));
    rounds.classList.toggle("static", !host);
  }

  return { render, renderLobbySettings };
})();
