"use strict";

/* =========================================================
   Mein Partner kann – Pass & Play (2 bis 6 Zweierteams)
   Pro Aufgabe bietet aus jedem Team einer, der andere muss liefern.
   Die Bieter überbieten sich reihum („Mein Partner schafft 12!“),
   bis nur noch ein Team übrig ist. Dessen Partner tritt an:
   geschafft = +2 Punkte, nicht geschafft = −1.
   Die Rollen wechseln nach jeder Aufgabe.
   ========================================================= */
const Partner = (() => {
  const STORE = "partner-v1";
  const USED = "partner-used-v1";
  const MIN_TEAMS = 2;
  const MAX_TEAMS = 6;
  const ROUNDS = [6, 8, 10, 12, 16, 20];
  const TYPES = [["w", "Wissen"], ["d", "Denken"], ["p", "Körper"]];
  const TYPE_LABEL = { w: "Wissen", d: "Denken", p: "Körper" };
  const WIN = 2;
  const LOSE = 1;

  let setup = { teams: [["", ""], ["", ""]], types: ["w", "d", "p"], rounds: 10 };
  let game = null;
  let clock = null;
  let audio = null;

  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* egal */ } };

  /* ---------- Start ---------- */
  function openSetup() {
    const saved = load(STORE, null);
    if (saved && Array.isArray(saved.teams)) setup = { ...setup, ...saved };
    setup.teams = setup.teams.slice(0, MAX_TEAMS).map((t) => [String(t[0] || ""), String(t[1] || "")]);
    while (setup.teams.length < MIN_TEAMS) setup.teams.push(["", ""]);
    setup.types = setup.types.filter((t) => TYPE_LABEL[t]);
    if (!setup.types.length) setup.types = ["w", "d", "p"];
    if (!ROUNDS.includes(setup.rounds)) setup.rounds = 10;
    renderSetup();
    showScreen("pk-setup", "setup");
  }

  function renderSetup() {
    const list = $("pk-teams");
    list.innerHTML = "";
    setup.teams.forEach((team, t) => {
      const row = document.createElement("div");
      row.className = "pk-team-row";
      row.innerHTML = `<span class="pk-team-num">Team ${t + 1}</span>`;
      team.forEach((name, m) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = name;
        input.maxLength = 16;
        input.placeholder = `Spieler ${m + 1}`;
        input.autocomplete = "off";
        input.autocapitalize = "words";
        input.addEventListener("input", () => { setup.teams[t][m] = input.value; save(STORE, setup); });
        row.appendChild(input);
      });
      list.appendChild(row);
    });
    $("pk-count").textContent = setup.teams.length;
    const types = $("pk-types");
    types.innerHTML = "";
    for (const [id, label] of TYPES) {
      const on = setup.types.includes(id);
      const n = PARTNER_AUFGABEN.filter((a) => a.t === id).length;
      types.appendChild(makeChip(`${label} (${n})`, on, () => {
        if (on && setup.types.length === 1) return showToast("Mindestens eine Art muss gewählt sein.");
        setup.types = on ? setup.types.filter((x) => x !== id) : [...setup.types, id];
        save(STORE, setup);
        renderSetup();
      }));
    }
    const rounds = $("pk-rounds");
    rounds.innerHTML = "";
    for (const n of ROUNDS) rounds.appendChild(makeChip(String(n), setup.rounds === n, () => { setup.rounds = n; save(STORE, setup); renderSetup(); }));
    $("pk-total").textContent = `${PARTNER_AUFGABEN.length} Aufgaben`;
    $("pk-error").hidden = true;
  }

  function changeCount(dir) {
    if (dir > 0 && setup.teams.length < MAX_TEAMS) setup.teams.push(["", ""]);
    if (dir < 0 && setup.teams.length > MIN_TEAMS) setup.teams.pop();
    save(STORE, setup);
    renderSetup();
  }

  // Stapel: die gewählten Arten wechseln sich ab, zuletzt gespielte Aufgaben kommen ans Ende
  function buildDeck() {
    const used = new Set(load(USED, []));
    const piles = shuffle(setup.types).map((t) => {
      const all = PARTNER_AUFGABEN.filter((a) => a.t === t);
      return [...shuffle(all.filter((a) => !used.has(a.q))), ...shuffle(all.filter((a) => used.has(a.q)))];
    });
    const deck = [];
    for (let i = 0; piles.some((p) => p.length > i); i++) for (const p of piles) if (p[i]) deck.push(p[i]);
    return deck;
  }

  function start() {
    const teams = setup.teams.map((t) => t.map((n) => n.trim()));
    const err = (t) => { $("pk-error").textContent = t; $("pk-error").hidden = false; };
    const names = teams.flat();
    if (names.some((n) => !n)) return err("Bitte gib allen Spielern einen Namen.");
    if (new Set(names.map(normalize)).size !== names.length) return err("Jeder Name darf nur einmal vorkommen.");
    game = {
      teams: teams.map((members, i) => ({ id: i, members, score: 0 })),
      deck: buildDeck(),
      pos: 0,
      round: 0,
      rounds: setup.rounds,
      log: []
    };
    nextTask(true);
    showScreen("pk-game", "game");
  }

  /* ---------- Aufgabe ---------- */
  const task = () => game.deck[game.pos % game.deck.length];
  const bidderOf = (team) => team.members[game.round % 2];
  const doerOf = (team) => team.members[1 - (game.round % 2)];
  const teamName = (team) => team.members.join(" & ");

  function nextTask(first) {
    stopClock();
    if (!first) { game.round++; game.pos++; }
    if (game.round >= game.rounds) return finish();
    startBidding();
  }

  function startBidding() {
    stopClock();
    const n = game.teams.length;
    const startTeam = game.round % n; // jede Runde eröffnet ein anderes Team
    Object.assign(game, {
      phase: "bid",
      active: game.teams.map((_, i) => (startTeam + i) % n),
      turn: 0,
      high: null,
      value: 1,
      result: null,
      timer: null,
      stapel: null
    });
    render();
  }

  function swapTask() {
    game.pos++;
    startBidding();
  }

  function changeValue(d) {
    const min = game.high ? game.high.amount + 1 : 1;
    game.value = Math.max(min, Math.min(999, game.value + d));
    render();
  }

  function bid() {
    const team = game.active[game.turn];
    game.high = { team, amount: game.value };
    game.value = game.high.amount + 1;
    game.turn = (game.turn + 1) % game.active.length;
    if (navigator.vibrate) navigator.vibrate(15);
    render();
  }

  function pass() {
    if (!game.high) return;
    game.active.splice(game.turn, 1);
    game.turn %= game.active.length;
    // Nur noch das Team mit dem Höchstgebot übrig → es muss liefern
    if (game.active.length === 1) {
      openDeck();
      const used = load(USED, []).filter((q) => q !== task().q);
      used.push(task().q);
      save(USED, used.slice(-Math.floor(PARTNER_AUFGABEN.length * 0.7)));
      game.phase = "do";
    }
    render();
  }

  function judge(ok) {
    stopClock();
    const team = game.teams[game.high.team];
    team.score += ok ? WIN : -LOSE;
    game.result = ok;
    game.phase = "result";
    game.log.push({ q: task().q, team: team.id, doer: doerOf(team), amount: game.high.amount, unit: task().e, ok });
    render();
  }

  /* ---------- Kartenstapel ---------- */
  let quizPromise = null;
  function loadQuiz() {
    if (typeof QUIZ_KATEGORIEN !== "undefined") return Promise.resolve();
    if (!quizPromise) {
      quizPromise = new Promise((resolve) => {
        const el = document.createElement("script");
        el.src = "quiz-fragen.js";
        el.onload = resolve;
        el.onerror = () => { quizPromise = null; resolve(); };
        document.head.appendChild(el);
      });
    }
    return quizPromise;
  }

  async function openDeck() {
    const key = task().k;
    game.stapel = null;
    if (!key || typeof PartnerStapel === "undefined" || !PartnerStapel.STAPEL[key]) return;
    if (PartnerStapel.needsQuiz(key)) await loadQuiz();
    const def = PartnerStapel.STAPEL[key];
    game.stapel = { key, def, state: { seen: new Set() }, right: 0, shown: false, card: null, list: null };
    drawCard();
  }

  function drawCard() {
    const d = game.stapel;
    if (!d) return;
    d.shown = false;
    if (d.def.art === "folge") d.list = PartnerStapel.folge(d.key, game.high.amount);
    else d.card = PartnerStapel.draw(d.key, d.state);
    render();
  }

  function deckAnswer(ok) {
    const d = game.stapel;
    if (ok) {
      d.right++;
      if (navigator.vibrate) navigator.vibrate(20);
    }
    drawCard();
  }

  function renderDeck() {
    const d = game.stapel;
    const box = $("pk-deck");
    box.hidden = !d || game.phase !== "do";
    if (box.hidden) return;
    const art = d.def.art;
    const card = d.card || {};
    $("pk-deck-title").textContent = art === "einzeln" ? (d.def.titel || "Vorgabe")
      : art === "folge" ? d.def.titel
      : d.def.zeigen ? "Dein Partner schaut aufs Display" : "Für das andere Team zum Vorlesen";
    $("pk-deck-v").hidden = art === "folge";
    $("pk-deck-v").textContent = card.v || "";
    $("pk-deck-v").style.color = card.farbe || "";
    $("pk-deck-v").classList.toggle("gross", !!card.gross);
    $("pk-deck-v").classList.toggle("stroop", !!card.farbe);
    const list = $("pk-deck-list");
    list.hidden = art !== "folge";
    if (art === "folge") {
      list.innerHTML = "";
      list.classList.toggle("kurz", d.key === "ziffern");
      for (const item of d.list || []) {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      }
    }
    // Lösung: verdeckt, wenn der Partner selbst aufs Display schaut
    const hasSolution = !!card.l && art === "karten";
    const hidden = d.def.zeigen && !d.shown;
    $("pk-deck-l").hidden = !hasSolution || hidden;
    $("pk-deck-l").textContent = hasSolution ? `Lösung: ${card.l}` : "";
    $("pk-deck-reveal").hidden = !hasSolution || !hidden;
    const counting = art === "karten";
    $("pk-deck-btns").hidden = !counting;
    $("pk-deck-count").hidden = !counting;
    if (counting) {
      const reached = d.right >= game.high.amount;
      $("pk-deck-count").textContent = reached
        ? `${d.right} richtig – Gebot erreicht!`
        : `${d.right} von ${game.high.amount} richtig`;
      $("pk-deck-count").classList.toggle("reached", reached);
    }
    $("pk-deck-new").hidden = art === "karten";
    $("pk-deck-new").textContent = art === "folge" ? "Neue Liste" : "Neu ziehen";
  }

  /* ---------- Uhr ---------- */
  function beep(freq = 880, ms = 350) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.frequency.value = freq;
      gain.gain.value = 0.25;
      osc.connect(gain).connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + ms / 1000);
    } catch (e) { /* kein Ton verfügbar */ }
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  function startClock() {
    const a = task();
    const target = (a.m === "dauer" ? game.high.amount : a.z) * 1000;
    game.timer = { startedAt: Date.now(), target, done: false };
    beep(660, 120);
    clearInterval(clock);
    clock = setInterval(tickClock, 100);
    render();
  }

  function tickClock() {
    const t = game.timer;
    if (!t) return stopClock();
    if (!t.done && Date.now() - t.startedAt >= t.target) {
      t.done = true;
      beep(990, 700);
      // Zeitlimit: Uhr bleibt stehen. Dauer-Aufgabe: Ziel erreicht, Uhr läuft weiter.
      if (task().m !== "dauer") clearInterval(clock);
    }
    renderClock();
  }

  function stopClock() {
    clearInterval(clock);
    clock = null;
  }

  function renderClock() {
    const a = task();
    const t = game.timer;
    const box = $("pk-clock");
    const dauer = a.m === "dauer";
    const elapsed = t ? Date.now() - t.startedAt : 0;
    let text;
    if (dauer) {
      text = t ? (Math.floor(elapsed / 100) / 10).toFixed(1) : "0.0";
    } else {
      text = String(t ? Math.max(0, Math.ceil((t.target - elapsed) / 1000)) : a.z);
    }
    $("pk-clock-num").textContent = text.replace(".", ",");
    $("pk-clock-label").textContent = dauer
      ? (t && t.done ? "Geschafft – Ziel erreicht!" : `Ziel: ${game.high.amount} Sekunden`)
      : (t && t.done ? "Zeit ist um!" : "Sekunden");
    box.classList.toggle("done", !!(t && t.done));
    box.classList.toggle("good", !!(t && t.done && dauer));
    box.classList.toggle("urgent", !!(t && !t.done && !dauer && t.target - elapsed <= 5000));
  }

  /* ---------- Anzeige ---------- */
  function render() {
    const a = task();
    $("pk-num").textContent = `Aufgabe ${game.round + 1} von ${game.rounds}`;
    $("pk-type").textContent = TYPE_LABEL[a.t];
    $("pk-type").dataset.type = a.t;
    $("pk-time").textContent = a.m === "dauer" ? "Stoppuhr" : a.z ? `${a.z} Sekunden` : "ohne Zeitlimit";
    $("pk-question").textContent = a.q;
    $("pk-hint").textContent = a.h || "";
    $("pk-hint").hidden = !a.h;

    // Wer bietet, wer muss ran
    const roles = $("pk-roles");
    roles.innerHTML = "";
    game.teams.forEach((team, i) => {
      const el = document.createElement("div");
      const out = game.phase === "bid" && !game.active.includes(i);
      const turn = game.phase === "bid" && game.active[game.turn] === i;
      const lead = game.high && game.high.team === i;
      el.className = "pk-role" + (out ? " out" : "") + (turn ? " turn" : "") + (lead ? " lead" : "");
      el.innerHTML = `<span class="pk-role-score"></span><span class="pk-role-names"><strong></strong> bietet · <strong></strong> tritt an</span><span class="pk-role-state"></span>`;
      el.querySelector(".pk-role-score").textContent = team.score;
      const strong = el.querySelectorAll("strong");
      strong[0].textContent = bidderOf(team);
      strong[1].textContent = doerOf(team);
      el.querySelector(".pk-role-state").textContent = out ? "gepasst" : lead ? `${game.high.amount}` : "";
      roles.appendChild(el);
    });

    // Bieten
    $("pk-bid").hidden = game.phase !== "bid";
    if (game.phase === "bid") {
      const team = game.teams[game.active[game.turn]];
      $("pk-bid-who").textContent = `${bidderOf(team)} ist dran`;
      $("pk-bid-high").textContent = game.high
        ? `Höchstgebot: ${game.high.amount} ${a.e} (${bidderOf(game.teams[game.high.team])})`
        : "Noch kein Gebot";
      $("pk-bid-value").textContent = game.value;
      $("pk-bid-unit").textContent = a.e;
      $("pk-bid-go").textContent = `„${doerOf(team)} schafft ${game.value}!“`;
      $("pk-bid-pass").hidden = !game.high;
      $("pk-bid-pass").textContent = game.high ? `Passen – ${doerOf(game.teams[game.high.team])} soll es zeigen` : "";
      $("pk-swap").hidden = !!game.high;
    }

    // Antreten
    const doing = game.phase === "do" || game.phase === "result";
    $("pk-do").hidden = !doing;
    if (doing) {
      const team = game.teams[game.high.team];
      const amount = game.high.amount;
      $("pk-do-who").textContent = doerOf(team);
      $("pk-do-goal").textContent = a.m === "dauer"
        ? `muss ${amount} Sekunden durchhalten`
        : `muss ${amount} ${a.e} schaffen${a.z ? ` – in ${a.z} Sekunden` : ""}`;
      const needsClock = a.m === "dauer" || a.z > 0;
      $("pk-clock").hidden = !needsClock;
      $("pk-clock-start").hidden = !needsClock || !!game.timer || game.phase !== "do";
      $("pk-clock-start").textContent = a.m === "dauer" ? "Stoppuhr starten" : "Zeit starten";
      if (needsClock) renderClock();
      $("pk-judge").hidden = game.phase !== "do";
      renderDeck();
      $("pk-yes").textContent = `Geschafft (+${WIN})`;
      $("pk-no").textContent = `Nicht geschafft (−${LOSE})`;
      const res = $("pk-result");
      res.hidden = game.phase !== "result";
      if (game.phase === "result") {
        res.className = "pk-result " + (game.result ? "good" : "bad");
        res.textContent = game.result
          ? `Geschafft! +${WIN} für ${teamName(team)}`
          : `Nicht geschafft. −${LOSE} für ${teamName(team)}`;
      }
    }
    $("pk-next").hidden = game.phase !== "result";
    $("pk-next").textContent = game.round + 1 >= game.rounds ? "Zum Endstand" : "Nächste Aufgabe";
    $("pk-finish").hidden = game.phase === "result" && game.round + 1 >= game.rounds;
  }

  /* ---------- Ende ---------- */
  function finish() {
    stopClock();
    const ranking = game.teams.slice().sort((a, b) => b.score - a.score);
    const list = $("pk-ranking");
    list.innerHTML = "";
    for (const team of ranking) {
      const place = ranking.findIndex((x) => x.score === team.score) + 1;
      const li = document.createElement("li");
      li.className = "slf-rank" + (place === 1 ? " first" : "");
      li.innerHTML = `<span class="slf-place">${place}.</span><span class="slf-rank-name"></span><span></span><span class="slf-total"></span>`;
      li.querySelector(".slf-rank-name").textContent = teamName(team);
      li.querySelector(".slf-total").textContent = team.score;
      list.appendChild(li);
    }
    const top = ranking.filter((t) => t.score === ranking[0].score);
    $("pk-winner").textContent = top.length > 1 ? "Gleichstand an der Spitze" : `${teamName(top[0])} gewinnen!`;
    const log = $("pk-log");
    log.innerHTML = "";
    for (const e of game.log) {
      const li = document.createElement("li");
      li.textContent = `${e.doer}: ${e.amount} ${e.unit} – ${e.ok ? "geschafft" : "nicht geschafft"}`;
      li.className = e.ok ? "good" : "bad";
      log.appendChild(li);
    }
    $("pk-log-card").hidden = !game.log.length;
    showScreen("pk-end", "end");
  }

  async function finishEarly() {
    const ok = await showModal({ title: "Spiel beenden?", text: "Es geht direkt zum Endstand.", ok: "Beenden", cancel: "Weiterspielen" });
    if (ok) finish();
  }

  /* ---------- Events ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("pk-stepper").addEventListener("click", (e) => {
      const b = e.target.closest("[data-dir]");
      if (b) changeCount(Number(b.dataset.dir));
    });
    $("pk-start").addEventListener("click", start);
    $("pk-bid-steps").addEventListener("click", (e) => {
      const b = e.target.closest("[data-d]");
      if (b) changeValue(Number(b.dataset.d));
    });
    $("pk-bid-go").addEventListener("click", bid);
    $("pk-bid-pass").addEventListener("click", pass);
    $("pk-swap").addEventListener("click", swapTask);
    $("pk-clock-start").addEventListener("click", startClock);
    $("pk-deck-right").addEventListener("click", () => deckAnswer(true));
    $("pk-deck-skip").addEventListener("click", () => deckAnswer(false));
    $("pk-deck-new").addEventListener("click", drawCard);
    $("pk-deck-reveal").addEventListener("click", () => { game.stapel.shown = true; render(); });
    $("pk-yes").addEventListener("click", () => judge(true));
    $("pk-no").addEventListener("click", () => judge(false));
    $("pk-next").addEventListener("click", () => { nextTask(false); window.scrollTo(0, 0); });
    $("pk-finish").addEventListener("click", finishEarly);
    $("pk-again").addEventListener("click", openSetup);
  });

  return { openSetup };
})();
