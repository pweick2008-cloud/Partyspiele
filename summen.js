"use strict";

/* =========================================================
   Summ mal! – Pass & Play (2–20 Spieler)
   Reihum bekommt einer das Handy, sieht Titel und Interpret eines
   Songs und summt ihn. Die anderen raten laut. Der Summer tippt an,
   wer den Titel und wer den Interpreten erraten hat: je 1 Punkt.
   Damit sich Songs selten wiederholen, merkt sich das Gerät, wann
   welcher Song zuletzt dran war; neue und lange nicht gespielte
   Songs kommen zuerst.
   ========================================================= */
const Summen = (() => {
  const STORE = "summen-v1";
  const PLAYED = "summen-played-v1"; // Song-ID → Zeitpunkt, zuletzt gespielt
  const MIN = 2;
  const MAX = 20;
  const ROUNDS = [1, 2, 3, 5, 8];
  const TIMES = [0, 30, 45, 60, 90];

  let setup = { names: ["", "", ""], genres: [], rounds: 3, time: 60 };
  let game = null;
  let clock = null;

  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* egal */ } };
  const allGenres = () => (typeof SUMMEN_GENRES !== "undefined" ? SUMMEN_GENRES : []);

  /* ---------- Verlauf: neue und lange nicht gespielte Songs zuerst ---------- */
  // Sortiert nach „zuletzt gespielt“ (nie gespielt = ganz vorn), innerhalb
  // gleich alter Gruppen zufällig. Die Genres werden reihum gemischt.
  function buildDeck(genreIds) {
    const played = load(PLAYED, {});
    const piles = shuffle(genreIds).map((gid) => {
      const g = allGenres().find((x) => x.id === gid);
      if (!g) return [];
      return shuffle(g.songs.map((s) => ({ ...s, genre: g.name, seen: played[s.id] || 0 })))
        .sort((a, b) => a.seen - b.seen);
    });
    const deck = [];
    for (let i = 0; piles.some((p) => p.length > i); i++) for (const p of shuffle(piles)) if (p[i]) deck.push(p[i]);
    // Über alle Genres hinweg noch einmal: nie gespielte vor lange nicht gespielten
    return deck.map((s, i) => ({ s, i })).sort((a, b) => (a.s.seen === b.s.seen ? a.i - b.i : a.s.seen - b.s.seen)).map((x) => x.s);
  }

  function markPlayed(song) {
    const played = load(PLAYED, {});
    played[song.id] = Date.now();
    // Nicht unendlich wachsen lassen: höchstens 3000 Einträge behalten
    const entries = Object.entries(played);
    if (entries.length > 3000) entries.sort((a, b) => a[1] - b[1]).splice(0, entries.length - 3000);
    save(PLAYED, Object.fromEntries(entries));
  }

  /* ---------- Start ---------- */
  function openSetup() {
    const saved = load(STORE, null);
    if (saved && Array.isArray(saved.names)) setup = { ...setup, ...saved };
    if (!saved) setup.names = settings.names.filter((n) => n.trim()).slice(0, MAX);
    while (setup.names.length < MIN) setup.names.push("");
    setup.names = setup.names.slice(0, MAX);
    const ids = allGenres().map((g) => g.id);
    setup.genres = (setup.genres || []).filter((id) => ids.includes(id));
    if (!setup.genres.length) setup.genres = ids.slice();
    renderSetup();
    showScreen("summen-setup", "setup");
  }

  function renderSetup() {
    const list = $("summen-players");
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
      input.autocapitalize = "words";
      input.addEventListener("input", () => { setup.names[i] = input.value; save(STORE, setup); });
      row.appendChild(input);
      list.appendChild(row);
    });
    $("summen-count").textContent = setup.names.length;
    const box = $("summen-genres");
    box.innerHTML = "";
    for (const g of allGenres()) {
      const on = setup.genres.includes(g.id);
      box.appendChild(makeChip(`${g.name} (${g.songs.length})`, on, () => {
        if (on && setup.genres.length === 1) return showToast("Mindestens ein Genre muss gewählt sein.");
        setup.genres = on ? setup.genres.filter((x) => x !== g.id) : [...setup.genres, g.id];
        save(STORE, setup);
        renderSetup();
      }));
    }
    const all = setup.genres.length === allGenres().length;
    box.appendChild(makeChip("Alle", all, () => {
      setup.genres = all ? [allGenres()[0].id] : allGenres().map((g) => g.id);
      save(STORE, setup);
      renderSetup();
    }));
    const rounds = $("summen-rounds");
    rounds.innerHTML = "";
    for (const n of ROUNDS) rounds.appendChild(makeChip(String(n), setup.rounds === n, () => { setup.rounds = n; save(STORE, setup); renderSetup(); }));
    const times = $("summen-times");
    times.innerHTML = "";
    for (const t of TIMES) times.appendChild(makeChip(t ? `${t} s` : "ohne", setup.time === t, () => { setup.time = t; save(STORE, setup); renderSetup(); }));
    const songs = allGenres().filter((g) => setup.genres.includes(g.id)).reduce((n, g) => n + g.songs.length, 0);
    const played = load(PLAYED, {});
    const fresh = allGenres().filter((g) => setup.genres.includes(g.id)).reduce((n, g) => n + g.songs.filter((s) => !played[s.id]).length, 0);
    $("summen-total").textContent = `${songs} Songs ausgewählt, davon ${fresh} auf diesem Gerät noch nie gespielt`;
    $("summen-error").hidden = true;
  }

  function changeCount(dir) {
    if (dir > 0 && setup.names.length < MAX) setup.names.push("");
    if (dir < 0 && setup.names.length > MIN) setup.names.pop();
    save(STORE, setup);
    renderSetup();
  }

  function start() {
    const names = setup.names.map((n) => n.trim());
    const err = (t) => { $("summen-error").textContent = t; $("summen-error").hidden = false; };
    if (names.some((n) => !n)) return err("Bitte gib allen Spielern einen Namen.");
    if (new Set(names.map(normalize)).size !== names.length) return err("Jeder Name darf nur einmal vorkommen.");
    game = {
      players: names.map((name) => ({ name, score: 0 })),
      deck: buildDeck(setup.genres),
      pos: 0,
      turn: 0,
      total: names.length * setup.rounds,
      time: setup.time,
      log: []
    };
    nextTurn(true);
  }

  /* ---------- Zug ---------- */
  const hummer = () => game.players[game.turn % game.players.length];

  async function nextTurn(first) {
    stopClock();
    if (!first) game.turn++;
    if (game.turn >= game.total) return finish();
    Object.assign(game, { phase: "handoff", song: null, title: null, artist: null, startedAt: null, picking: null });
    renderTurn();
    showScreen("summen-turn", "game");
  }

  function drawSong() {
    if (game.pos >= game.deck.length) game.deck = buildDeck(setup.genres), game.pos = 0;
    game.song = game.deck[game.pos++];
    markPlayed(game.song);
  }

  function showSong() {
    drawSong();
    game.phase = "hum";
    renderTurn();
  }

  function otherSong() {
    drawSong();
    stopClock();
    game.startedAt = null;
    renderTurn();
  }

  function startHumming() {
    game.startedAt = Date.now();
    if (game.time) {
      clearInterval(clock);
      clock = setInterval(tickClock, 200);
    }
    renderTurn();
  }

  function tickClock() {
    const left = game.time * 1000 - (Date.now() - game.startedAt);
    $("summen-clock").textContent = Math.max(0, Math.ceil(left / 1000));
    $("summen-clock").classList.toggle("urgent", left <= 10000);
    if (left <= 0) {
      stopClock();
      if (navigator.vibrate) navigator.vibrate(400);
      $("summen-clock").textContent = "Zeit!";
    }
  }

  function stopClock() {
    clearInterval(clock);
    clock = null;
  }

  // Wer hat Titel / Interpret erraten? kind: "title", "artist" oder "both"
  function pickGuesser(kind) {
    game.picking = game.picking === kind ? null : kind;
    renderTurn();
  }

  function award(i) {
    const kind = game.picking;
    if (kind === "title" || kind === "both") game.title = game.title === i && kind === "title" ? null : i;
    if (kind === "artist" || kind === "both") game.artist = game.artist === i && kind === "artist" ? null : i;
    game.picking = null;
    renderTurn();
  }

  function resolve() {
    stopClock();
    if (game.title !== null) game.players[game.title].score++;
    if (game.artist !== null) game.players[game.artist].score++;
    game.log.push({ song: game.song, hummer: hummer().name, title: game.title, artist: game.artist });
    game.phase = "result";
    renderTurn();
  }

  function renderTurn() {
    const h = hummer();
    $("summen-num").textContent = `Song ${game.turn + 1} von ${game.total}`;
    const hand = game.phase === "handoff";
    $("summen-handoff").hidden = !hand;
    $("summen-hum").hidden = game.phase !== "hum";
    $("summen-result").hidden = game.phase !== "result";
    $("summen-handoff-name").textContent = h.name;

    if (game.phase === "hum") {
      const s = game.song;
      $("summen-genre").textContent = s.genre;
      $("summen-title").textContent = s.t;
      $("summen-artist").textContent = s.a;
      const running = !!game.startedAt;
      $("summen-start").hidden = running;
      $("summen-other").hidden = running;
      $("summen-clock-box").hidden = !running || !game.time;
      if (running && game.time) tickClock();
      $("summen-award").hidden = !running;
      const name = (i) => (i === null ? "–" : game.players[i].name);
      $("summen-btn-title").textContent = `Titel erraten: ${name(game.title)}`;
      $("summen-btn-artist").textContent = `Interpret erraten: ${name(game.artist)}`;
      $("summen-btn-title").classList.toggle("selected", game.picking === "title");
      $("summen-btn-artist").classList.toggle("selected", game.picking === "artist");
      $("summen-btn-both").classList.toggle("selected", game.picking === "both");
      const chips = $("summen-pick");
      chips.hidden = !game.picking;
      chips.innerHTML = "";
      if (game.picking) {
        const label = { title: "Wer hat den Titel erraten?", artist: "Wer hat den Interpreten erraten?", both: "Wer hat beides erraten?" }[game.picking];
        const head = document.createElement("p");
        head.className = "small muted summen-pick-head";
        head.textContent = label;
        chips.appendChild(head);
        game.players.forEach((p, i) => {
          if (p === h) return;
          const sel = (game.picking === "title" && game.title === i) || (game.picking === "artist" && game.artist === i) || (game.picking === "both" && game.title === i && game.artist === i);
          chips.appendChild(makeChip(p.name, sel, () => award(i)));
        });
      }
      $("summen-done").textContent = game.title === null && game.artist === null ? "Keiner hat's erraten" : "Fertig – auflösen";
    }

    if (game.phase === "result") {
      const s = game.song;
      $("summen-r-title").textContent = s.t;
      $("summen-r-artist").textContent = s.a;
      const parts = [];
      if (game.title !== null) parts.push(`Titel: ${game.players[game.title].name} +1`);
      if (game.artist !== null) parts.push(`Interpret: ${game.players[game.artist].name} +1`);
      $("summen-r-points").textContent = parts.length ? parts.join(" · ") : "Keiner hat's erraten.";
      $("summen-next").textContent = game.turn + 1 >= game.total ? "Zum Endstand" : `Weiter – ${game.players[(game.turn + 1) % game.players.length].name} summt`;
    }

    // Punktestand
    const sc = $("summen-scores");
    sc.innerHTML = "";
    game.players.forEach((p) => {
      const el = document.createElement("div");
      el.className = "quiz-score" + (p === h ? " current" : "");
      el.innerHTML = `<span class="quiz-score-name"></span><span class="quiz-score-val"></span>`;
      el.firstChild.textContent = p.name;
      el.lastChild.textContent = p.score;
      sc.appendChild(el);
    });
  }

  /* ---------- Ende ---------- */
  function finish() {
    stopClock();
    const ranking = game.players.slice().sort((a, b) => b.score - a.score);
    const list = $("summen-ranking");
    list.innerHTML = "";
    for (const p of ranking) {
      const place = ranking.findIndex((x) => x.score === p.score) + 1;
      const li = document.createElement("li");
      li.className = "slf-rank" + (place === 1 ? " first" : "");
      li.innerHTML = `<span class="slf-place">${place}.</span><span class="slf-rank-name"></span><span></span><span class="slf-total"></span>`;
      li.querySelector(".slf-rank-name").textContent = p.name;
      li.querySelector(".slf-total").textContent = p.score;
      list.appendChild(li);
    }
    const top = ranking.filter((p) => p.score === ranking[0].score);
    $("summen-winner").textContent = top.length > 1 ? `Gleichstand: ${top.map((p) => p.name).join(" & ")}` : `${top[0].name} gewinnt!`;
    const log = $("summen-log");
    log.innerHTML = "";
    for (const e of game.log) {
      const li = document.createElement("li");
      li.textContent = `${e.song.t} – ${e.song.a} (gesummt von ${e.hummer})`;
      log.appendChild(li);
    }
    showScreen("summen-end", "end");
  }

  async function finishEarly() {
    const ok = await showModal({ title: "Spiel beenden?", text: "Es geht direkt zum Endstand.", ok: "Beenden", cancel: "Weiterspielen" });
    if (ok) finish();
  }

  /* ---------- Events ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("summen-stepper").addEventListener("click", (e) => {
      const b = e.target.closest("[data-dir]");
      if (b) changeCount(Number(b.dataset.dir));
    });
    $("summen-start-game").addEventListener("click", start);
    $("summen-show").addEventListener("click", showSong);
    $("summen-other").addEventListener("click", otherSong);
    $("summen-start").addEventListener("click", startHumming);
    $("summen-btn-title").addEventListener("click", () => pickGuesser("title"));
    $("summen-btn-artist").addEventListener("click", () => pickGuesser("artist"));
    $("summen-btn-both").addEventListener("click", () => pickGuesser("both"));
    $("summen-done").addEventListener("click", resolve);
    $("summen-next").addEventListener("click", () => nextTurn(false));
    $("summen-quit").addEventListener("click", finishEarly);
    $("summen-again").addEventListener("click", openSetup);
  });

  return { openSetup };
})();
