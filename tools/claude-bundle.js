"use strict";
// Baut die Claude-Version: eine einzige HTML-Seite ohne Server (nur Pass & Play),
// alle Skripte und Daten eingebettet. Aufruf: node tools/claude-bundle.js <ausgabe.html> [quellordner]
const fs = require("fs");
const path = require("path");
const out = process.argv[2];
const dir = path.resolve(process.argv[3] || path.join(__dirname, ".."));
const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");
// Daten, die sonst erst bei Bedarf nachgeladen werden
const LAZY = ["verraeter-hints.js", "auktion-lose.js", "faelscher-fragen.js", "quiz-fragen.js"];

const html = read("index.html");
const head = html.slice(html.indexOf("<title>"), html.indexOf("</head>"))
  .split("\n").filter((l) => !l.includes('href="style.css"')).join("\n").trimEnd();
let body = html.slice(html.indexOf("<body>") + 6, html.indexOf("</body>"));
const inline = (f) => `  <script>\n${read(f).trimEnd()}\n</script>`;
body = body.replace(/^\s*<script src="([^"]+)"><\/script>$/gm, (_, f) => inline(f));
const extra = LAZY.filter((f) => fs.existsSync(path.join(dir, f))).map(inline).join("\n");
body = body.trimEnd() + (extra ? "\n" + extra : "") + "\n";
const page = `${head}
  <style>
${read("style.css").trimEnd()}
</style>
<script>window.IMPOSTER_OFFLINE_ONLY = true; document.documentElement.dataset.theme = "hub";</script>
${body}`;
fs.writeFileSync(out, page);
console.log(`${out}: ${(page.length / 1024).toFixed(0)} KB`);
