"use strict";

/* =========================================================
   Summ mal! – Online (2–20, jeder am eigenen Handy)
   Nur der Summer sieht Titel und Interpret. Er tippt an, wer was
   erraten hat. Der Server merkt sich für alle Lobbys gemeinsam,
   welche Songs zuletzt dran waren.
   ========================================================= */
const SmOnline = (() => {
  let state = null;
  let offset = 0;
  let clock = null;
  let picking = null;

  const g = () => state.game;
  const isHost = () => Online.isHost();
  const me = () => state.you;
  const nameOf = (id) => (g().players.find((p) => p.id === id) || {}).name || "?";

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
    if (s !== state) offset = (s.game.now || Date.now()) - Date.now();
    state = s;
    const box = $("sm-online");
    box.innerHTML = "";
    clearInterval(clock);
    clock = null;
    const game = g();
    if (game.phase !== "hum") picking = null;
    if (game.phase === "over") renderOver(box);
    else renderTurn(box);
    return "sm-online";
  }

  function scores(box) {
    const wrap = el("div", "quiz-scores");
    for (const p of g().players) {
      const s = el("div", "quiz-score" + (p.id === g().hummer ? " current" : "") + (p.left ? " left" : ""));
      s.appendChild(el("span", "quiz-score-name", p.name + (p.id === me() ? " (Du)" : "")));
      s.appendChild(el("span", "quiz-score-val", String(p.score)));
      wrap.appendChild(s);
    }
    box.appendChild(wrap);
  }

  function renderTurn(box) {
    const game = g();
    const mine = game.hummer === me();
    box.appendChild(el("p", "wwae-num", `Song ${game.number} von ${game.total}`));

    if (game.phase === "result") {
      const card = el("div", "card summen-result");
      card.appendChild(el("span", "role-label", "Es war"));
      card.appendChild(el("p", "summen-title", game.song.t));
      card.appendChild(el("p", "summen-artist", game.song.a));
      const parts = [];
      if (game.title) parts.push(`Titel: ${nameOf(game.title)} +1`);
      if (game.artist) parts.push(`Interpret: ${nameOf(game.artist)} +1`);
      card.appendChild(el("p", "summen-points", parts.length ? parts.join(" · ") : "Keiner hat's erraten."));
      if (mine || isHost()) card.appendChild(button(game.number >= game.total ? "Zum Endstand" : "Nächster Song", "primary big", () => Online.send({ type: "smNext" })));
      else card.appendChild(el("p", "muted small", `${nameOf(game.hummer)} startet den nächsten Song.`));
      box.appendChild(card);
      scores(box);
      return;
    }

    // Uhr
    const clockBox = el("div", "summen-clock-box");
    const clockEl = el("span", "summen-clock");
    clockBox.appendChild(clockEl);
    const tick = () => {
      if (!game.startedAt || !game.time) return;
      const left = game.time * 1000 - (Date.now() + offset - game.startedAt);
      clockEl.textContent = left > 0 ? String(Math.ceil(left / 1000)) : "Zeit!";
      clockEl.classList.toggle("urgent", left <= 10000);
      if (left <= 0) { clearInterval(clock); clock = null; if (navigator.vibrate) navigator.vibrate(300); }
    };

    if (mine) {
      const card = el("div", "card summen-card");
      card.appendChild(el("span", "summen-genre", game.genre));
      card.appendChild(el("p", "summen-title", game.song.t));
      card.appendChild(el("p", "summen-artist", game.song.a));
      box.appendChild(card);
      if (!game.startedAt) {
        box.appendChild(el("p", "small muted center", "Nur du siehst den Song. Summe ihn – ohne Text!"));
        box.appendChild(button("Los – summen!", "primary big", () => Online.send({ type: "smStart" })));
        box.appendChild(button("Kenne ich nicht – anderer Song", "ghost", () => Online.send({ type: "smOther" })));
      }
    } else {
      const card = el("div", "card summen-handoff");
      card.appendChild(el("span", "role-label", game.startedAt ? "summt gerade" : "sucht sich gleich einen Song aus"));
      card.appendChild(el("p", "summen-handoff-name", nameOf(game.hummer)));
      card.appendChild(el("p", "small muted", `Genre: ${game.genre}. Ratet laut Titel und Interpret!`));
      box.appendChild(card);
    }
    if (game.startedAt && game.time) { box.appendChild(clockBox); tick(); clock = setInterval(tick, 200); }

    // Vergeben: nur der Summer (oder der Host, falls der Summer hängt)
    if (game.startedAt && (mine || isHost())) {
      const award = el("div", "card summen-award");
      award.appendChild(el("span", "role-label", mine ? "Wer hat's erraten?" : `Wer hat's erraten? (Host, für ${nameOf(game.hummer)})`));
      const btns = el("div", "summen-btns");
      const label = (k, n) => `${n}: ${game[k] ? nameOf(game[k]) : "–"}`;
      for (const [k, text, cls] of [["title", label("title", "Titel erraten"), ""], ["artist", label("artist", "Interpret erraten"), ""], ["both", "Beides erraten", " both"]]) {
        const b = button(text, "summen-btn" + cls + (picking === k ? " selected" : ""), () => { picking = picking === k ? null : k; render(state); });
        btns.appendChild(b);
      }
      award.appendChild(btns);
      if (picking) {
        const chips = el("div", "chips summen-pick");
        chips.appendChild(el("p", "small muted summen-pick-head", { title: "Wer hat den Titel erraten?", artist: "Wer hat den Interpreten erraten?", both: "Wer hat beides erraten?" }[picking]));
        for (const p of game.players) {
          if (p.id === game.hummer || p.left) continue;
          const sel = picking === "both" ? game.title === p.id && game.artist === p.id : game[picking] === p.id;
          chips.appendChild(makeChip(p.name, sel, () => {
            const kind = picking;
            picking = null;
            Online.send({ type: "smAward", kind, player: sel ? null : p.id });
          }));
        }
        award.appendChild(chips);
      }
      award.appendChild(button(!game.title && !game.artist ? "Keiner hat's erraten" : "Fertig – auflösen", "primary big", () => Online.send({ type: "smResolve" })));
      box.appendChild(award);
    }
    scores(box);
    if (isHost()) box.appendChild(button("Spiel beenden (Host)", "ghost", () => Online.confirmHost("Spiel beenden?", "Es geht direkt zum Endstand.", "smEnd")));
  }

  function renderOver(box) {
    const game = g();
    const ranking = game.players.slice().sort((a, b) => b.score - a.score);
    const top = ranking.filter((p) => p.score === ranking[0].score);
    const header = el("header", "title");
    header.appendChild(el("h1", "", "Endstand"));
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
    if (game.log && game.log.length) {
      const d = el("details", "card");
      d.appendChild(el("summary", "", "Alle Songs"));
      const ul = el("ul", "pk-log");
      for (const e of game.log) ul.appendChild(el("li", "", `${e.t} – ${e.a} (gesummt von ${e.hummer})`));
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
    const st = (s.xSettings && s.xSettings.summen) || { genres: [], rounds: 3, time: 60 };
    const genres = typeof SUMMEN_GENRES !== "undefined" ? SUMMEN_GENRES : [];
    const chosen = st.genres.length ? st.genres : genres.map((x) => x.id);
    $("smx-host-pill").textContent = host ? "Du bist Host" : "Nur der Host kann ändern";
    const box = $("smx-genres");
    box.innerHTML = "";
    const send = (patch) => Online.send({ type: "smSettings", settings: patch });
    for (const x of genres) {
      const on = chosen.includes(x.id);
      box.appendChild(makeChip(`${x.name} (${x.songs.length})`, on, host ? () => {
        if (on && chosen.length === 1) return showToast("Mindestens ein Genre muss gewählt sein.");
        send({ genres: on ? chosen.filter((id) => id !== x.id) : [...chosen, x.id] });
      } : null));
    }
    box.classList.toggle("static", !host);
    const rounds = $("smx-rounds");
    rounds.innerHTML = "";
    for (const n of [1, 2, 3, 5, 8]) rounds.appendChild(makeChip(String(n), st.rounds === n, host ? () => send({ rounds: n }) : null));
    rounds.classList.toggle("static", !host);
    const times = $("smx-times");
    times.innerHTML = "";
    for (const t of [0, 30, 45, 60, 90]) times.appendChild(makeChip(t ? `${t} s` : "ohne", st.time === t, host ? () => send({ time: t }) : null));
    times.classList.toggle("static", !host);
  }

  return { render, renderLobbySettings };
})();
