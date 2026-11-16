"use strict";

/* =========================================================
   Wer würde am ehesten? – Online (3–20, jeder am eigenen Handy)
   Alle stimmen gleichzeitig ab, wer es am ehesten und wer es am
   wenigsten tun würde. Danach zeigt die App das Ergebnis.
   ========================================================= */
const EhOnline = (() => {
  let state = null;
  let pick = { key: null, most: null, least: null };

  const g = () => state.game;
  const isHost = () => Online.isHost();
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
    state = s;
    const box = $("eh-online");
    box.innerHTML = "";
    const game = g();
    if (game.phase === "vote") renderVote(box);
    else if (game.phase === "result") renderResult(box);
    else renderOver(box);
    return "eh-online";
  }

  function renderLobbySettings() { /* keine Einstellungen */ }

  function questionCard() {
    const card = el("div", "card wwae-card");
    card.appendChild(el("span", "role-label", "Wer würde am ehesten …"));
    card.appendChild(el("p", "wwae-question", `${g().question}?`));
    return card;
  }

  /* ---------- Abstimmen ---------- */
  function renderVote(box) {
    const game = g();
    box.appendChild(el("p", "wwae-num", `Frage ${game.number}`));
    box.appendChild(questionCard());
    const key = `${game.gameId}-${game.number}`;
    if (pick.key !== key) pick = { key, most: null, least: null };
    const players = game.players.filter((p) => !p.left);

    if (game.myVote) {
      const card = el("div", "card");
      card.appendChild(el("p", "small", `Deine Stimme: am ehesten ${nameOf(game.myVote.most)}, am wenigsten ${nameOf(game.myVote.least)}.`));
      card.appendChild(button("Ändern", "ghost", () => Online.send({ type: "ehUnvote" })));
      box.appendChild(card);
    } else if (game.inGame) {
      const card = el("div", "card");
      for (const [k, label] of [["most", "Am ehesten"], ["least", "Am wenigsten"]]) {
        card.appendChild(el("h2", "wwae-h" + (k === "least" ? " least" : ""), label));
        const chips = el("div", "chips wwae-chips" + (k === "least" ? " least" : ""));
        for (const p of players) {
          chips.appendChild(makeChip(p.name + (p.id === state.you ? " (Du)" : ""), pick[k] === p.id, () => {
            pick[k] = pick[k] === p.id ? null : p.id;
            const other = k === "most" ? "least" : "most";
            if (pick[other] === p.id) pick[other] = null;
            render(state);
          }));
        }
        card.appendChild(chips);
      }
      box.appendChild(card);
      const send = button("Abstimmen", "primary big", () => Online.send({ type: "ehVote", most: pick.most, least: pick.least }));
      send.disabled = !pick.most || !pick.least;
      box.appendChild(send);
    }

    // Wer fehlt noch?
    const open = players.filter((p) => !p.voted);
    const wait = el("div", "card");
    const head = el("div", "row-between");
    head.appendChild(el("h2", "", open.length ? "Warten auf …" : "Alle haben abgestimmt"));
    head.appendChild(el("span", "pill", `${players.length - open.length}/${players.length}`));
    wait.appendChild(head);
    const chips = el("div", "fz-wait");
    for (const p of open) chips.appendChild(el("span", "chip" + (p.connected ? "" : " offline"), p.name));
    wait.appendChild(chips);
    box.appendChild(wait);

    if (isHost()) {
      box.appendChild(button("Jetzt auswerten (Host)", "ghost", () => Online.confirmHost("Jetzt auswerten?", "Wer noch nicht abgestimmt hat, zählt bei dieser Frage nicht.", "ehForce")));
      box.appendChild(button("Frage überspringen (Host)", "ghost", () => Online.send({ type: "ehNext" })));
      box.appendChild(button("Beenden & Auswertung (Host)", "ghost", () => Online.confirmHost("Spiel beenden?", "Es geht direkt zur Auswertung.", "ehFinish")));
    }
  }

  /* ---------- Ergebnis einer Frage ---------- */
  function tally(counts) {
    const list = el("ol", "eh-tally");
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const max = entries.length ? entries[0][1] : 0;
    for (const [id, n] of entries) {
      const li = el("li", n === max ? "top" : "");
      li.appendChild(el("span", "eh-name", nameOf(id)));
      const bar = el("span", "eh-bar");
      bar.style.setProperty("--w", `${Math.round((n / max) * 100)}%`);
      li.appendChild(bar);
      li.appendChild(el("span", "eh-n", String(n)));
      list.appendChild(li);
    }
    return list;
  }

  function renderResult(box) {
    const game = g();
    const last = game.last;
    box.appendChild(el("p", "wwae-num", `Frage ${game.number}`));
    box.appendChild(questionCard());
    const top = (counts) => {
      const e = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return e.length ? e.filter(([, n]) => n === e[0][1]).map(([id]) => nameOf(id)).join(" & ") : "–";
    };
    const most = el("div", "card");
    most.appendChild(el("span", "role-label", "Am ehesten"));
    most.appendChild(el("p", "eh-winner", top(last.most)));
    most.appendChild(tally(last.most));
    box.appendChild(most);
    const least = el("div", "card");
    least.appendChild(el("span", "role-label", "Am wenigsten"));
    least.appendChild(el("p", "eh-winner least", top(last.least)));
    least.appendChild(tally(last.least));
    box.appendChild(least);
    if (isHost()) {
      box.appendChild(button("Nächste Frage", "primary big", () => Online.send({ type: "ehNext" })));
      box.appendChild(button("Beenden & Auswertung", "ghost", () => Online.send({ type: "ehFinish" })));
    } else {
      box.appendChild(el("p", "muted small center", "Der Host startet die nächste Frage."));
    }
  }

  /* ---------- Auswertung ---------- */
  function renderOver(box) {
    const game = g();
    const header = el("header", "title");
    header.appendChild(el("h1", "", "Auswertung"));
    header.appendChild(el("p", "sub", `${game.history.length} ${game.history.length === 1 ? "Frage" : "Fragen"} gespielt`));
    box.appendChild(header);
    const stats = game.players.map((p) => {
      const most = game.history.filter((h) => h.most[p.id]).map((h) => ({ q: h.q, n: h.most[p.id] }));
      const least = game.history.filter((h) => h.least[p.id]).map((h) => ({ q: h.q, n: h.least[p.id] }));
      return { p, most, least, m: most.reduce((s, x) => s + x.n, 0), l: least.reduce((s, x) => s + x.n, 0) };
    }).sort((a, b) => b.m - a.m);
    for (const s of stats) {
      const card = el("details", "card eh-person");
      const sum = el("summary", "");
      sum.appendChild(el("strong", "", s.p.name));
      sum.appendChild(el("span", "muted small", ` · ${s.m}× am ehesten, ${s.l}× am wenigsten`));
      card.appendChild(sum);
      for (const [label, list] of [["Am ehesten bei", s.most], ["Am wenigsten bei", s.least]]) {
        if (!list.length) continue;
        card.appendChild(el("span", "role-label", label));
        const ul = el("ul", "eh-list");
        for (const x of list) ul.appendChild(el("li", "", `${x.q}? (${x.n})`));
        card.appendChild(ul);
      }
      box.appendChild(card);
    }
    if (isHost()) {
      box.appendChild(button("Nochmal spielen", "primary big", () => Online.send({ type: "start" })));
      box.appendChild(button("Zurück zur Lobby", "ghost", () => Online.send({ type: "endGame" })));
    } else {
      box.appendChild(el("p", "muted small center", "Warte auf den Host …"));
    }
  }

  return { render, renderLobbySettings };
})();
