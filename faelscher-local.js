"use strict";

/* =========================================================
   Fälscher – Pass & Play (3 bis 8 Spieler, ein Gerät)
   Jeder erfindet heimlich eine falsche Antwort, dann wird geheim
   abgestimmt, welche Antwort die echte ist. Die Fragen
   (faelscher-fragen.js) werden erst beim Start geladen.
   ========================================================= */
const LocalFaelscher = (() => {
  const STORE = "faelscher-v1";
  const USED = "faelscher-used-v1";

  let setup = { names: ["", "", ""], count: FZ.DEFAULT_COUNT };
  let game = null;
  let fragenPromise = null;

  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* egal */ } };

  function loadFragen() {
    if (typeof FAELSCHER_FRAGEN !== "undefined") return Promise.resolve();
    if (!fragenPromise) {
      fragenPromise = new Promise((resolve, reject) => {
        const el = document.createElement("script");
        el.src = "faelscher-fragen.js";
        el.onload = resolve;
        el.onerror = () => { fragenPromise = null; reject(new Error("Fragen nicht geladen")); };
        document.head.appendChild(el);
      });
    }
    return fragenPromise;
  }

  /* ---------- Start ---------- */
  function openSetup() {
    const saved = load(STORE, null);
    if (saved && Array.isArray(saved.names)) setup = { ...setup, ...saved };
    setup.names = setup.names.slice(0, FZ.MAX);
    while (setup.names.length < FZ.MIN) setup.names.push("");
    renderSetup();
    showScreen("fz-setup", "setup");
  }

  function renderSetup() {
    const list = $("fz-players");
    list.innerHTML = "";
    setup.names.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.innerHTML = `<span class="num">${i + 1}.</span>`;
      const input = document.createElement("input");
      input.type = "text";
      input.value = name;
      input.maxLength = 20;
      input.placeholder = `Spieler ${i + 1}`;
      input.autocomplete = "off";
      input.addEventListener("input", () => { setup.names[i] = input.value; save(STORE, setup); });
      row.appendChild(input);
      list.appendChild(row);
    });
    $("fz-count").textContent = setup.names.length;
    const counts = $("fz-qcount");
    counts.innerHTML = "";
    for (const n of FZ.COUNTS) counts.appendChild(makeChip(String(n), setup.count === n, () => { setup.count = n; save(STORE, setup); renderSetup(); }));
    $("fz-error").hidden = true;
  }

  async function start(sameGame) {
    const names = setup.names.map((n) => n.trim());
    const err = (t) => { $("fz-error").textContent = t; $("fz-error").hidden = false; };
    if (!sameGame) {
      if (names.some((n) => !n)) return err("Bitte gib allen Spielern einen Namen.");
      if (new Set(names.map(normalize)).size !== names.length) return err("Jeder Name darf nur einmal vorkommen.");
    }
    try { await loadFragen(); } catch (e) { return err("Die Fragen konnten nicht geladen werden."); }
    const used = load(USED, []);
    const questions = fzPickQuestions(FAELSCHER_FRAGEN, setup.count, used);
    save(USED, [...used, ...questions.map((q) => q.id)].slice(-Math.floor(FAELSCHER_FRAGEN.length * 0.8)));
    const players = sameGame && game ? game.players : names.map((name, i) => ({ id: `p${i}`, name }));
    game = {
      players,
      questions,
      index: -1,
      totals: Object.fromEntries(players.map((p) => [p.id, 0])),
      log: []
    };
    nextQuestion();
  }

  /* ---------- Ablauf ---------- */
  function nextQuestion() {
    game.index++;
    if (game.index >= game.questions.length) return showFinal();
    game.answers = {};
    game.votes = {};
    game.round = null;
    game.queue = game.players.map((p) => p.id); // wer noch schreiben muss
    view("question");
  }

  const nameOf = (id) => (game.players.find((p) => p.id === id) || {}).name || "?";
  const q = () => game.questions[game.index];

  function view(step) {
    game.step = step;
    const box = $("fz-local");
    box.innerHTML = "";
    box.appendChild(FzView.header(`Frage ${game.index + 1} von ${game.questions.length}`, q().frage));
    if (step === "question") {
      box.appendChild(FzView.note("Jeder erfindet gleich heimlich eine Antwort, die echt klingt. Gebt das Handy dann reihum weiter."));
      box.appendChild(FzView.button("Antworten schreiben", "primary big", () => handoff("write")));
    } else if (step === "list") {
      box.appendChild(FzView.list(game.round.items, null));
      box.appendChild(FzView.note("Einer liest alle Antworten laut vor. Danach wird geheim abgestimmt."));
      box.appendChild(FzView.button("Zur Abstimmung", "primary big", () => { game.queue = game.round.voters.slice(); handoff("vote"); }));
    } else if (step === "reveal") {
      box.appendChild(FzView.reveal(game.round, game.votes, game.score, q(), nameOf));
      box.appendChild(FzView.standings(fzRanking(game.players, game.totals), game.score.points));
      const last = game.index >= game.questions.length - 1;
      box.appendChild(FzView.button(last ? "Zum Endstand" : "Nächste Frage", "primary big", nextQuestion));
    }
    box.appendChild(FzView.button("Spiel beenden", "ghost", async () => {
      const ok = await showModal({ emoji: "", title: "Spiel beenden?", text: "Es geht direkt zum Endstand.", ok: "Beenden", cancel: "Weiterspielen" });
      if (ok) showFinal();
    }));
    showScreen("fz-local", step === "reveal" ? "reveal" : step === "list" || step === "vote" ? "vote" : "write");
    window.scrollTo(0, 0);
  }

  // Übergabe: „Gib das Handy an …“ – danach schreibt oder stimmt dieser Spieler
  function handoff(kind) {
    const id = game.queue[0];
    if (!id) return kind === "write" ? afterWriting() : afterVoting();
    const box = $("fz-local");
    box.innerHTML = "";
    const card = document.createElement("div");
    card.className = "card fz-handoff";
    card.innerHTML = `<span class="role-label">${kind === "write" ? "Antwort schreiben" : "Abstimmen"}</span><p class="fz-handoff-text">Gib das Handy an</p><span class="big-name"></span>`;
    card.querySelector(".big-name").textContent = nameOf(id);
    box.appendChild(card);
    box.appendChild(FzView.button(`Ich bin ${nameOf(id)}`, "primary big", () => (kind === "write" ? write(id) : vote(id))));
    showScreen("fz-local", kind === "write" ? "write" : "vote");
    window.scrollTo(0, 0);
  }

  function write(id) {
    const box = $("fz-local");
    box.innerHTML = "";
    box.appendChild(FzView.header(`${nameOf(id)}, deine Fälschung`, q().frage));
    const form = FzView.answerForm((text) => {
      game.answers[id] = text;
      game.queue.shift();
      handoff("write");
    });
    box.appendChild(form);
    form.querySelector("textarea").focus();
  }

  function afterWriting() {
    const answers = Object.fromEntries(game.players.map((p) => [p.id, game.answers[p.id]]));
    game.round = fzBuildRound(q().antwort, answers);
    if (!game.round.voters.length) return finishRound(); // alle lagen richtig
    view("list");
  }

  function vote(id) {
    const box = $("fz-local");
    box.innerHTML = "";
    box.appendChild(FzView.header(`${nameOf(id)}, welche ist echt?`, q().frage));
    const choices = fzChoices(game.round, id);
    box.appendChild(FzView.voteList(game.round.items, choices.map((c) => c.key), null, (key) => {
      game.votes[id] = key;
      game.queue.shift();
      handoff("vote");
    }, true));
  }

  function afterVoting() {
    finishRound();
  }

  function finishRound() {
    game.score = fzScore(game.round, game.votes, game.players.map((p) => p.id));
    for (const [id, pts] of Object.entries(game.score.points)) game.totals[id] += pts;
    game.log.push({ frage: q().frage, antwort: q().antwort, best: game.score.best });
    view("reveal");
  }

  function showFinal() {
    const box = $("fz-local");
    box.innerHTML = "";
    box.appendChild(FzView.final(fzRanking(game.players, game.totals), game.log, nameOf));
    box.appendChild(FzView.button("Nochmal spielen", "primary big", () => start(true)));
    box.appendChild(FzView.button("Zurück zur Übersicht", "ghost", () => showScreen("hub")));
    showScreen("fz-local", "end");
    window.scrollTo(0, 0);
  }

  /* ---------- Events ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("fz-stepper").addEventListener("click", (e) => {
      const b = e.target.closest("[data-dir]");
      if (!b) return;
      const dir = Number(b.dataset.dir);
      if (dir > 0 && setup.names.length < FZ.MAX) setup.names.push("");
      if (dir < 0 && setup.names.length > FZ.MIN) setup.names.pop();
      save(STORE, setup);
      renderSetup();
    });
    $("fz-start").addEventListener("click", () => start(false));
  });

  return { openSetup };
})();

/* =========================================================
   Fälscher – gemeinsame Bausteine der Anzeige (Pass & Play und online)
   ========================================================= */
const FzView = (() => {
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  function header(label, frage) {
    const card = el("div", "card fz-question");
    card.appendChild(el("span", "role-label", label));
    card.appendChild(el("p", "fz-frage", frage));
    return card;
  }

  const note = (text) => el("p", "muted small center", text);

  function button(label, kind, onClick) {
    const b = el("button", `btn ${kind}`, label);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }

  function answerForm(onSubmit, initial = "") {
    const form = el("form", "card fz-form");
    form.autocomplete = "off";
    const ta = el("textarea");
    ta.maxLength = FZ.MAX_TEXT;
    ta.rows = 4;
    ta.placeholder = "Deine erfundene Antwort – so, dass sie echt klingt …";
    ta.value = initial;
    const count = el("span", "muted small fz-count");
    const send = el("button", "btn primary big", "Abschicken");
    send.type = "submit";
    const update = () => {
      count.textContent = `${ta.value.length}/${FZ.MAX_TEXT}`;
      send.disabled = !ta.value.trim();
    };
    ta.addEventListener("input", update);
    update();
    form.append(ta, count, send);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = ta.value.trim().replace(/\s+/g, " ");
      if (text) onSubmit(text);
    });
    return form;
  }

  // Nummerierte Liste (zum Vorlesen) – ohne Markierung der echten Antwort
  function list(items) {
    const ol = el("ol", "fz-list");
    for (const it of items) ol.appendChild(el("li", "fz-item", it.text));
    return ol;
  }

  // Liste zum Abstimmen. allowed: wählbare Keys; mine-Antworten erscheinen ausgegraut
  function voteList(items, allowed, selected, onPick, confirm) {
    const wrap = el("div", "fz-vote");
    let pending = selected;
    const render = () => {
      wrap.innerHTML = "";
      const forced = allowed.length === 1;
      if (forced) wrap.appendChild(el("p", "muted small center", "Es bleibt nur eine Antwort zur Auswahl."));
      items.forEach((it, i) => {
        const ok = allowed.includes(it.key);
        const b = el("button", "fz-choice" + (pending === it.key ? " selected" : "") + (ok ? "" : " own"));
        b.type = "button";
        b.disabled = !ok;
        b.innerHTML = `<span class="fz-num">${i + 1}</span><span class="fz-text"></span>`;
        b.querySelector(".fz-text").textContent = it.text + (ok ? "" : " (deine Antwort)");
        if (ok) b.addEventListener("click", () => { pending = it.key; if (confirm) render(); else onPick(it.key); });
        wrap.appendChild(b);
      });
      if (confirm) {
        const go = button("Stimme abgeben", "primary big", () => pending && onPick(pending));
        go.disabled = !pending;
        wrap.appendChild(go);
      }
    };
    render();
    return wrap;
  }

  // Aufdecken: echte Antwort + Erklärung, dann jede Antwort mit Autoren und Stimmen
  function reveal(round, votes, score, frage, nameOf) {
    const wrap = el("div", "fz-reveal");
    const official = round.items.find((it) => it.official);
    const real = el("div", "card fz-real");
    real.appendChild(el("span", "role-label", "Die echte Antwort"));
    real.appendChild(el("p", "fz-real-text", official.text));
    real.appendChild(el("p", "fz-expl", frage.erklaerung));
    if (round.merged.length) real.appendChild(el("p", "fz-merged", `Fast wörtlich richtig geschrieben: ${round.merged.map(nameOf).join(", ")} (+2)`));
    wrap.appendChild(real);
    const voterOf = (key) => Object.entries(votes).filter(([, k]) => k === key).map(([id]) => nameOf(id));
    const sorted = round.items.slice().sort((a, b) => (b.official - a.official) || (score.counts[b.key] - score.counts[a.key]));
    for (const it of sorted) {
      const card = el("div", "card fz-res" + (it.official ? " official" : ""));
      card.appendChild(el("p", "fz-res-text", it.text));
      card.appendChild(el("span", "fz-res-who", it.official ? "Echt" : `Gefälscht von ${it.authors.map(nameOf).join(" & ")}`));
      const v = voterOf(it.key);
      card.appendChild(el("span", "muted small", v.length ? `Gewählt von ${v.join(", ")}` : "Von niemandem gewählt"));
      wrap.appendChild(card);
    }
    if (score.noneFound) wrap.appendChild(el("p", "fz-bonus", "Niemand hat die echte Antwort gefunden – jeder Fälscher in der Liste bekommt +1."));
    return wrap;
  }

  function standings(ranking, roundPoints) {
    const card = el("div", "card");
    card.appendChild(el("h2", "", "Punktestand"));
    const ol = el("ol", "slf-ranking");
    for (const p of ranking) {
      const li = el("li", "slf-rank" + (p.place === 1 ? " first" : ""));
      li.innerHTML = `<span class="slf-place">${p.place}.</span><span class="slf-rank-name"></span><span class="slf-gain muted small"></span><span class="slf-total">${p.total}</span>`;
      li.querySelector(".slf-rank-name").textContent = p.name;
      if (roundPoints) li.querySelector(".slf-gain").textContent = `+${roundPoints[p.id] || 0}`;
      ol.appendChild(li);
    }
    card.appendChild(ol);
    return card;
  }

  function final(ranking, log, nameOf) {
    const wrap = el("div", "fz-final");
    const head = el("header", "title");
    head.appendChild(el("h1", "", "Endstand"));
    wrap.appendChild(head);
    const top = ranking.filter((p) => p.place === 1);
    const big = el("div", "card fz-winner");
    big.appendChild(el("span", "role-label", top.length > 1 ? "Geteilter erster Platz" : "Gewonnen hat"));
    big.appendChild(el("span", "fz-winner-name", top.map((p) => p.name).join(" & ")));
    big.appendChild(el("span", "fz-winner-pts", `${top[0] ? top[0].total : 0} Punkte`));
    wrap.appendChild(big);
    wrap.appendChild(standings(ranking, null));
    if (log.length) {
      const card = el("div", "card fz-log");
      card.appendChild(el("h2", "", "Rundenlog"));
      for (const r of log) {
        const item = el("div", "fz-log-item");
        item.appendChild(el("p", "fz-log-q", r.frage));
        item.appendChild(el("p", "fz-log-a", `Echt: ${r.antwort}`));
        item.appendChild(el("p", "fz-log-b", r.best ? `Beste Fälschung (${r.best.votes} ${r.best.votes === 1 ? "Stimme" : "Stimmen"}, ${r.best.authors.map(nameOf).join(" & ")}): ${r.best.text}` : "Keine Fälschung bekam eine Stimme."));
        card.appendChild(item);
      }
      wrap.appendChild(card);
    }
    return wrap;
  }

  return { header, note, button, answerForm, list, voteList, reveal, standings, final };
})();
