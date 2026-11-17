"use strict";

/* =========================================================
   Online-Modi für „Wer würde am ehesten?“, „Quizwand“ und
   „Mein Partner kann“. server.js bindet diese Datei ein und ruft
   install() auf; jedes Spiel liefert start, view, drop und Handler.
   Bei der Quizwand bewertet online keine KI: eindeutige Treffer
   erkennt der Server, alles andere entscheidet der Host.
   ========================================================= */
const crypto = require("crypto");
const { shuffle, normalize, isCorrectGuess } = require("./shared.js");
const { WWAE_QUESTIONS } = require("./ehesten-fragen.js");
const { QUIZ_KATEGORIEN } = require("./quiz-fragen.js");
const { PARTNER_AUFGABEN } = require("./partner-aufgaben.js");
const { WORD_SOURCES } = require("./words.js");
const { PARTNER_STAPEL_LISTEN } = require("./partner-stapel-listen.js");

// Die Kartenstapel lesen ihre Daten aus globalen Namen (wie im Browser)
global.WORD_SOURCES = WORD_SOURCES;
global.QUIZ_KATEGORIEN = QUIZ_KATEGORIEN;
global.PARTNER_STAPEL_LISTEN = PARTNER_STAPEL_LISTEN;
const { PartnerStapel } = require("./partner-stapel.js");

const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
const gameId = () => crypto.randomBytes(3).toString("hex");

const QZ_VALUES = [100, 200, 300, 400, 500];
const QZ_CATS = 10;
const QZ_BUZZ_LOCK = 1500;
const qzPlayable = (k) => [1, 2, 3, 4, 5].every((s) => k.fragen.some((q) => q.s === s));
const PK_ROUNDS = [6, 8, 10, 12, 16, 20];
const PK_TYPES = ["w", "d", "p"];

const DEFAULTS = {
  ehesten: {},
  quiz: { cats: [] },
  partner: { types: ["w", "d", "p"], rounds: 10, order: [] }
};

function install(ctx) {
  const { handlers, fail, requireHost, broadcastState, lobbies } = ctx;

  const present = (lobby, id) => lobby.players.some((p) => p.id === id);
  const connected = (lobby, id) => lobby.players.some((p) => p.id === id && p.connected);
  const nameIn = (g, id) => g.names[id] || "?";
  const xs = (lobby, game) => {
    lobby.xSettings = lobby.xSettings || {};
    if (!lobby.xSettings[game]) lobby.xSettings[game] = JSON.parse(JSON.stringify(DEFAULTS[game]));
    return lobby.xSettings[game];
  };
  const requireType = (lobby, type, phases) => {
    const g = lobby.game;
    if (!g || g.type !== type || (phases && !phases.includes(g.phase))) fail("Das geht gerade nicht.");
    return g;
  };
  const playersOf = (lobby, g) => g.ids.map((id) => ({ id, name: g.names[id], connected: connected(lobby, id), left: !present(lobby, id) }));

  /* =========================================================
     Wer würde am ehesten? (3–20)
     Alle stimmen gleichzeitig ab: am ehesten und am wenigsten.
     ========================================================= */
  const eh = {
    start(lobby) {
      const used = new Set(lobby.ehUsed || []);
      const all = WWAE_QUESTIONS.map((_, i) => i);
      const deck = [...shuffle(all.filter((i) => !used.has(i))), ...shuffle(all.filter((i) => used.has(i)))];
      lobby.game = {
        type: "ehesten", gameId: gameId(), phase: "vote",
        ids: lobby.players.map((p) => p.id),
        names: Object.fromEntries(lobby.players.map((p) => [p.id, p.name])),
        deck, pos: 0, votes: {}, history: []
      };
    },
    active: (lobby, g) => g.ids.filter((id) => present(lobby, id)),
    check(lobby) {
      const g = lobby.game;
      if (g.phase === "vote" && eh.active(lobby, g).every((id) => g.votes[id])) eh.close(lobby);
    },
    close(lobby) {
      const g = lobby.game;
      const most = {}, least = {};
      for (const v of Object.values(g.votes)) {
        most[v.most] = (most[v.most] || 0) + 1;
        least[v.least] = (least[v.least] || 0) + 1;
      }
      const qi = g.deck[g.pos % g.deck.length];
      g.history.push({ q: qi, most, least, voters: Object.keys(g.votes).length });
      lobby.ehUsed = [...(lobby.ehUsed || []).filter((x) => x !== qi), qi].slice(-Math.floor(WWAE_QUESTIONS.length * 0.7));
      g.phase = "result";
    },
    view(lobby, g, me) {
      const v = {
        type: "ehesten", gameId: g.gameId, phase: g.phase, inGame: g.ids.includes(me.id),
        players: playersOf(lobby, g).map((p) => ({ ...p, voted: !!g.votes[p.id] })),
        number: g.history.length + (g.phase === "vote" ? 1 : 0),
        question: g.phase !== "over" ? WWAE_QUESTIONS[g.deck[g.pos % g.deck.length]] : null,
        myVote: g.votes[me.id] || null
      };
      if (g.phase === "result") v.last = g.history[g.history.length - 1];
      if (g.phase === "over") v.history = g.history.map((h) => ({ ...h, q: WWAE_QUESTIONS[h.q] }));
      return v;
    },
    drop(lobby) { if (lobby.game.phase === "vote") eh.check(lobby); }
  };

  Object.assign(handlers, {
    ehVote(ws, msg, lobby, me) {
      const g = requireType(lobby, "ehesten", ["vote"]);
      if (!g.ids.includes(me.id)) fail("Du spielst in dieser Runde nicht mit.");
      const { most, least } = msg;
      if (!g.ids.includes(most) || !g.ids.includes(least)) fail("Bitte wähle zwei Spieler.");
      if (most === least) fail("Dieselbe Person kann nicht beides sein.");
      g.votes[me.id] = { most, least };
      eh.check(lobby);
      return lobby;
    },
    ehUnvote(ws, msg, lobby, me) {
      const g = requireType(lobby, "ehesten", ["vote"]);
      delete g.votes[me.id];
      return lobby;
    },
    ehForce(ws, msg, lobby, me) {
      requireHost(lobby, me);
      const g = requireType(lobby, "ehesten", ["vote"]);
      if (!Object.keys(g.votes).length) fail("Noch hat niemand abgestimmt.");
      eh.close(lobby);
      return lobby;
    },
    ehNext(ws, msg, lobby, me) {
      requireHost(lobby, me);
      const g = requireType(lobby, "ehesten", ["result", "vote"]);
      g.pos++;
      g.votes = {};
      g.phase = "vote";
      return lobby;
    },
    ehFinish(ws, msg, lobby, me) {
      requireHost(lobby, me);
      const g = requireType(lobby, "ehesten", ["vote", "result"]);
      g.phase = "over";
      return lobby;
    }
  });

  /* =========================================================
     Quizwand (2–10)
     Wer dran ist, wählt ein Feld und antwortet zuerst. Danach
     buzzern die anderen. Der Host entscheidet, was nicht eindeutig ist.
     ========================================================= */
  const qz = {
    start(lobby) {
      const st = xs(lobby, "quiz");
      const pool = QUIZ_KATEGORIEN.filter(qzPlayable).map((k) => k.id);
      let cats = st.cats.filter((id) => pool.includes(id));
      if (cats.length < QZ_CATS) cats = [...cats, ...shuffle(pool.filter((id) => !cats.includes(id)))].slice(0, QZ_CATS);
      const used = new Set(lobby.qzUsed || []);
      const key = (id, q) => `${id}:${q.f.slice(0, 60)}${q.e || ""}${q.r ? q.r.join("") : ""}`;
      const order = shuffle(cats.slice(0, QZ_CATS));
      const pages = [0, 1].map((p) => ({
        cols: order.slice(p * 5, p * 5 + 5).map((id) => {
          const cat = QUIZ_KATEGORIEN.find((k) => k.id === id);
          return {
            id, name: cat.name,
            cells: [1, 2, 3, 4, 5].map((s, row) => {
              const all = cat.fragen.filter((q) => q.s === s);
              const fresh = all.filter((q) => !used.has(key(id, q)));
              const q = pickOne(fresh.length ? fresh : all);
              used.add(key(id, q));
              return { q, value: QZ_VALUES[row] * (p + 1), attempts: [], closed: false };
            })
          };
        })
      }));
      lobby.qzUsed = [...used].slice(-1500);
      const ids = lobby.players.map((p) => p.id);
      lobby.game = {
        type: "quiz", gameId: gameId(), phase: "board",
        ids, names: Object.fromEntries(lobby.players.map((p) => [p.id, p.name])),
        pages, page: 0, turn: Math.floor(Math.random() * ids.length), cur: null
      };
    },
    cell: (g) => g.cur && g.pages[g.page].cols[g.cur.c].cells[g.cur.row],
    solved: (cell) => cell.attempts.some((a) => a.ok === true),
    finished: (cell) => qz.solved(cell) || cell.closed,
    scores(g) {
      const s = Object.fromEntries(g.ids.map((id) => [id, 0]));
      for (const page of g.pages) for (const col of page.cols) for (const cell of col.cells) {
        for (const a of cell.attempts) {
          if (a.ok === true) s[a.p] += cell.value;
          else if (a.ok === false) s[a.p] -= cell.value / 2;
        }
      }
      return s;
    },
    remaining(lobby, g, cell) {
      const tried = new Set(cell.attempts.map((a) => a.p));
      return g.ids.filter((id) => present(lobby, id) && !tried.has(id));
    },
    // Nach einer Antwort: weiter mit Buzzern oder Frage erledigt
    afterAnswer(lobby) {
      const g = lobby.game;
      const cell = qz.cell(g);
      if (qz.solved(cell)) { g.cur.phase = "done"; return; }
      if (!qz.remaining(lobby, g, cell).length) { cell.closed = true; g.cur.phase = "done"; return; }
      g.cur.phase = "buzz";
      g.cur.answering = null;
      g.cur.buzzAt = Date.now() + QZ_BUZZ_LOCK;
    },
    reverse: (g) => g.pages[g.page].cols[g.cur.c].id === "wasistdiefrage",
    // Abstimmen dürfen alle Anwesenden außer dem, der geantwortet hat
    voters: (lobby, g, leaving = null) => g.ids.filter((id) => present(lobby, id) && id !== leaving && id !== g.cur.pending.p),
    // Schwellen: 2 Stimmen dafür reichen, ⅔ dagegen kippen das „Richtig“
    need(n) {
      const no = Math.ceil((n * 2) / 3);
      // „dafür“ reicht auch schon, sobald ⅔ dagegen nicht mehr erreichbar sind
      return { yes: Math.max(1, Math.min(2, n - no + 1)), no };
    },
    evaluate(lobby, leaving = null) {
      const g = lobby.game;
      const voters = qz.voters(lobby, g, leaving);
      const votes = voters.map((id) => g.cur.votes[id]).filter((v) => v !== undefined);
      const yes = votes.filter((v) => v).length, no = votes.length - yes;
      const open = voters.length - votes.length;
      const need = qz.need(voters.length);
      if (!voters.length) return qz.settle(lobby, true);
      if (no >= need.no) return qz.settle(lobby, false);
      // Dafür genug Stimmen – oder ⅔ dagegen sind nicht mehr erreichbar
      if (yes >= need.yes || no + open < need.no) return qz.settle(lobby, true);
      if (!open) return qz.settle(lobby, true);
    },
    settle(lobby, ok) {
      const g = lobby.game;
      const cell = qz.cell(g);
      const p = g.cur.pending;
      cell.attempts.push({ p: p.p, answer: p.answer, ok, voted: true });
      g.cur.pending = null;
      g.cur.lastVote = { ok, votes: g.cur.votes };
      g.cur.votes = null;
      // Abgelehnt: alle kennen die Lösung schon, also kein Klauen mehr
      if (!ok) cell.closed = true;
      g.cur.phase = "done";
    },
    localMatch(answer, q) {
      const targets = [q.a, ...(q.ak || [])];
      const a = normalize(answer);
      if (/^\d+$/.test(a)) return targets.some((t) => normalize(t) === a);
      return isCorrectGuess(answer, targets.join("|"), false);
    },
    view(lobby, g, me) {
      const scores = qz.scores(g);
      const page = g.pages[g.page];
      const v = {
        type: "quiz", gameId: g.gameId, phase: g.phase, inGame: g.ids.includes(me.id), now: Date.now(),
        page: g.page, turn: g.ids[g.turn],
        players: playersOf(lobby, g).map((p) => ({ ...p, score: scores[p.id] })),
        cols: page.cols.map((col) => ({
          name: col.name,
          cells: col.cells.map((cell) => {
            const win = cell.attempts.find((a) => a.ok === true);
            return { value: cell.value, done: qz.finished(cell), winner: win ? win.p : null };
          })
        }))
      };
      if (g.cur) {
        const cell = qz.cell(g);
        const col = page.cols[g.cur.c];
        const done = g.cur.phase === "done";
        const host = lobby.hostId === me.id;
        v.cur = {
          phase: g.cur.phase, c: g.cur.c, row: g.cur.row, cat: col.name, value: cell.value,
          frage: cell.q.f, emoji: cell.q.e || null, rezept: cell.q.r || null, reverse: col.id === "wasistdiefrage",
          answering: g.cur.answering, buzzAt: g.cur.buzzAt || null,
          attempts: cell.attempts.map((a) => ({ p: a.p, answer: a.answer, ok: a.ok, auto: !!a.auto, pass: !!a.pass })),
          pending: g.cur.pending || null,
          remaining: qz.remaining(lobby, g, cell),
          // Die Lösung sieht nur der Host beim Prüfen, alle anderen erst am Ende
          // Die Lösung sieht beim Selbstbewerten nur, wer geantwortet hat; beim Abstimmen alle
          solution: done || g.cur.phase === "vote" || (g.cur.phase === "self" && g.cur.pending && g.cur.pending.p === me.id) ? cell.q.a : null,
          hint: (g.cur.phase === "vote" || (g.cur.phase === "self" && g.cur.pending && g.cur.pending.p === me.id))
            ? [cell.q.ak && cell.q.ak.length ? `Auch richtig: ${cell.q.ak.join(", ")}` : "", cell.q.b || ""].filter(Boolean).join(" · ") : null,
          vote: g.cur.phase === "vote" ? (() => {
            const voters = qz.voters(lobby, g);
            const v = voters.map((id) => g.cur.votes[id]).filter((x) => x !== undefined);
            return { voters, need: qz.need(voters.length), yes: v.filter((x) => x).length, no: v.filter((x) => !x).length, mine: g.cur.votes[me.id] === undefined ? null : g.cur.votes[me.id] };
          })() : null,
          lastVote: g.cur.lastVote ? { ok: g.cur.lastVote.ok, yes: Object.values(g.cur.lastVote.votes).filter((x) => x).length, no: Object.values(g.cur.lastVote.votes).filter((x) => !x).length } : null
        };
      }
      if (g.phase === "over") v.final = true;
      v.left = page.cols.reduce((n, col) => n + col.cells.filter((c) => !qz.finished(c)).length, 0);
      return v;
    },
    drop(lobby, id) {
      const g = lobby.game;
      if (!g.cur || g.cur.phase === "done") return;
      if (g.cur.answering === id && g.cur.phase === "answer") qz.afterAnswer(lobby);
      else if (g.cur.phase === "self" && g.cur.pending.p === id) {
        qz.cell(g).attempts.push({ p: id, answer: g.cur.pending.answer, ok: false });
        g.cur.pending = null;
        qz.afterAnswer(lobby);
      } else if (g.cur.phase === "vote") {
        if (g.cur.pending.p === id) qz.settle(lobby, false);
        else { delete g.cur.votes[id]; qz.evaluate(lobby, id); }
      }
    }
  };

  const qzCur = (lobby, phases) => {
    const g = requireType(lobby, "quiz", ["board"]);
    if (!g.cur || (phases && !phases.includes(g.cur.phase))) fail("Das geht gerade nicht.");
    return g;
  };

  Object.assign(handlers, {
    qzPick(ws, msg, lobby, me) {
      const g = requireType(lobby, "quiz", ["board"]);
      if (g.cur) fail("Gerade läuft eine Frage.");
      if (g.ids[g.turn] !== me.id && lobby.hostId !== me.id) fail("Du bist nicht dran.");
      const c = Number(msg.c), row = Number(msg.row);
      const col = g.pages[g.page].cols[c];
      if (!col || !col.cells[row] || qz.finished(col.cells[row])) fail("Dieses Feld gibt es nicht mehr.");
      g.cur = { c, row, phase: "answer", answering: g.ids[g.turn], pending: null };
      return lobby;
    },
    qzAnswer(ws, msg, lobby, me) {
      const g = qzCur(lobby, ["answer"]);
      if (g.cur.answering !== me.id) fail("Du bist gerade nicht dran.");
      const answer = String(msg.answer || "").trim().replace(/\s+/g, " ").slice(0, 120);
      if (!answer) fail("Bitte gib eine Antwort ein.");
      const cell = qz.cell(g);
      if (!qz.reverse(g) && qz.localMatch(answer, cell.q)) {
        cell.attempts.push({ p: me.id, answer, ok: true, auto: true });
        g.cur.phase = "done";
      } else {
        // Wer geantwortet hat, sieht jetzt die Lösung und bewertet sich selbst
        g.cur.pending = { p: me.id, answer };
        g.cur.phase = "self";
      }
      return lobby;
    },
    // „Weiß ich nicht“ gibt es nur für den, der gewählt hat, und es kostet die halbe Punktzahl
    qzPass(ws, msg, lobby, me) {
      const g = qzCur(lobby, ["answer"]);
      if (g.cur.answering !== me.id) fail("Du bist gerade nicht dran.");
      if (qz.cell(g).attempts.length) fail("Wer gebuzzert hat, muss antworten.");
      qz.cell(g).attempts.push({ p: me.id, answer: "(weiß ich nicht)", ok: false, pass: true });
      qz.afterAnswer(lobby);
      return lobby;
    },
    // Selbstbewertung: „Falsch“ gilt sofort, „Richtig“ geht in die Abstimmung
    qzSelf(ws, msg, lobby, me) {
      const g = qzCur(lobby, ["self"]);
      const p = g.cur.pending;
      if (p.p !== me.id) fail("Das entscheidet, wer geantwortet hat.");
      if (!msg.ok) {
        qz.cell(g).attempts.push({ p: p.p, answer: p.answer, ok: false });
        g.cur.pending = null;
        qz.afterAnswer(lobby);
      } else {
        g.cur.phase = "vote";
        g.cur.votes = {};
        qz.evaluate(lobby);
      }
      return lobby;
    },
    qzVote(ws, msg, lobby, me) {
      const g = qzCur(lobby, ["vote"]);
      if (!qz.voters(lobby, g).includes(me.id)) fail("Du stimmst hier nicht ab.");
      if (g.cur.votes[me.id] !== undefined) fail("Du hast schon abgestimmt.");
      g.cur.votes[me.id] = !!msg.ok;
      qz.evaluate(lobby);
      return lobby;
    },
    // Host: Abstimmung beenden (z. B. wenn jemand nicht mehr reagiert)
    qzVoteEnd(ws, msg, lobby, me) {
      requireHost(lobby, me);
      const g = qzCur(lobby, ["vote"]);
      const v = Object.values(g.cur.votes);
      qz.settle(lobby, !(v.filter((x) => !x).length > v.filter((x) => x).length));
      return lobby;
    },
    qzBuzz(ws, msg, lobby, me) {
      const g = qzCur(lobby, ["buzz"]);
      if (Date.now() < g.cur.buzzAt) fail("Noch nicht – die Buzzer sind gleich scharf.");
      if (!qz.remaining(lobby, g, qz.cell(g)).includes(me.id)) fail("Du hast es schon versucht.");
      g.cur.answering = me.id;
      g.cur.phase = "answer";
      return lobby;
    },
    qzNobody(ws, msg, lobby, me) {
      requireHost(lobby, me);
      const g = qzCur(lobby, ["buzz", "answer"]);
      qz.cell(g).closed = true;
      g.cur.phase = "done";
      return lobby;
    },
    qzBack(ws, msg, lobby, me) {
      const g = qzCur(lobby, ["done"]);
      if (lobby.hostId !== me.id && g.ids[g.turn] !== me.id) fail("Das macht der Host oder wer dran war.");
      g.cur = null;
      // Nächster anwesender Spieler ist dran
      for (let i = 1; i <= g.ids.length; i++) {
        const t = (g.turn + i) % g.ids.length;
        if (present(lobby, g.ids[t])) { g.turn = t; break; }
      }
      return lobby;
    },
    qzNextPage(ws, msg, lobby, me) {
      requireHost(lobby, me);
      const g = requireType(lobby, "quiz", ["board"]);
      if (g.cur) fail("Erst die laufende Frage beenden.");
      for (const col of g.pages[g.page].cols) for (const cell of col.cells) if (!qz.finished(cell)) cell.closed = true;
      if (g.page === 0) g.page = 1;
      else g.phase = "over";
      return lobby;
    },
    qzEnd(ws, msg, lobby, me) {
      requireHost(lobby, me);
      const g = requireType(lobby, "quiz", ["board"]);
      g.cur = null;
      g.phase = "over";
      return lobby;
    },
    qzSettings(ws, msg, lobby, me) {
      requireHost(lobby, me);
      if (lobby.game && lobby.game.phase !== "over") fail("Während des Spiels geht das nicht.");
      const pool = QUIZ_KATEGORIEN.filter(qzPlayable).map((k) => k.id);
      const cats = (Array.isArray(msg.cats) ? msg.cats : []).filter((id, i, a) => pool.includes(id) && a.indexOf(id) === i).slice(0, QZ_CATS);
      xs(lobby, "quiz").cats = cats;
      return lobby;
    }
  });

  /* =========================================================
     Mein Partner kann (2–6 Zweierteams)
     ========================================================= */
  const pk = {
    teamsFrom(lobby) {
      const st = xs(lobby, "partner");
      const ids = lobby.players.map((p) => p.id);
      const order = [...st.order.filter((id) => ids.includes(id)), ...ids.filter((id) => !st.order.includes(id))];
      const teams = [];
      for (let i = 0; i + 1 < order.length; i += 2) teams.push([order[i], order[i + 1]]);
      return teams;
    },
    start(lobby) {
      const st = xs(lobby, "partner");
      if (lobby.players.length % 2) fail("Für Zweierteams braucht ihr eine gerade Spielerzahl.");
      const used = new Set(lobby.pkUsed || []);
      const piles = shuffle(st.types).map((t) => {
        const all = PARTNER_AUFGABEN.filter((a) => a.t === t);
        return [...shuffle(all.filter((a) => !used.has(a.q))), ...shuffle(all.filter((a) => used.has(a.q)))];
      });
      const deck = [];
      for (let i = 0; piles.some((p) => p.length > i); i++) for (const p of piles) if (p[i]) deck.push(p[i]);
      lobby.game = {
        type: "partner", gameId: gameId(), phase: "bid",
        ids: lobby.players.map((p) => p.id),
        names: Object.fromEntries(lobby.players.map((p) => [p.id, p.name])),
        teams: pk.teamsFrom(lobby).map((members, i) => ({ id: i, members, score: 0 })),
        deck, pos: 0, round: 0, rounds: st.rounds, log: []
      };
      pk.startBidding(lobby);
    },
    task: (g) => g.deck[g.pos % g.deck.length],
    bidder: (g, t) => g.teams[t].members[g.round % 2],
    doer: (g, t) => g.teams[t].members[1 - (g.round % 2)],
    teamOf: (g, id) => g.teams.findIndex((t) => t.members.includes(id)),
    startBidding(lobby) {
      const g = lobby.game;
      const n = g.teams.length;
      const s = g.round % n;
      Object.assign(g, { phase: "bid", active: g.teams.map((_, i) => (s + i) % n), turn: 0, high: null, result: null, timer: null, stapel: null });
    },
    openStapel(g) {
      const key = pk.task(g).k;
      if (!key || !PartnerStapel.STAPEL[key]) return;
      const def = PartnerStapel.STAPEL[key];
      g.stapel = { key, art: def.art, zeigen: !!def.zeigen, titel: def.titel || null, state: { seen: new Set() }, right: 0, card: null, list: null, shown: false };
      pk.draw(g);
    },
    draw(g) {
      const s = g.stapel;
      s.shown = false;
      if (s.art === "folge") s.list = PartnerStapel.folge(s.key, g.high.amount);
      else s.card = PartnerStapel.draw(s.key, s.state);
    },
    // Darf dieser Spieler kontrollieren (Karten abhaken, Uhr, Urteil)?
    checker(lobby, g, id) {
      return lobby.hostId === id || (g.high && pk.teamOf(g, id) !== g.high.team && pk.teamOf(g, id) >= 0);
    },
    view(lobby, g, me) {
      const a = pk.task(g);
      const myTeam = pk.teamOf(g, me.id);
      const v = {
        type: "partner", gameId: g.gameId, phase: g.phase, inGame: g.ids.includes(me.id), now: Date.now(),
        round: g.round, rounds: g.rounds,
        task: g.phase !== "over" ? { t: a.t, q: a.q, e: a.e, z: a.z, m: a.m || null, h: a.h || null } : null,
        teams: g.teams.map((t, i) => ({
          id: i, score: t.score, bidder: pk.bidder(g, i), doer: pk.doer(g, i),
          members: t.members.map((id) => ({ id, name: g.names[id], connected: connected(lobby, id) }))
        })),
        myTeam, active: g.active, turn: g.active ? g.active[g.turn] : null, high: g.high, result: g.result,
        timer: g.timer, checker: pk.checker(lobby, g, me.id)
      };
      if (g.stapel && g.phase === "do") {
        const s = g.stapel;
        const doingTeam = myTeam === g.high.team;
        const isDoer = me.id === pk.doer(g, g.high.team);
        // Karten sieht, wer kontrolliert; bei „zeigen“ auch der Partner selbst (ohne Lösung)
        // Bei Erklär- und Darstell-Aufgaben liest der Partner selbst die Karte
        const doerReads = s.zeigen || /Dein Partner (liest|schaut)/.test(a.h || "");
        const seesCard = !doingTeam || (doerReads && isDoer) || (s.art === "einzeln");
        const seesSolution = !doingTeam && (!s.zeigen || s.shown);
        v.stapel = {
          art: s.art, zeigen: s.zeigen, titel: s.titel, right: s.right, shown: s.shown,
          card: seesCard && s.card ? { v: s.card.v, farbe: s.card.farbe || null, gross: !!s.card.gross, l: seesSolution ? s.card.l || null : null } : null,
          list: !doingTeam ? s.list : null,
          hasSolution: !!(s.card && s.card.l)
        };
      }
      if (g.phase === "over") v.log = g.log;
      return v;
    },
    drop(lobby, id) {
      const g = lobby.game;
      if (g.phase !== "bid") return;
      const t = pk.teamOf(g, id);
      if (t < 0 || !g.active.includes(t) || pk.bidder(g, t) !== id) return;
      // Fehlender Bieter passt automatisch
      if (g.active[g.turn] === t && g.high) pk.passTurn(lobby);
    },
    passTurn(lobby) {
      const g = lobby.game;
      g.active.splice(g.turn, 1);
      g.turn %= g.active.length;
      if (g.active.length === 1) {
        lobby.pkUsed = [...(lobby.pkUsed || []).filter((q) => q !== pk.task(g).q), pk.task(g).q].slice(-Math.floor(PARTNER_AUFGABEN.length * 0.7));
        g.phase = "do";
        pk.openStapel(g);
      }
    }
  };

  const pkGame = (lobby, phases) => requireType(lobby, "partner", phases);
  const pkChecker = (lobby, g, me) => { if (!pk.checker(lobby, g, me.id)) fail("Das macht ein anderes Team oder der Host."); };

  Object.assign(handlers, {
    pkBid(ws, msg, lobby, me) {
      const g = pkGame(lobby, ["bid"]);
      const t = g.active[g.turn];
      if (pk.bidder(g, t) !== me.id) fail("Du bist gerade nicht dran.");
      const amount = Math.floor(Number(msg.amount));
      const min = g.high ? g.high.amount + 1 : 1;
      if (!(amount >= min && amount <= 999)) fail(`Das Gebot muss mindestens ${min} sein.`);
      g.high = { team: t, amount };
      g.turn = (g.turn + 1) % g.active.length;
      return lobby;
    },
    pkPass(ws, msg, lobby, me) {
      const g = pkGame(lobby, ["bid"]);
      const t = g.active[g.turn];
      if (pk.bidder(g, t) !== me.id && lobby.hostId !== me.id) fail("Du bist gerade nicht dran.");
      if (!g.high) fail("Das erste Gebot muss jemand abgeben.");
      pk.passTurn(lobby);
      return lobby;
    },
    pkSwap(ws, msg, lobby, me) {
      const g = pkGame(lobby, ["bid"]);
      if (g.high) fail("Es wurde schon geboten.");
      if (pk.bidder(g, g.active[g.turn]) !== me.id && lobby.hostId !== me.id) fail("Das darf nur, wer dran ist, oder der Host.");
      g.pos++;
      pk.startBidding(lobby);
      return lobby;
    },
    pkClock(ws, msg, lobby, me) {
      const g = pkGame(lobby, ["do"]);
      pkChecker(lobby, g, me);
      const a = pk.task(g);
      if (!(a.m === "dauer" || a.z > 0)) fail("Diese Aufgabe hat keine Uhr.");
      g.timer = { startedAt: Date.now(), target: (a.m === "dauer" ? g.high.amount : a.z) * 1000 };
      return lobby;
    },
    pkCard(ws, msg, lobby, me) {
      const g = pkGame(lobby, ["do"]);
      pkChecker(lobby, g, me);
      if (!g.stapel) fail("Diese Aufgabe hat keine Karten.");
      if (msg.reveal) { g.stapel.shown = true; return lobby; }
      if (msg.ok && g.stapel.art === "karten") g.stapel.right++;
      pk.draw(g);
      return lobby;
    },
    pkJudge(ws, msg, lobby, me) {
      const g = pkGame(lobby, ["do"]);
      pkChecker(lobby, g, me);
      const team = g.teams[g.high.team];
      const ok = !!msg.ok;
      team.score += ok ? 2 : -1;
      g.result = ok;
      g.phase = "result";
      g.log.push({ q: pk.task(g).q, doer: g.names[pk.doer(g, g.high.team)], amount: g.high.amount, unit: pk.task(g).e, ok });
      return lobby;
    },
    pkNext(ws, msg, lobby, me) {
      requireHost(lobby, me);
      const g = pkGame(lobby, ["result"]);
      g.round++;
      g.pos++;
      if (g.round >= g.rounds) g.phase = "over";
      else pk.startBidding(lobby);
      return lobby;
    },
    pkEnd(ws, msg, lobby, me) {
      requireHost(lobby, me);
      const g = pkGame(lobby, ["bid", "do", "result"]);
      g.phase = "over";
      return lobby;
    },
    pkSettings(ws, msg, lobby, me) {
      requireHost(lobby, me);
      if (lobby.game && lobby.game.phase !== "over") fail("Während des Spiels geht das nicht.");
      const st = xs(lobby, "partner");
      const s = msg.settings || {};
      if (Array.isArray(s.types)) {
        const types = s.types.filter((t) => PK_TYPES.includes(t));
        if (types.length) st.types = [...new Set(types)];
      }
      if (PK_ROUNDS.includes(Number(s.rounds))) st.rounds = Number(s.rounds);
      if (s.shuffle) st.order = shuffle(lobby.players.map((p) => p.id));
      return lobby;
    }
  });

  return {
    games: {
      ehesten: { min: 3, max: 20, start: eh.start, view: eh.view, drop: eh.drop },
      quiz: { min: 2, max: 10, start: qz.start, view: qz.view, drop: qz.drop },
      partner: { min: 4, max: 12, start: pk.start, view: pk.view, drop: pk.drop }
    },
    // Lobby-Einstellungen, die alle sehen (inkl. der Teams bei Mein Partner kann)
    lobbyView(lobby) {
      const out = {};
      for (const game of Object.keys(DEFAULTS)) out[game] = xs(lobby, game);
      out.partnerTeams = pk.teamsFrom(lobby);
      return out;
    },
    QZ_CATS, PK_ROUNDS
  };
}

module.exports = { install };
