# Fragenformat für die Quizwand (Jeopardy-artiges Quiz)

Eine Datei pro Kategorie: `quiz-fragen/<kategorie-id>.json`, ein JSON-Array von Fragen.

```json
[
  {
    "stufe": 1,
    "frage": "Wie viele Seiten hat ein Sechseck?",
    "antwort": "6",
    "akzeptiert": ["sechs"],
    "bewertung": "Nur die Zahl zählt."
  }
]
```

Felder:
- `stufe` (1–5): Schwierigkeit. 1 = 100 Punkte (fast jeder in der Runde weiß es), 2 = 200, 3 = 300 (Allgemeinwissen, man muss kurz nachdenken), 4 = 400, 5 = 500 (schwer, eher für Kenner, aber noch fair und lösbar).
- `frage`: die Frage auf Deutsch, kurz und eindeutig. Höchstens ca. 200 Zeichen.
- `antwort`: die erwartete Lösung, kurz (meist 1–4 Wörter oder eine Zahl).
- `akzeptiert` (optional): weitere Schreibweisen/Synonyme, die auch richtig sind.
- `bewertung` (optional): Hinweis für den Schiedsrichter (eine KI, die getippte Antworten bewertet), z. B. „Nachname reicht“, „Einheit nicht nötig“, „Auch ‚Wolfram‘ ist richtig“. Nur wenn nötig.
- Nur Kategorie „flaggen“: `emoji` – das Flaggen-Emoji (z. B. "🇯🇵"). Die Frage lautet dann z. B. „Zu welchem Land gehört diese Flagge?“; das Emoji wird groß angezeigt.
- Nur Kategorie „minecraft“: optional `rezept` – genau 9 Strings für das 3×3-Feld (zeilenweise, oben links zuerst, "" für leer), deutsche Itemnamen aus der deutschen Minecraft-Version (z. B. "Eisenbarren", "Stock", "Holzbretter"). Die Frage lautet dann z. B. „Was wird hier gecraftet?“.

Regeln:
- Antworten werden getippt, also muss die Lösung eindeutig und kurz sein. Keine Fragen, bei denen mehrere Antworten gleich gut passen (oder alle passenden in `akzeptiert`/`bewertung` aufzählen).
- Nur Fakten, bei denen du dir wirklich sicher bist. Im Zweifel weglassen oder nachprüfen. Nichts, das schnell veraltet (z. B. aktuelle Trainer, aktuelle Charts), außer mit Jahresangabe.
- Zielgruppe: deutsche Jugendliche und junge Erwachsene (ca. 15–25) auf einer Party.
- Keine doppelten Fragen innerhalb der Datei.
- Die Datei muss immer gültiges JSON sein (UTF-8, echte Umlaute).
