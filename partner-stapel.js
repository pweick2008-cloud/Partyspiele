"use strict";

/* =========================================================
   Mein Partner kann – Kartenstapel
   Für Aufgaben, bei denen ein anderes Team etwas vorliest oder abfragt,
   liefert die App die Karten: Vorlage (v) und Lösung (l) zum Abhaken.
   Arten:
     karten  – eine Karte nach der anderen, „Richtig“ zählt mit
     einzeln – eine Vorgabe für die ganze Aufgabe (Buchstabe, Thema …)
     folge   – so viele Elemente auf einmal, wie geboten wurden (Merken)
   zeigen: true heißt, der Partner schaut selbst aufs Display; die Lösung
   bleibt dann verdeckt, bis das andere Team sie aufdeckt.
   Feste Listen stehen in partner-stapel-listen.js (PARTNER_STAPEL_LISTEN).
   ========================================================= */
const PartnerStapel = (() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const any = (list) => list[Math.floor(Math.random() * list.length)];
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const LETTERS = "ABCDEFGHIJKLMNOPRSTUVWZ".split(""); // ohne Q, X, Y
  const show = (w) => String(w).split("|")[0];

  /* ---------- Hilfen ---------- */
  function roman(n) {
    const map = [[100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let s = "";
    for (const [v, r] of map) while (n >= v) { s += r; n -= v; }
    return s;
  }

  const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
    "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function english(n) {
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
    if (n < 1000) return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + english(n % 100) : "");
    return english(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + english(n % 1000) : "");
  }
  const deNum = (n) => n.toLocaleString("de-DE");

  // 24er-Rätsel: vier Zahlen, die sich zu 24 verrechnen lassen, mit einem Lösungsweg
  function solve24(nums) {
    const items = nums.map((n) => ({ v: n, e: String(n) }));
    const go = (list) => {
      if (list.length === 1) return Math.abs(list[0].v - 24) < 1e-9 ? list[0].e : null;
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < list.length; j++) {
          if (i === j) continue;
          const a = list[i], b = list[j];
          const rest = list.filter((_, k) => k !== i && k !== j);
          const opts = [{ v: a.v + b.v, e: `(${a.e} + ${b.e})` }, ...(a.v >= b.v ? [{ v: a.v - b.v, e: `(${a.e} − ${b.e})` }] : []), { v: a.v * b.v, e: `(${a.e} × ${b.e})` }];
          if (b.v !== 0 && a.v % b.v === 0) opts.push({ v: a.v / b.v, e: `(${a.e} : ${b.e})` });
          for (const o of opts) { const r = go([...rest, o]); if (r) return r; }
        }
      }
      return null;
    };
    const r = go(items);
    return r && r.replace(/^\((.*)\)$/, "$1");
  }

  function wordPool(ids, levels = ["leicht", "mittel"]) {
    if (typeof WORD_SOURCES === "undefined") return ["Apfel", "Tisch", "Hund", "Lampe"];
    return ids.flatMap((id) => (WORD_SOURCES[id] ? levels.flatMap((l) => WORD_SOURCES[id].words[l] || []) : [])).map(show);
  }
  const simpleWords = () => wordPool(["gegenstaende", "tiere", "essen"], ["leicht"]).filter((w) => /^[A-Za-zÄÖÜäöüß]{5,7}$/.test(w));

  // Fragen aus der Quizwand (falls geladen)
  function quizCat(id) {
    if (typeof QUIZ_KATEGORIEN === "undefined") return [];
    const k = QUIZ_KATEGORIEN.find((c) => c.id === id);
    return k ? k.fragen : [];
  }

  function bSprache(satz) {
    return satz.replace(/(au|ei|eu|äu|ie|[aeiouäöü])/gi, (m) => `${m}b${m.toLowerCase()}`);
  }

  const COLORS = [["ROT", "#ff4d4d"], ["BLAU", "#4d8dff"], ["GRÜN", "#3ccf6e"], ["GELB", "#ffd84d"], ["LILA", "#b36bff"], ["ORANGE", "#ff9a3d"]];

  /* ---------- Stapel ---------- */
  const list = (key) => () => {
    const l = (typeof PARTNER_STAPEL_LISTEN !== "undefined" && PARTNER_STAPEL_LISTEN[key]) || [];
    const c = any(l) || ["(keine Karten)"];
    return { v: c[0], l: c[1] };
  };

  const STAPEL = {
    // Vorgaben für die ganze Aufgabe
    buchstabe: { art: "einzeln", titel: "Buchstabe", gen: () => ({ v: any(LETTERS) }) },
    zahl: { art: "einzeln", titel: "Zahl", gen: () => ({ v: String(rnd(2, 20)) }) },
    reimwort: { art: "einzeln", titel: "Wort", gen: list("reimwort") },
    kompositum: { art: "einzeln", titel: "Wort", gen: list("kompositum") },
    synonymwort: { art: "einzeln", titel: "Wort", gen: list("synonymwort") },
    redethema: { art: "einzeln", titel: "Thema", gen: list("redethema") },
    tolldings: { art: "einzeln", titel: "Das Ding", gen: list("tolldings") },
    zweidinge: { art: "einzeln", titel: "Die zwei Dinge", gen: list("zweidinge") },
    doppelkategorie: { art: "einzeln", titel: "Beide Kategorien", gen: list("doppelkategorie") },
    kategorie: { art: "einzeln", titel: "Kategorie", gen: list("kategorie") },
    serie: { art: "einzeln", titel: "Serie", gen: list("serie") },
    schauspieler: { art: "einzeln", titel: "Schauspieler", gen: list("schauspieler") },
    kuenstler: { art: "einzeln", titel: "Künstler", gen: list("kuenstler") },
    verein: { art: "einzeln", titel: "Verein", gen: list("verein") },

    // Zum Merken: so viele Elemente, wie geboten wurden
    ziffern: { art: "folge", titel: "Ziffern (eine pro Sekunde vorlesen)", gen: () => ({ v: String(rnd(0, 9)) }), trenner: " " },
    merken: { art: "folge", titel: "Begriffe zum Vorlesen", gen: () => ({ v: any(wordPool(["gegenstaende"])) }), unique: true },
    wortpaare: { art: "folge", titel: "Wortpaare zum Vorlesen", gen: () => ({ v: `${any(wordPool(["tiere"]))} – ${any(wordPool(["gegenstaende"]))}` }), unique: true },
    spielkarten: {
      art: "folge", titel: "Karten (eine alle 3 Sekunden vorlesen)", unique: true,
      gen: () => ({ v: `${any(["Herz", "Karo", "Pik", "Kreuz"])} ${any(["2", "3", "4", "5", "6", "7", "8", "9", "10", "Bube", "Dame", "König", "Ass"])}` })
    },
    einkauf: {
      art: "folge", titel: "Einkaufszettel zum Vorlesen", unique: true,
      gen: () => ({ v: `${any(wordPool(["essen"], ["leicht"]))} ${(rnd(29, 899) / 100).toFixed(2).replace(".", ",")} €` })
    },

    // Karten zum Abfragen
    einmaleins: { art: "karten", gen: () => { const a = rnd(2, 12), b = rnd(2, 12); return { v: `${a} × ${b}`, l: String(a * b) }; } },
    plusminus: {
      art: "karten", gen: () => {
        const a = rnd(11, 99), b = rnd(11, 99);
        return Math.random() < 0.5 ? { v: `${a} + ${b}`, l: String(a + b) } : { v: `${Math.max(a, b)} − ${Math.min(a, b)}`, l: String(Math.abs(a - b)) };
      }
    },
    verdoppeln: { art: "karten", gen: () => { const n = rnd(50, 999); return { v: String(n), l: String(n * 2) }; } },
    quersumme: { art: "karten", gen: () => { const n = rnd(1000, 9999); return { v: String(n), l: String(String(n).split("").reduce((s, d) => s + Number(d), 0)) }; } },
    prozent: {
      art: "karten", gen: () => {
        const p = any([5, 10, 20, 25, 30, 40, 50, 75]);
        const base = rnd(2, 40) * (p === 5 ? 20 : p === 25 || p === 75 ? 4 : 10);
        return { v: `${p} % von ${base}`, l: String((base * p) / 100) };
      }
    },
    uhrzeit: {
      art: "karten", gen: () => {
        const h = rnd(0, 23), m = rnd(0, 11) * 5, dh = rnd(0, 5), dm = rnd(1, 11) * 5;
        const t = (h * 60 + m + dh * 60 + dm) % 1440;
        const f = (x) => `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
        return { v: `${dh ? `${dh} Std. ` : ""}${dm} Min. nach ${f(h * 60 + m)}`, l: f(t) };
      }
    },
    punktstrich: {
      art: "karten", gen: () => {
        if (Math.random() < 0.5) { const a = rnd(1, 20), b = rnd(2, 9), c = rnd(2, 9); return { v: `${a} + ${b} × ${c}`, l: String(a + b * c) }; }
        const c = rnd(2, 6), q = rnd(2, 9), a = rnd(q + 1, 40);
        return { v: `${a} − ${q * c} : ${c}`, l: String(a - q) };
      }
    },
    divrest: { art: "karten", gen: () => { const b = rnd(3, 9), a = rnd(20, 99); return { v: `${a} : ${b}`, l: `${Math.floor(a / b)} Rest ${a % b}` }; } },
    bruch: {
      art: "karten", gen: () => {
        let a, b; do { a = rnd(1, 9); b = rnd(a + 1, 12); } while (gcd(a, b) !== 1);
        const k = rnd(2, 9);
        return { v: `${a * k}/${b * k}`, l: `${a}/${b}` };
      }
    },
    roemisch: { art: "karten", gen: () => { const n = rnd(1, 100); return { v: String(n), l: roman(n) }; } },
    engzahl: { art: "karten", gen: () => { const n = Math.random() < 0.5 ? rnd(100, 9999) : rnd(10000, 99999); return { v: deNum(n), l: english(n) }; } },
    kette: {
      art: "karten", gen: () => {
        let x = rnd(2, 9); const steps = [String(x)];
        for (let i = 0; i < 4; i++) {
          const op = any(["+", "−", "×", ":"]);
          if (op === "+") { const n = rnd(2, 9); x += n; steps.push(`plus ${n}`); }
          else if (op === "−" && x > 3) { const n = rnd(1, x - 1); x -= n; steps.push(`minus ${n}`); }
          else if (op === ":" && [2, 3, 4, 5].some((d) => x % d === 0 && x > d)) { const d = [5, 4, 3, 2].find((q) => x % q === 0 && x > q); x /= d; steps.push(`durch ${d}`); }
          else { const n = rnd(2, 4); x *= n; steps.push(`mal ${n}`); }
        }
        return { v: steps.join(", "), l: String(x) };
      }
    },
    summe: { art: "karten", laufend: true, gen: (st) => { const n = rnd(1, 20); st.sum = (st.sum || 0) + n; return { v: String(n), l: `Summe ${st.sum}` }; } },
    wochentag: {
      art: "karten", gen: () => {
        const n = rnd(10, 400);
        const d = new Date(); d.setDate(d.getDate() + n);
        return { v: `Welcher Wochentag ist in ${n} Tagen?`, l: d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }) };
      }
    },
    vierundzwanzig: {
      art: "karten", gen: () => {
        for (;;) { const n = [rnd(1, 9), rnd(1, 9), rnd(1, 9), rnd(1, 9)]; const s = solve24(n); if (s) return { v: n.join("  "), l: s + " = 24" }; }
      }
    },
    begriffe: { art: "karten", gen: () => ({ v: any(wordPool(["gegenstaende", "tiere", "berufe", "sportarten", "fahrzeuge", "hobbys", "orte"])) }) },
    begriffleicht: { art: "karten", gen: () => ({ v: any(wordPool(["gegenstaende", "tiere", "berufe", "fahrzeuge"], ["leicht"])) }) },
    tiere: { art: "karten", gen: () => ({ v: any(wordPool(["tiere"], ["leicht"])) }) },
    laenge: { art: "karten", gen: () => { const w = any(wordPool(["gegenstaende", "tiere"])).split(" ")[0]; return { v: w, l: `${w.replace(/[^A-Za-zÄÖÜäöüß]/g, "").length} Buchstaben` }; } },
    tieroder: {
      art: "karten", gen: () => Math.random() < 0.45
        ? { v: any(wordPool(["tiere"])), l: "Tier – klatschen" }
        : { v: any(wordPool(["gegenstaende", "essen", "berufe"])), l: "kein Tier – nicht klatschen" }
    },
    simon: {
      art: "karten", gen: () => {
        const c = list("kommando")().v;
        return Math.random() < 0.6 ? { v: `Simon sagt: ${c}`, l: "ausführen" } : { v: c, l: "NICHT ausführen" };
      }
    },
    richtung: {
      art: "karten", gen: () => {
        const d = any(["links", "rechts", "oben", "unten"]);
        return { v: d, l: `zeigt nach ${{ links: "rechts", rechts: "links", oben: "unten", unten: "oben" }[d]}` };
      }
    },
    uhrarme: { art: "karten", gen: () => ({ v: `${rnd(1, 12)}:${Math.random() < 0.5 ? "00" : "30"} Uhr` }) },
    rueckenbuchstabe: { art: "karten", gen: () => ({ v: any("ABCDEFGHIJKLMNOPRSTUVWZ".split("")) }) },
    bsprache: { art: "karten", gen: () => { const s = list("kurzsatz")().v; return { v: s, l: bSprache(s) }; } },
    stroop: {
      art: "karten", zeigen: true, gen: () => {
        const word = any(COLORS);
        let ink; do { ink = any(COLORS); } while (ink === word);
        return { v: word[0], farbe: ink[1], l: ink[0].toLowerCase() };
      }
    },
    salat: {
      art: "karten", zeigen: true, gen: () => {
        const w = any(simpleWords());
        let s; do { s = w.toUpperCase().split("").sort(() => Math.random() - 0.5).join(""); } while (s === w.toUpperCase());
        return { v: s, l: w };
      }
    },
    flagge: {
      art: "karten", zeigen: true, gen: () => {
        const q = any(quizCat("flaggen").filter((f) => f.e));
        return q ? { v: q.e, l: q.a, gross: true } : { v: "(Flaggen nicht geladen)" };
      }
    },
    hauptstadt: {
      art: "karten", gen: () => {
        const q = any(quizCat("hauptstaedte").filter((f) => /^Was ist die Hauptstadt von /.test(f.f)));
        return q ? { v: q.f.replace(/^Was ist die Hauptstadt von /, "").replace(/\?$/, ""), l: q.a } : { v: "(nicht geladen)" };
      }
    },
    allgemein: {
      art: "karten", gen: () => {
        const ids = ["geschichte", "tiere", "weltall", "koerper", "essen", "erfindungen", "filme", "musik", "fussball", "physik", "chemie"];
        const pool = ids.flatMap((id) => quizCat(id).filter((f) => f.s <= 2));
        const q = any(pool);
        return q ? { v: q.f, l: q.a } : { v: "(nicht geladen)" };
      }
    }
  };
  // Stapel aus den festen Listen, die nicht oben stehen, sind einfache Karten
  const LISTEN_KARTEN = ["amtssprache", "waehrung", "stadtland", "kennzeichen", "element", "jungtier", "jahr", "markenland", "teamgroesse",
    "abkuerzung", "zahlenfolge", "scherzfrage", "sprichwort", "gegenteil", "englisch", "mehrzahl", "praeteritum", "wortverbindung",
    "analogie", "oberbegriff", "passtnicht", "langeswort", "schwereswort", "satz6", "slogan", "filmzitat", "hauptdarsteller",
    "interpret", "emoji", "summlied", "tiergeraeusch", "gefuehl"];
  for (const k of LISTEN_KARTEN) if (!STAPEL[k]) STAPEL[k] = { art: "karten", gen: list(k), liste: k };
  STAPEL.emoji.zeigen = true;

  // Zieht eine neue Karte, möglichst keine, die in diesem Stapel schon dran war
  function draw(key, state) {
    const s = STAPEL[key];
    for (let i = 0; i < 25; i++) {
      const c = s.gen(state);
      const id = c.v + "|" + (c.farbe || "");
      if (!state.seen.has(id) || i === 24) { state.seen.add(id); return c; }
    }
  }

  function folge(key, n) {
    const s = STAPEL[key];
    const state = { seen: new Set() };
    const out = [];
    for (let i = 0; i < Math.min(n, 60); i++) out.push(s.unique ? draw(key, state).v : s.gen(state).v);
    return out;
  }

  // Braucht der Stapel Fragen aus der Quizwand?
  const needsQuiz = (key) => ["flagge", "hauptstadt", "allgemein"].includes(key);

  return { STAPEL, draw, folge, needsQuiz, bSprache, roman, english, solve24 };
})();

if (typeof module !== "undefined") module.exports = { PartnerStapel };
