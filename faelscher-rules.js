"use strict";

/* =========================================================
   Fälscher – Regeln
   Wird vom Browser (Pass & Play) und vom Server (online) benutzt.
   - Antworten werden nur zusammengelegt, wenn sie praktisch gleich
     geschrieben sind (normalisiert, Levenshtein ≤ 2, unter 15 Zeichen ≤ 1).
   - Wertung: +2 für das Wählen der offiziellen Antwort, +2 für eine mit
     der offiziellen zusammengelegte Antwort, +1 pro Stimme auf die eigene
     Antwort, +1 Bonus für jeden Autor in der Liste, wenn niemand die
     offizielle Antwort gewählt hat.
   ========================================================= */
const FZ = { MIN: 3, MAX: 8, MAX_TEXT: 200, COUNTS: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], DEFAULT_COUNT: 8 };

// Kleinbuchstaben, ohne Satzzeichen, Leerzeichen zusammengefasst
function fzNorm(t) {
  return String(t || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

function fzLevenshtein(a, b) {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

function fzSame(a, b) {
  const x = fzNorm(a);
  const y = fzNorm(b);
  if (!x || !y) return false;
  const tol = Math.min(x.length, y.length) < 15 ? 1 : 2;
  return Math.abs(x.length - y.length) <= tol && fzLevenshtein(x, y) <= tol;
}

function fzShuffle(list, rng) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const fzKey = (rng) => Math.floor(rng() * 0xffffffff).toString(36) + Math.floor(rng() * 0xffffff).toString(36);

// Baut die Antwortliste einer Runde.
// answers: { spielerId: text } – Reihenfolge = Spielerreihenfolge
// Ergebnis: items (gemischt, eines davon official), merged (mit der offiziellen
// zusammengelegte Spieler) und voters (wer abstimmt).
function fzBuildRound(official, answers, rng = Math.random) {
  const ids = Object.keys(answers);
  const merged = ids.filter((id) => fzSame(answers[id], official));
  const rest = ids.filter((id) => !merged.includes(id));
  // Gruppen gleicher Antworten (transitiv)
  const groups = [];
  for (const id of rest) {
    const g = groups.find((grp) => grp.some((other) => fzSame(answers[other], answers[id])));
    if (g) g.push(id);
    else groups.push([id]);
  }
  const items = [
    { key: fzKey(rng), text: official, official: true, authors: [] },
    ...groups.map((grp) => ({ key: fzKey(rng), text: answers[grp[0]], official: false, authors: grp }))
  ];
  return { items: fzShuffle(items, rng), merged, voters: rest };
}

// Was ein Spieler wählen darf: alles außer Antworten, an denen er beteiligt ist
const fzChoices = (round, id) => round.items.filter((it) => !it.authors.includes(id));

// Punkte einer Runde. votes: { spielerId: itemKey }
function fzScore(round, votes, playerIds) {
  const points = Object.fromEntries(playerIds.map((id) => [id, 0]));
  const counts = Object.fromEntries(round.items.map((it) => [it.key, 0]));
  for (const id of round.merged) points[id] += 2;
  for (const [voter, key] of Object.entries(votes)) {
    const it = round.items.find((x) => x.key === key);
    if (!it) continue;
    counts[key]++;
    if (it.official) points[voter] += 2;
    else for (const a of it.authors) points[a] += 1;
  }
  const official = round.items.find((it) => it.official);
  const noneFound = round.voters.length > 0 && counts[official.key] === 0;
  if (noneFound) {
    for (const it of round.items) if (!it.official) for (const a of it.authors) points[a] += 1;
  }
  // Beste Fälschung: Spieler-Antwort mit den meisten Stimmen
  let best = null;
  for (const it of round.items) {
    if (!it.official && counts[it.key] > 0 && (!best || counts[it.key] > counts[best.key])) best = it;
  }
  return { points, counts, noneFound, best: best ? { text: best.text, authors: best.authors, votes: counts[best.key] } : null };
}

// Rangliste mit geteilten Plätzen
function fzRanking(players, totals) {
  const sorted = players.slice().sort((a, b) => totals[b.id] - totals[a.id]);
  let place = 0;
  let prev = null;
  return sorted.map((p, i) => {
    if (totals[p.id] !== prev) place = i + 1;
    prev = totals[p.id];
    return { ...p, total: totals[p.id], place };
  });
}

// Fragen für ein Spiel: zufällig, zuletzt gespielte erst am Ende
function fzPickQuestions(pool, count, used = [], rng = Math.random) {
  const recent = new Set(used);
  const fresh = fzShuffle(pool.filter((q) => !recent.has(q.id)), rng);
  const old = fzShuffle(pool.filter((q) => recent.has(q.id)), rng);
  return [...fresh, ...old].slice(0, count);
}

if (typeof module !== "undefined") {
  module.exports = { FZ, fzNorm, fzSame, fzBuildRound, fzChoices, fzScore, fzRanking, fzPickQuestions };
}
