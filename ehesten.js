"use strict";

/* =========================================================
   Wer würde am ehesten? – Pass & Play
   Einer liest die Frage vor, die Gruppe entscheidet, wer es am
   ehesten und wer es am wenigsten tun würde. Am Ende gibt es eine
   Auswertung pro Spieler.
   ========================================================= */
const WWAE = (() => {
  const STORE = "wwae-v1";
  const USED = "wwae-used-v1";
  const MIN = 3;
  const MAX = 20;

  let names = [];
  let game = null; // { players, deck, pos, picks: [{ q, most, least }], most, least, profiles }
  let aiCall = null; // AbortController der laufenden Anfrage an Claude

  // Claude ist nur in der claude.ai-Version erreichbar; anderswo bleibt das null
  const samplePromise = window.claude && typeof window.claude.use === "function"
    ? window.claude.use("sample").catch(() => null)
    : Promise.resolve(null);

  const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  };
  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* egal */ }
  };

  /* ---------- Start ---------- */
  function openSetup() {
    const saved = load(STORE, null);
    // Beim ersten Mal die Namen aus Verräter übernehmen, falls vorhanden
    names = saved && Array.isArray(saved.names) ? saved.names : settings.names.filter((n) => n.trim()).slice();
    while (names.length < MIN) names.push("");
    names = names.slice(0, MAX);
    renderSetup();
    showScreen("wwae-setup", "setup");
  }

  function renderSetup() {
    const list = $("wwae-players");
    list.innerHTML = "";
    names.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.innerHTML = `<span class="num">${i + 1}.</span>`;
      const input = document.createElement("input");
      input.type = "text";
      input.value = name;
      input.placeholder = `Spieler ${i + 1}`;
      input.maxLength = 24;
      input.autocomplete = "off";
      input.autocapitalize = "words";
      input.addEventListener("input", () => { names[i] = input.value; save(STORE, { names }); });
      row.appendChild(input);
      list.appendChild(row);
    });
    $("wwae-count").textContent = names.length;
    $("wwae-error").hidden = true;
    $("wwae-total").textContent = `${WWAE_QUESTIONS.length} Fragen`;
  }

  function changeCount(dir) {
    if (dir > 0 && names.length < MAX) names.push("");
    if (dir < 0 && names.length > MIN) names.pop();
    save(STORE, { names });
    renderSetup();
  }

  function start() {
    const clean = names.map((n) => n.trim());
    const err = (t) => { $("wwae-error").textContent = t; $("wwae-error").hidden = false; };
    if (clean.some((n) => !n)) return err("Bitte gib allen Spielern einen Namen.");
    if (new Set(clean.map(normalize)).size !== clean.length) return err("Jeder Name darf nur einmal vorkommen.");

    // Zuletzt gespielte Fragen kommen ans Ende des Stapels
    const used = new Set(load(USED, []));
    const all = WWAE_QUESTIONS.map((_, i) => i);
    const deck = [...shuffle(all.filter((i) => !used.has(i))), ...shuffle(all.filter((i) => used.has(i)))];
    game = { players: clean, deck, pos: 0, picks: [], most: null, least: null };
    renderGame();
    showScreen("wwae-game", "game");
  }

  /* ---------- Fragen ---------- */
  function renderGame() {
    const q = WWAE_QUESTIONS[game.deck[game.pos % game.deck.length]];
    $("wwae-num").textContent = `Frage ${game.picks.length + 1}`;
    const card = $("wwae-question");
    if (card.dataset.pos !== String(game.pos)) {
      card.dataset.pos = String(game.pos);
      card.textContent = `${q}?`;
      const box = $("wwae-card");
      box.classList.remove("pop");
      void box.offsetWidth;
      box.classList.add("pop");
    }
    chips("wwae-most", "most");
    chips("wwae-least", "least");
    $("wwae-next").disabled = game.most === null || game.least === null;
  }

  function chips(boxId, key) {
    const box = $(boxId);
    box.innerHTML = "";
    game.players.forEach((name, i) => {
      box.appendChild(makeChip(name, game[key] === i, () => {
        game[key] = game[key] === i ? null : i;
        // Dieselbe Person kann nicht beides sein
        const other = key === "most" ? "least" : "most";
        if (game[other] === i) game[other] = null;
        renderGame();
      }));
    });
  }

  function next(skip) {
    const qi = game.deck[game.pos % game.deck.length];
    if (!skip) {
      game.picks.push({ q: qi, most: game.most, least: game.least });
      const used = load(USED, []).filter((x) => x !== qi);
      used.push(qi);
      save(USED, used.slice(-Math.floor(WWAE_QUESTIONS.length * 0.7)));
    }
    game.pos++;
    game.most = null;
    game.least = null;
    if (!skip) game.profiles = null; // neue Antworten → alte Profile passen nicht mehr
    renderGame();
    window.scrollTo(0, 0);
  }

  /* ---------- Auswertung ---------- */
  function finish() {
    renderEnd();
    showScreen("wwae-end", "end");
  }

  const MIN_FOR_AI = 5;

  function renderEnd() {
    const n = game.picks.length;
    $("wwae-end-sub").textContent = n ? `${n} ${n === 1 ? "Frage" : "Fragen"} gespielt` : "Noch keine Frage entschieden";
    renderStats();
    renderProfiles();
    samplePromise.then((sample) => {
      const enough = n >= MIN_FOR_AI;
      $("wwae-ai").hidden = !sample || !!game.profiles;
      $("wwae-ai-missing").hidden = !!sample;
      $("wwae-ai-start").disabled = !enough || !!aiCall;
      if (!aiCall) {
        $("wwae-ai-info").textContent = enough
          ? "Claude wertet eure Antworten aus und schreibt über jeden ein kurzes Profil – ohne Namen. Ratet, wer gemeint ist!"
          : `Spielt mindestens ${MIN_FOR_AI} Fragen, dann kann Claude Profile über euch schreiben. Bisher: ${n}.`;
      }
      // Ohne Profile die Einzelheiten gleich aufklappen
      $("wwae-details").open = !sample || !enough;
    });
  }

  /* ---------- Profile von Claude ---------- */
  function buildPrompt() {
    const lines = game.players.map((name, i) => {
      const most = game.picks.filter((p) => p.most === i).map((p) => WWAE_QUESTIONS[p.q]);
      const least = game.picks.filter((p) => p.least === i).map((p) => WWAE_QUESTIONS[p.q]);
      return `### ${name}\nAm EHESTEN gewählt bei:\n${most.map((q) => `- ${q}`).join("\n") || "- (nie)"}\nAm WENIGSTEN gewählt bei:\n${least.map((q) => `- ${q}`).join("\n") || "- (nie)"}`;
    }).join("\n\n");
    return `Du schreibst die Auswertung für das Partyspiel „Wer würde am ehesten?“. Eine Gruppe von Freunden (ca. 16–25 Jahre) hat gemeinsam entschieden, wer etwas am ehesten und wer es am wenigsten tun würde. Hier ist, bei welchen Fragen jede Person gewählt wurde:

${lines}

Schreib für JEDE Person ein kurzes, lustiges Profil. Die Gruppe soll danach raten, wer gemeint ist.

So soll es sein:
- Werte die Antworten wirklich aus: Erkenne Muster und Widersprüche und zieh daraus Schlüsse über die Person, statt die Fragen nur nachzuerzählen. Aus „würde beim Fußball über den eigenen Fuß stolpern“ wird nicht „schlecht in Fußball“, sondern etwas wie „Koordination im Energiesparmodus“. Kombiniere gern Gegensätze, z. B. „der langsamste, aber stärkste Mensch der Runde“.
- „Am wenigsten“ heißt das Gegenteil: Wer am wenigsten „pünktlich sein“ würde, ist unpünktlich.
- Überwiegend frech und roastig, ruhig mit einer positiven Seite dazwischen – aber nie wirklich verletzend. Keine Witze über Aussehen, Körper, Gewicht, Herkunft, Religion, Sexualität oder Krankheiten.
- Lockere deutsche Jugendsprache, natürlich und nicht übertrieben (ab und zu Wörter wie „lowkey“, „safe“, „Main Character“, „NPC“, „random“, „cringe“, „Vibe“ – nicht in jedem Satz).
- Sprich die Person mit „du“ an. Nenne keinen Namen und verwende keine Pronomen wie er/sie.
- Jeder Text: 2–3 Sätze, höchstens 45 Wörter. Dazu ein Titel: 2–5 Wörter, wie ein Spitzname (z. B. „Chaos mit WLAN-Anschluss“).
- Wurde jemand selten oder nie gewählt, mach daraus etwas Lustiges (z. B. „unauffällig wie ein Geheimagent“).
- Die Profile sollen sich deutlich voneinander unterscheiden, damit man sie zuordnen kann.

Antworte nur mit einem JSON-Array, ein Objekt pro Person in derselben Reihenfolge wie oben:
[{"name": "<Name genau wie oben>", "titel": "…", "text": "…"}]`;
  }

  const AI_ERRORS = {
    not_granted: "Ohne deine Erlaubnis kann Claude keine Profile schreiben.",
    sampling_disabled: "Claude ist für dieses Konto gerade nicht verfügbar.",
    rate_limited: "Gerade zu viele Anfragen – versuch es gleich noch einmal.",
    session_expired: "Bitte melde dich bei claude.ai neu an.",
    refused: "Claude wollte dazu nichts schreiben. Spielt noch ein paar Fragen und versucht es erneut.",
    invalid_json: "Die Antwort war unvollständig. Versuch es noch einmal."
  };
  const HIDE_FOR_GOOD = ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"];

  async function createProfiles(fresh) {
    const sample = await samplePromise;
    if (!sample || aiCall || game.picks.length < MIN_FOR_AI) return;
    aiCall = new AbortController();
    const status = $("wwae-ai-status");
    $("wwae-ai").hidden = false;
    $("wwae-ai-start").disabled = true;
    $("wwae-ai-again").hidden = true;
    $("wwae-ai-stop").hidden = false;
    status.hidden = false;
    status.className = "lu-hint";
    status.textContent = "Claude liest eure Antworten und denkt nach …";
    try {
      const opts = { signal: aiCall.signal, onText: () => { status.textContent = "Claude schreibt die Profile …"; } };
      if (fresh) opts.cache = false; // „Neue Profile“ soll wirklich neu fragen
      const data = await sample.json(buildPrompt(), opts);
      const list = Array.isArray(data) ? data : [];
      const byName = new Map(list.filter((x) => x && typeof x === "object").map((x) => [normalize(String(x.name || "")), x]));
      const profiles = game.players.map((name, i) => {
        const p = byName.get(normalize(name)) || list[i] || {};
        return { player: i, title: String(p.titel || p.title || "Ein Rätsel"), text: String(p.text || "Zu dir fiel selbst Claude nichts ein."), guess: null };
      });
      game.profiles = shuffle(profiles);
      game.revealed = false;
      status.hidden = true;
      $("wwae-ai").hidden = true;
    } catch (e) {
      const code = e && e.code;
      if (code === "cancelled") {
        status.textContent = "Abgebrochen.";
      } else {
        status.className = "lu-hint bad";
        status.textContent = AI_ERRORS[code] || "Das hat gerade nicht geklappt. Versuch es noch einmal.";
        if (HIDE_FOR_GOOD.includes(code)) $("wwae-ai-start").hidden = true;
      }
    } finally {
      aiCall = null;
      $("wwae-ai-stop").hidden = true;
      $("wwae-ai-start").disabled = false;
      renderProfiles();
    }
  }

  function renderProfiles() {
    const wrap = $("wwae-profiles");
    wrap.innerHTML = "";
    const list = game.profiles;
    $("wwae-reveal").hidden = !list || game.revealed;
    $("wwae-ai-again").hidden = !list || !game.revealed;
    $("wwae-score").hidden = !list || !game.revealed;
    if (!list) return;
    list.forEach((p, k) => {
      const card = document.createElement("div");
      card.className = "card wwae-profile";
      if (game.revealed) card.classList.add(p.guess === p.player ? "right" : "wrong");
      card.innerHTML = `
        <span class="role-label">Profil ${k + 1}</span>
        <h2 class="wwae-profile-title"></h2>
        <p class="wwae-profile-text"></p>
        <span class="muted small">${game.revealed ? "Das war:" : "Wer ist das?"}</span>
        <div class="chips wwae-guess"></div>`;
      card.querySelector(".wwae-profile-title").textContent = p.title;
      card.querySelector(".wwae-profile-text").textContent = p.text;
      const chipsBox = card.querySelector(".wwae-guess");
      if (game.revealed) {
        const answer = document.createElement("span");
        answer.className = "wwae-answer";
        answer.textContent = game.players[p.player] + (p.guess === p.player ? " – richtig geraten!" : p.guess === null ? "" : ` (geraten: ${game.players[p.guess]})`);
        chipsBox.appendChild(answer);
      } else {
        game.players.forEach((name, i) => {
          chipsBox.appendChild(makeChip(name, p.guess === i, () => {
            p.guess = p.guess === i ? null : i;
            renderProfiles();
          }));
        });
      }
      wrap.appendChild(card);
    });
    if (game.revealed) {
      const right = list.filter((p) => p.guess === p.player).length;
      $("wwae-score").textContent = `${right} von ${list.length} richtig zugeordnet`;
    }
  }

  function renderStats() {
    const wrap = $("wwae-results");
    wrap.innerHTML = "";
    const stats = game.players.map((name, i) => ({
      name,
      most: game.picks.filter((p) => p.most === i).map((p) => WWAE_QUESTIONS[p.q]),
      least: game.picks.filter((p) => p.least === i).map((p) => WWAE_QUESTIONS[p.q])
    })).sort((a, b) => b.most.length - a.most.length || a.least.length - b.least.length);

    for (const s of stats) {
      const card = document.createElement("div");
      card.className = "card wwae-person";
      const list = (title, items) => items.length
        ? `<div class="wwae-list"><span class="role-label">${title}</span><ul>${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>`
        : "";
      card.innerHTML = `
        <div class="row-between">
          <h2>${escapeHtml(s.name)}</h2>
          <span class="wwae-tally"><span class="pill">${s.most.length}× am ehesten</span><span class="pill">${s.least.length}× am wenigsten</span></span>
        </div>
        ${list("Am ehesten", s.most)}${list("Am wenigsten", s.least)}
        ${!s.most.length && !s.least.length ? '<p class="muted small">Wurde kein einziges Mal gewählt – unauffällig oder verdächtig?</p>' : ""}`;
      wrap.appendChild(card);
    }
  }

  /* ---------- Events ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("wwae-stepper").addEventListener("click", (e) => {
      const b = e.target.closest("[data-dir]");
      if (b) changeCount(Number(b.dataset.dir));
    });
    $("wwae-start").addEventListener("click", start);
    $("wwae-next").addEventListener("click", () => next(false));
    $("wwae-skip").addEventListener("click", () => next(true));
    $("wwae-finish").addEventListener("click", finish);
    $("wwae-continue").addEventListener("click", () => { renderGame(); showScreen("wwae-game", "game"); });
    $("wwae-ai-start").addEventListener("click", () => createProfiles(false));
    $("wwae-ai-again").addEventListener("click", () => { game.profiles = null; createProfiles(true); });
    $("wwae-ai-stop").addEventListener("click", () => aiCall && aiCall.abort());
    $("wwae-reveal").addEventListener("click", () => { game.revealed = true; renderProfiles(); window.scrollTo(0, 0); });
    $("wwae-new").addEventListener("click", openSetup);
  });

  return { openSetup };
})();
