"use strict";
// Baut quiz-fragen.js aus den Dateien in quiz-fragen/*.json.
// Aufruf: node tools/quiz-build.js
const fs = require("fs");
const path = require("path");

// Reihenfolge und Anzeigenamen der Kategorien
const KATEGORIEN = [
  ["mathe", "Mathe"],
  ["chemie", "Chemie"],
  ["physik", "Physik"],
  ["flaggen", "Flaggen"],
  ["hauptstaedte", "Hauptstädte"],
  ["minecraft", "Minecraft-Crafting"],
  ["wasistdiefrage", "Was ist die Frage?"],
  ["musik", "Musik"],
  ["filme", "Filme & Serien"],
  ["tiere", "Tiere"],
  ["fussball", "Fußball"],
  ["geschichte", "Geschichte"],
  ["weltall", "Weltall"],
  ["koerper", "Menschlicher Körper"],
  ["essen", "Essen & Trinken"],
  ["videospiele", "Videospiele"],
  ["sprache", "Wörter & Redewendungen"],
  ["erfindungen", "Erfindungen & Technik"]
];

const dir = path.join(__dirname, "..", "quiz-fragen");
const out = [];
const problems = [];
for (const [id, name] of KATEGORIEN) {
  const file = path.join(dir, id + ".json");
  if (!fs.existsSync(file)) { problems.push(`${id}: Datei fehlt`); continue; }
  let list;
  try { list = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { problems.push(`${id}: kein gültiges JSON (${e.message})`); continue; }
  const seen = new Set();
  const fragen = [];
  for (const q of list) {
    const bad = (why) => problems.push(`${id}: ${why} – ${JSON.stringify(q).slice(0, 80)}`);
    if (!q || ![1, 2, 3, 4, 5].includes(q.stufe)) { bad("stufe fehlt"); continue; }
    if (!q.frage || !q.antwort) { bad("frage/antwort fehlt"); continue; }
    if (q.rezept && (!Array.isArray(q.rezept) || q.rezept.length !== 9)) { bad("rezept braucht 9 Felder"); continue; }
    const key = String(q.frage).trim().toLowerCase() + (q.emoji || "") + (q.rezept ? q.rezept.join(",") : "");
    if (seen.has(key)) { bad("doppelt"); continue; }
    seen.add(key);
    const f = { s: q.stufe, f: String(q.frage).trim(), a: String(q.antwort).trim() };
    if (Array.isArray(q.akzeptiert) && q.akzeptiert.length) f.ak = q.akzeptiert.map(String);
    if (q.bewertung) f.b = String(q.bewertung);
    if (q.emoji) f.e = String(q.emoji);
    if (q.rezept) f.r = q.rezept.map(String);
    fragen.push(f);
  }
  out.push({ id, name, fragen });
}

const total = out.reduce((s, k) => s + k.fragen.length, 0);
const js = `"use strict";
/* Fragen für die Quizwand – erzeugt mit „node tools/quiz-build.js“ aus quiz-fragen/*.json.
   Nicht von Hand ändern, sondern die JSON-Dateien bearbeiten.
   Felder: s = Stufe (1–5), f = Frage, a = Antwort, ak = ebenfalls richtig,
   b = Hinweis zur Bewertung, e = Flaggen-Emoji, r = Crafting-Rezept (3×3). */
const QUIZ_KATEGORIEN = ${JSON.stringify(out)};
if (typeof module !== "undefined") module.exports = { QUIZ_KATEGORIEN };
`;
fs.writeFileSync(path.join(__dirname, "..", "quiz-fragen.js"), js);
for (const k of out) {
  const per = [1, 2, 3, 4, 5].map((s) => k.fragen.filter((q) => q.s === s).length);
  console.log(`${k.name.padEnd(24)} ${String(k.fragen.length).padStart(4)}  (${per.join(" / ")})`);
}
console.log(`Gesamt: ${total} Fragen`);
if (problems.length) console.log("\nProbleme:\n" + problems.join("\n"));
