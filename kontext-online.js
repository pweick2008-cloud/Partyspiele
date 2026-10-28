"use strict";

/* =========================================================
   Kontextlos – Online (3 bis 12 Spieler)
   Zeigt an, was der Server schickt: Antworten, Verdrehen, Enthüllen,
   Abstimmen und Punkte. Die Beiträge sehen aus wie Ausschnitte aus
   sozialen Netzwerken.
   ========================================================= */
const KXOnline = (() => {
  const MODES = [
    ["video", "Videos", "Deine Antwort wird zum Kommentar unter einem Video – ein anderer erfindet den Videotitel."],
    ["kommentar", "Kommentare", "Deine Antwort wird zur Antwort auf einen Beitrag – ein anderer erfindet den Beitrag."],
    ["frage", "Fragen", "Deine Antwort bleibt eine Antwort – ein anderer erfindet eine neue Frage dazu."],
    ["bild", "Bilder", "Du wählst ein Bild zum Posten – ein anderer schreibt die Bildunterschrift."]
  ];
  // Was der Verdreher schreibt
  const TWIST = {
    video: { intro: (n) => `${n} hat das unter ein Video kommentiert. Wie heißt das Video?`, label: "Videotitel", placeholder: "Titel des Videos …" },
    kommentar: { intro: (n) => `${n} hat das als Antwort auf einen Beitrag geschrieben. Was stand im Beitrag?`, label: "Der Beitrag", placeholder: "Was wurde gepostet?" },
    frage: { intro: (n) => `Das war die Antwort von ${n}. Wie lautete die Frage?`, label: "Die Frage", placeholder: "Deine Frage …" },
    bild: { intro: (n) => `${n} hat dieses Bild gepostet. Schreib die Bildunterschrift dazu.`, label: "Bildunterschrift", placeholder: "Was schreibt sie oder er dazu?" }
  };
  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const ICON_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

  let state = null;
  let fieldKey = null; // für welche Aufgabe das Textfeld zuletzt befüllt wurde
  let pickedImage = null;

  const g = () => state.game;
  const isHost = () => Online.isHost();
  const player = (id) => g().players.find((p) => p.id === id) || { name: "?" };
  const nameOf = (id) => player(id).name;
  const me = () => player(state.you);

  function render(s) {
    state = s;
    const phase = s.game.phase;
    if (phase === "write") { renderWrite(); return "kx-write"; }
    if (phase === "twist") { renderTwist(); return "kx-twist"; }
    if (phase === "reveal") { renderReveal(); return "kx-reveal"; }
    if (phase === "vote") { renderVote(); return "kx-vote"; }
    renderResults();
    return "kx-results";
  }

  /* ---------- Lobby-Einstellungen ---------- */
  function renderLobbySettings(s) {
    state = s;
    const host = isHost();
    const st = s.kxSettings;
    $("kx-host-pill").textContent = host ? "Du bist Host" : "Nur der Host kann ändern";
    const box = $("kx-modes");
    renderMultiChips(box, MODES.map(([id, name]) => ({ id, name })), st.modes, "Art", host ? (modes) => send({ modes }) : null);
    box.classList.toggle("static", !host);
    $("kx-modes-info").innerHTML = MODES.filter(([id]) => st.modes.includes(id))
      .map(([, name, text]) => `<strong>${name}:</strong> ${escapeHtml(text)}`).join("<br>");
    $("kx-rounds").textContent = st.rounds;
    $("kx-rounds-stepper").classList.toggle("disabled", !host);
  }

  function send(settings) {
    Online.send({ type: "kxSettings", settings });
  }

  /* ---------- Beiträge im Stil sozialer Netzwerke ---------- */
  // Kleine, feste Zufallszahlen je Beitrag, damit Aufrufe & Likes echt wirken
  function seed(item) {
    let h = 7;
    for (const c of item.mode + (item.text || item.image || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
  }
  const avatar = (name, cls = "") => `<span class="avatar kx-av ${cls}">${escapeHtml((name || "?").charAt(0).toUpperCase())}</span>`;
  const slot = (text, placeholder) => text
    ? escapeHtml(text)
    : `<span class="kx-slot">${escapeHtml(placeholder || "…")}</span>`;

  // item: { idx, mode, authorId, text, image, twist }
  function postHtml(item, placeholder) {
    const author = nameOf(item.authorId);
    const h = seed(item);
    if (item.mode === "video") {
      const views = ((h % 900) / 10 + 1).toFixed(1).replace(".", ",");
      const mins = 1 + (h % 14);
      return `<article class="kx-post kx-video">
        <div class="kx-player">${ICON_PLAY}<span class="kx-dur">${mins}:${String(h % 60).padStart(2, "0")}</span></div>
        <h3 class="kx-vtitle">${slot(item.twist, placeholder)}</h3>
        <p class="kx-meta">${views} Tsd. Aufrufe · vor ${1 + (h % 6)} Tagen</p>
        <div class="kx-comments">
          <span class="kx-label">Kommentare</span>
          <div class="kx-comment">${avatar(author)}<div><b>${escapeHtml(author)}</b><p><span class="kx-own">${escapeHtml(item.text)}</span></p></div></div>
        </div>
      </article>`;
    }
    if (item.mode === "kommentar") {
      return `<article class="kx-post kx-thread">
        <div class="kx-head">${avatar("?", "anon")}<b>jemand_${100 + (h % 900)}</b><span class="kx-time">· ${1 + (h % 11)} Std.</span></div>
        <p class="kx-body">${slot(item.twist, placeholder)}</p>
        <div class="kx-reply">${avatar(author)}<div><b>${escapeHtml(author)}</b><p><span class="kx-own">${escapeHtml(item.text)}</span></p></div></div>
      </article>`;
    }
    if (item.mode === "frage") {
      return `<article class="kx-post kx-forum">
        <span class="kx-label">Frage · ${3 + (h % 40)} Antworten</span>
        <h3 class="kx-q">${slot(item.twist, placeholder)}</h3>
        <div class="kx-answer"><span class="kx-label">Beste Antwort von ${escapeHtml(author)}</span><p><span class="kx-own">${escapeHtml(item.text)}</span></p></div>
      </article>`;
    }
    const likes = 12 + (h % 480);
    return `<article class="kx-post kx-photo">
      <div class="kx-head">${avatar(author)}<b>${escapeHtml(author)}</b></div>
      <div class="kx-frame">${kxImageHtml(item.image)}</div>
      <div class="kx-likes">${ICON_HEART}<span>${likes} Mal gefällt das</span></div>
      <p class="kx-caption"><b>${escapeHtml(author)}</b> ${slot(item.twist, placeholder)}</p>
    </article>`;
  }

  function playerList(listId, countId, labels) {
    const list = $(listId);
    list.innerHTML = "";
    const relevant = g().players.filter((p) => !p.left && p.done !== null);
    for (const p of g().players.filter((x) => !x.left)) {
      const li = document.createElement("li");
      li.className = "lobby-player" + (p.connected ? "" : " offline");
      const badge = p.done === null ? `<span class="badge">${labels.idle}</span>`
        : `<span class="badge${p.done ? " win" : ""}">${p.done ? labels.done : labels.busy}</span>`;
      li.innerHTML = `<span class="avatar"></span><span class="profile-name"></span>${badge}`;
      li.querySelector(".avatar").textContent = p.name.charAt(0).toUpperCase();
      li.querySelector(".profile-name").textContent = p.name + (p.id === state.you ? " (Du)" : "");
      list.appendChild(li);
    }
    $(countId).textContent = `${relevant.filter((p) => p.done).length}/${relevant.length}`;
  }

  const roundText = () => `Runde ${g().round} von ${g().rounds}`;

  /* ---------- 1. Antworten ---------- */
  function renderWrite() {
    const t = g().task;
    $("kx-write-sub").textContent = `${roundText()} · Antworten`;
    playerList("kx-write-list", "kx-write-count", { done: "fertig", busy: "schreibt …", idle: "–" });
    $("kx-write-force").hidden = !isHost();
    if (!t) {
      $("kx-write-form").hidden = true;
      $("kx-write-sent").hidden = true;
      return;
    }
    const sent = t.mode === "bild" ? !!t.image : !!t.answer;
    const key = `${g().round}|${t.prompt}`;
    $("kx-prompt").textContent = t.prompt;
    const isImage = t.mode === "bild";
    $("kx-answer").hidden = isImage;
    $("kx-images").hidden = !isImage;
    $("kx-write-hint").textContent = isImage
      ? "Tippe ein Bild an und schick es ab."
      : "Antworte ganz normal. Was später daraus wird, weißt du noch nicht.";
    if (key !== fieldKey) {
      fieldKey = key;
      $("kx-answer").value = t.answer || "";
      pickedImage = t.image || null;
    }
    if (isImage) renderImageChoices(t.images);
    $("kx-write-form").hidden = sent;
    $("kx-write-sent").hidden = !sent;
    if (sent) {
      $("kx-write-mine").innerHTML = isImage
        ? `<div class="kx-frame small">${kxImageHtml(t.image)}</div>`
        : `<p class="kx-mine">„${escapeHtml(t.answer)}“</p>`;
    }
    updateWriteButton();
  }

  function renderImageChoices(images) {
    const box = $("kx-images");
    box.innerHTML = "";
    for (const id of images) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "kx-choice" + (pickedImage === id ? " selected" : "");
      b.innerHTML = kxThumbHtml(id);
      b.setAttribute("aria-label", "Bild auswählen");
      b.addEventListener("click", () => {
        pickedImage = id;
        renderImageChoices(images);
        updateWriteButton();
      });
      box.appendChild(b);
    }
  }

  function updateWriteButton() {
    const t = g().task;
    if (!t) return;
    $("kx-write-send").disabled = t.mode === "bild" ? !pickedImage : $("kx-answer").value.trim().length < 2;
  }

  /* ---------- 2. Verdrehen ---------- */
  function renderTwist() {
    const t = g().twistTask;
    $("kx-twist-sub").textContent = `${roundText()} · Verdrehen`;
    playerList("kx-twist-list", "kx-twist-count", { done: "fertig", busy: "verdreht …", idle: "wartet" });
    $("kx-twist-force").hidden = !isHost();
    $("kx-twist-box").hidden = !t;
    $("kx-twist-idle").hidden = !!t;
    if (!t) return;
    const author = nameOf(t.authorId);
    const cfg = TWIST[t.mode];
    const key = `${g().round}|twist|${t.authorId}`;
    if (key !== fieldKey) {
      fieldKey = key;
      $("kx-twist-input").value = t.twist || "";
    }
    $("kx-twist-intro").textContent = cfg.intro(author);
    $("kx-twist-label").textContent = cfg.label;
    $("kx-twist-input").placeholder = cfg.placeholder;
    $("kx-twist-victim").textContent = author;
    $("kx-twist-form").hidden = !!t.twist;
    $("kx-twist-sent").hidden = !t.twist;
    updateTwistPreview();
  }

  function updateTwistPreview() {
    const t = g().twistTask;
    if (!t) return;
    const text = t.twist || $("kx-twist-input").value.trim();
    $("kx-twist-preview").innerHTML = postHtml({ ...t, idx: 0, twist: text }, TWIST[t.mode].label + " …");
    $("kx-twist-send").disabled = $("kx-twist-input").value.trim().length < 2;
  }

  /* ---------- 3. Enthüllen ---------- */
  // Wessen Aussage ist das? Groß über dem Beitrag
  function authorHtml(item) {
    const author = nameOf(item.authorId);
    const what = { video: "Der markierte Kommentar ist von", kommentar: "Die markierte Antwort ist von", frage: "Die markierte Antwort ist von", bild: "Das Bild hat gepostet:" }[item.mode];
    return `${avatar(author)}<span>${what} <strong>${escapeHtml(author)}</strong></span>`;
  }

  function renderReveal() {
    const game = g();
    const item = game.items[game.revealIndex];
    $("kx-reveal-sub").textContent = `${roundText()} · Beitrag ${game.revealIndex + 1} von ${game.itemCount}`;
    const stage = $("kx-reveal-post");
    if (stage.dataset.key !== `${game.round}|${game.revealIndex}`) {
      stage.dataset.key = `${game.round}|${game.revealIndex}`;
      stage.innerHTML = postHtml(item);
      stage.classList.remove("pop");
      void stage.offsetWidth;
      stage.classList.add("pop");
    }
    $("kx-reveal-author").innerHTML = authorHtml(item);
    const last = game.revealIndex >= game.itemCount - 1;
    $("kx-reveal-next").hidden = !isHost();
    $("kx-reveal-next").textContent = last ? "Zur Abstimmung" : "Nächster Beitrag";
    $("kx-reveal-wait").hidden = isHost();
  }

  /* ---------- 4. Abstimmen ---------- */
  function renderVote() {
    const game = g();
    $("kx-vote-sub").textContent = `${roundText()} · Welcher Beitrag ist am schlimmsten?`;
    $("kx-vote-hint").textContent = !game.canVote
      ? "Hier gibt es keinen fremden Beitrag, für den du stimmen kannst."
      : game.myVote === null
        ? "Tippe auf den Beitrag, bei dem es am übelsten aussieht. Deinen eigenen kannst du nicht wählen."
        : "Stimme abgegeben. Du kannst sie noch ändern, bis alle abgestimmt haben.";
    const list = $("kx-vote-list");
    list.innerHTML = "";
    for (const item of game.items) {
      const wrap = document.createElement("div");
      wrap.className = "kx-vote-item" + (game.myVote === item.idx ? " selected" : "") + (item.mine ? " mine" : "");
      wrap.innerHTML = postHtml(item);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn " + (game.myVote === item.idx ? "primary" : "ghost");
      b.textContent = item.mine ? "Dein Beitrag" : game.myVote === item.idx ? "Deine Stimme" : "Das ist am schlimmsten";
      b.disabled = item.mine || !game.canVote;
      if (!item.mine && game.canVote) b.addEventListener("click", () => Online.send({ type: "kxVote", item: item.idx }));
      wrap.appendChild(b);
      list.appendChild(wrap);
    }
    playerList("kx-vote-players", "kx-vote-count", { done: "abgestimmt", busy: "überlegt …", idle: "–" });
    $("kx-vote-force").hidden = !isHost();
  }

  /* ---------- 5. Ergebnis ---------- */
  function renderResults() {
    const game = g();
    const over = game.phase === "over";
    const host = isHost();
    $("kx-results-title").textContent = over ? "Endstand" : "Ergebnis";
    $("kx-results-sub").textContent = over
      ? `Nach ${game.rounds} ${game.rounds === 1 ? "Runde" : "Runden"}`
      : `${roundText()} · Wer hat was verdreht?`;

    const list = $("kx-results-list");
    list.innerHTML = "";
    const items = game.items.slice().sort((a, b) => b.votes - a.votes);
    if (!items.length) list.innerHTML = '<p class="muted center">In dieser Runde ist kein Beitrag zustande gekommen.</p>';
    for (const item of items) {
      const wrap = document.createElement("div");
      wrap.className = "kx-vote-item" + (item.winner ? " winner" : "");
      wrap.innerHTML = postHtml(item) + `
        <div class="kx-result-row">
          <span>verdreht von <strong>${escapeHtml(nameOf(item.twisterId))}</strong></span>
          <span class="kx-result-pts">${item.votes} ${item.votes === 1 ? "Stimme" : "Stimmen"} · +${item.points}</span>
        </div>`;
      list.appendChild(wrap);
    }

    const ranked = game.players.slice().sort((a, b) => b.total - a.total);
    const rank = $("kx-ranking");
    rank.innerHTML = "";
    let place = 0;
    let prev = null;
    ranked.forEach((p, i) => {
      if (p.total !== prev) place = i + 1;
      prev = p.total;
      const li = document.createElement("li");
      li.className = "slf-rank" + (p.id === state.you ? " me" : "") + (place === 1 ? " first" : "");
      li.innerHTML = `<span class="slf-place">${place}.</span><span class="slf-rank-name"></span><span class="slf-gain muted small"></span><span class="slf-total">${p.total}</span>`;
      li.querySelector(".slf-rank-name").textContent = p.name + (p.id === state.you ? " (Du)" : "");
      li.querySelector(".slf-gain").textContent = `+${(game.roundPoints || {})[p.id] || 0}`;
      rank.appendChild(li);
    });

    $("kx-next").hidden = !host || over;
    $("kx-again").hidden = !host || !over;
    $("kx-to-lobby").hidden = !host || !over;
    $("kx-results-wait").hidden = host;
  }

  /* ---------- Events ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("kx-rounds-stepper").addEventListener("click", (e) => {
      const b = e.target.closest("[data-dir]");
      if (!b || !isHost()) return;
      send({ rounds: Math.min(10, Math.max(1, state.kxSettings.rounds + Number(b.dataset.dir))) });
    });

    $("kx-answer").addEventListener("input", updateWriteButton);
    $("kx-write-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const t = g().task;
      if (!t) return;
      if (t.mode === "bild") {
        if (pickedImage) Online.send({ type: "kxAnswer", image: pickedImage });
      } else {
        const text = $("kx-answer").value.trim();
        if (text.length >= 2) Online.send({ type: "kxAnswer", text });
      }
    });
    // Das Textfeld behält beim Ändern die bisherige Antwort
    $("kx-write-edit").addEventListener("click", () => Online.send({ type: "kxUnanswer" }));

    $("kx-twist-input").addEventListener("input", updateTwistPreview);
    $("kx-twist-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = $("kx-twist-input").value.trim();
      if (text.length >= 2) Online.send({ type: "kxTwist", text });
    });
    $("kx-twist-edit").addEventListener("click", () => Online.send({ type: "kxUntwist" }));

    const force = (title, text) => () => Online.confirmHost(title, text, "kxForce");
    $("kx-write-force").addEventListener("click", force("Nicht länger warten?", "Wer noch nicht geantwortet hat, ist in dieser Runde nicht dabei."));
    $("kx-twist-force").addEventListener("click", force("Nicht länger warten?", "Beiträge, die noch nicht verdreht sind, fallen in dieser Runde weg."));
    $("kx-vote-force").addEventListener("click", force("Abstimmung beenden?", "Es zählen nur die Stimmen, die schon abgegeben sind."));
    $("kx-reveal-next").addEventListener("click", () => Online.send({ type: "kxNext" }));
    $("kx-next").addEventListener("click", () => Online.send({ type: "kxNext" }));
    $("kx-again").addEventListener("click", () => Online.send({ type: "start" }));
    $("kx-to-lobby").addEventListener("click", () => Online.send({ type: "endGame" }));
    document.querySelectorAll(".kx-leave").forEach((b) => b.addEventListener("click", () => Online.leaveLobby()));
  });

  return { render, renderLobbySettings };
})();
