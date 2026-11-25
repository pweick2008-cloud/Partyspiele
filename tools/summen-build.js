"use strict";
// Baut summen-songs.js aus summen-songs/<genre>.json. Aufruf: node tools/summen-build.js
const fs = require("fs");
const path = require("path");

// Reihenfolge und Anzeigenamen der Genres
const GENRES = [
  ["pop-aktuell", "Pop aktuell"],
  ["pop-2000er", "Pop 2000er"],
  ["deutschpop", "Deutschpop"],
  ["deutschrap", "Deutschrap"],
  ["rap-international", "Rap international"],
  ["rock", "Rock"],
  ["oldies", "Oldies (60er/70er)"],
  ["80er", "80er"],
  ["90er", "90er"],
  ["dance", "Dance & EDM"],
  ["schlager", "Schlager & Party"],
  ["latin", "Latin"],
  ["kpop", "K-Pop"],
  ["disney", "Disney & Musicals"],
  ["filmmusik", "Film & Serien"],
  ["kinderlieder", "Kinderlieder"]
];

const norm = (s) => String(s).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
  .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\(.*?\)/g, "").replace(/[^a-z0-9]/g, "");
const dir = path.join(__dirname, "..", "summen-songs");
const seen = new Map(); // gleicher Song in zwei Genres → nur im ersten
const out = [];
const report = [];
for (const [id, name] of GENRES) {
  const file = path.join(dir, id + ".json");
  if (!fs.existsSync(file)) { report.push(`${name.padEnd(20)} fehlt`); continue; }
  const list = JSON.parse(fs.readFileSync(file, "utf8"));
  const songs = [];
  let dup = 0;
  for (const s of list) {
    const t = String(s.t || "").trim(), a = String(s.a || "").trim();
    if (!t || !a) continue;
    // Stabile ID aus Titel (+ Interpret), damit der Verlauf auch nach Änderungen passt
    const key = norm(t) + "-" + norm(a);
    if (seen.has(key)) { dup++; continue; }
    seen.set(key, id);
    songs.push({ id: key.slice(0, 40), t, a });
  }
  out.push({ id, name, songs });
  report.push(`${name.padEnd(20)} ${String(songs.length).padStart(4)}${dup ? `  (${dup} doppelt, übersprungen)` : ""}`);
}
const total = out.reduce((n, g) => n + g.songs.length, 0);
fs.writeFileSync(path.join(__dirname, "..", "summen-songs.js"), `"use strict";
/* Songs für „Summ mal!“ – erzeugt mit „node tools/summen-build.js“ aus summen-songs/*.json.
   Nicht von Hand ändern, sondern die JSON-Dateien bearbeiten. t = Titel, a = Interpret. */
const SUMMEN_GENRES = ${JSON.stringify(out)};
if (typeof module !== "undefined") module.exports = { SUMMEN_GENRES };
`);
console.log(report.join("\n") + `\nGesamt: ${total} Songs`);
