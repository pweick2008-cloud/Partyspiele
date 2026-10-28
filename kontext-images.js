"use strict";

/* =========================================================
   Kontextlos – Bilder zum Posten
   Die Fotos liegen als JPG im Ordner kontext-bilder/ (höchstens
   900 px Kantenlänge). Neue Bilder: Datei dort ablegen und den
   Namen (ohne .jpg) hier eintragen.
   ========================================================= */
const KX_IMAGE_IDS = [
  "adler", "alkohol", "basketball", "bergtour", "bibliothek", "bison", "bmw", "dusche", "esel",
  "essen", "explosion", "feuer", "flagge-deutschland", "flagge-israel", "flagge-tuerkei",
  "flagge-usa", "flugzeug", "flutlicht", "fuesse", "fussball", "g-klasse", "gaming-zimmer", "garten",
  "geschenk", "gorilla", "hochzeit", "inselvilla", "kino", "klassenzimmer", "krankenhausflur",
  "kueche", "leseecke", "loewe", "motorrad", "padel", "parfum", "pumuckl", "rucksack", "sauna",
  "schulbank", "schulflur", "sportplatz", "strand", "unterricht", "venus", "weisses-haus", "wodka",
  "zuckerhut"
];

const kxImageUrl = (id) => `kontext-bilder/${encodeURIComponent(id)}.jpg`;

// Bild im Beitrag: ganz sichtbar, Rand mit unscharfer Kopie aufgefüllt
function kxImageHtml(id) {
  const url = kxImageUrl(id);
  return `<span class="kx-photo-box" style="--kx-bg: url('${url}')"><img class="kx-img" src="${url}" alt="" loading="lazy" decoding="async"></span>`;
}

// Vorschaubild zur Auswahl: quadratisch zugeschnitten
function kxThumbHtml(id) {
  return `<img class="kx-thumb" src="${kxImageUrl(id)}" alt="" loading="lazy" decoding="async">`;
}

if (typeof module !== "undefined") module.exports = { KX_IMAGE_IDS };
