"use strict";

/* =========================================================
   Geheime Auktion – Regeln
   Wird vom Browser (ein Gerät in der Mitte) und vom Server (online)
   benutzt, damit beide Modi gleich rechnen.
   - Jedes Los gibt es als „echt“ und als „Fälschung“, manche zusätzlich
     als „verkannter Schatz“. Pro Spiel wird ausgelost, welche Version
     drankommt – dasselbe Los kann also mal echt, mal gefälscht sein.
   - Echt: Wert = Schätzpreis ± 15 %. Fälschung: nur Materialwert.
     Verkannter Schatz: viel mehr wert als geschätzt.
   ========================================================= */
const AUK = {
  START_MONEY: 1000,
  STEPS: [5, 10, 20, 50, 100, 200],
  GOING_MS: 4000, // „Zum Ersten, zum Zweiten, zum Dritten“ nach jedem Gebot
  OPEN_MS: 20000, // Zeit bis zum ersten Gebot (Lesen und Überlegen)
  LOT_COUNTS: [6, 8, 10, 12, 15]
};

const aukRound5 = (n) => Math.max(0, Math.round(n / 5) * 5);

function aukShuffle(list, rng) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Wie viele Lose von welcher Art? Bei 10 Losen: 4 echt, 5 gefälscht, 1 Schatz.
function aukMix(count) {
  const treasures = Math.max(1, Math.round(count / 10));
  const fakes = Math.round(count / 2);
  return { treasures, fakes, real: count - treasures - fakes };
}

// Stellt den Katalog für ein Spiel zusammen.
// used: zuletzt gespielte Los-IDs – sie kommen nur dran, wenn sonst zu wenige da sind.
function aukBuildCatalog(pool, count, used = [], rng = Math.random) {
  const recent = new Set(used);
  const order = (list) => [...aukShuffle(list.filter((l) => !recent.has(l.id)), rng), ...aukShuffle(list.filter((l) => recent.has(l.id)), rng)];
  const mix = aukMix(Math.min(count, pool.length));
  const withTreasure = order(pool.filter((l) => l.schatz));
  const treasureLots = withTreasure.slice(0, mix.treasures);
  const taken = new Set(treasureLots.map((l) => l.id));
  const rest = order(pool.filter((l) => !taken.has(l.id))).slice(0, mix.fakes + mix.real);
  const kinds = aukShuffle([...Array(mix.fakes).fill("faelschung"), ...Array(rest.length - mix.fakes).fill("echt")], rng);

  const lots = [
    ...treasureLots.map((l) => ({ l, kind: "schatz" })),
    ...rest.map((l, i) => ({ l, kind: kinds[i] }))
  ].map(({ l, kind }) => {
    const v = l[kind];
    const estimate = kind === "schatz" ? v.estimate : l.estimate;
    const value = kind === "echt" ? aukRound5(l.estimate * (0.85 + 0.3 * rng())) : v.value;
    return { id: l.id, category: l.category, title: l.title, desc: v.desc, estimate, kind, value, explain: v.explain || "" };
  });
  return aukShuffle(lots, rng);
}

// Was alle sehen dürfen, solange nicht aufgedeckt ist
function aukPublicLot(lot) {
  return { id: lot.id, category: lot.category, title: lot.title, desc: lot.desc, estimate: lot.estimate };
}

// Endstand: Restgeld + echter Wert der ersteigerten Lose
function aukStandings(players, lots) {
  return players.map((p) => {
    const won = lots.filter((l) => l.buyer === p.id);
    const worth = won.reduce((s, l) => s + l.value, 0);
    return { id: p.id, name: p.name, money: p.money, worth, total: p.money + worth, count: won.length };
  }).sort((a, b) => b.total - a.total);
}

const AUK_KIND_LABEL = { echt: "Echt", faelschung: "Fälschung", schatz: "Verkannter Schatz" };

if (typeof module !== "undefined") {
  module.exports = { AUK, AUK_KIND_LABEL, aukMix, aukBuildCatalog, aukPublicLot, aukStandings, aukRound5 };
}
