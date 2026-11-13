# Partyspiele

Zwölf Spiele:

- **Verräter** – alle kennen einen geheimen Begriff, nur die Verräter nicht. Pass & Play oder online.
- **Wer bin ich?** – jeder bekommt eine Person, die alle kennen außer ihm selbst. Pass & Play oder online.
- **SPIEGEL** – Karten, Lügen und Fallen für genau 2 Spieler. Pass & Play oder online.
- **Stadt Land Fluss** – ein Buchstabe, eigene Kategorien, Zeitdruck. Nur online, 1 bis 20 Spieler.
- **Kritzeln** – einer zeichnet, alle anderen raten. Nur online, 2 bis 20 Spieler.
- **Fälscher** – eine obskure Frage, viele erfundene Antworten, nur eine ist echt. Pass & Play oder online, 3 bis 8 Spieler.
- **Geheime Auktion** – Lose ersteigern: echt, gefälscht oder ein verkannter Schatz? Ein Tablet in der Mitte (2–4 Spieler) oder online (2–20, jeder am eigenen Handy).
- **Galerie** – jeder schreibt einen Begriff, alle zeichnen ihn gleichzeitig, die beste Zeichnung gewinnt. Nur online, 3 bis 12 Spieler.
- **Wer würde am ehesten?** – einer liest vor, die Gruppe entscheidet. Nur Pass & Play, 3 bis 20 Spieler.
- **Quizwand** – Quizfragen von 100 bis 1000 Punkten in 10 Kategorien auf zwei Seiten, Claude bewertet die Antworten (angelehnt an *Jeopardy!*). Nur Pass & Play, 1 bis 10 Spieler.
- **Mein Partner kann** – Zweierteams überbieten sich, wie viel der eigene Partner schafft, dann muss er liefern. Nur Pass & Play, 2 bis 6 Teams.
- **Kontextlos** – harmlose Antworten werden aus dem Zusammenhang gerissen (angelehnt an *Survive the Internet*). Nur online, 3 bis 12 Spieler.

Auf der Startseite wählt man das Spiel, danach den Modus:

- **Pass & Play** – ein Gerät für alle, wird reihum weitergegeben. Funktioniert auch offline: einfach `index.html` im Browser öffnen.
- **Online** – jeder spielt auf seinem eigenen Gerät in einer gemeinsamen Lobby. Dafür muss der kleine Server (`server.js`) laufen, siehe unten.

## Ablauf
Das Spiel läuft in drei Phasen (oben als Fortschrittsanzeige sichtbar). Zwischen den Phasen erscheint jeweils ein animierter Übergangsbildschirm.

1. **Start:** Spieleranzahl (3–20) und Namen, Anzahl der Verräter, Kategorien und Schwierigkeiten wählen (jeweils mehrere möglich). Optional sieht der Verräter die Kategorie und/oder bekommt einen **vagen Hinweis** (siehe unten). Mit **„Zufällige Anzahl“** wird die Zahl der Verräter jede Runde zwischen 1 und der eingestellten Zahl ausgelost (gleich wahrscheinlich). Sie bleibt bis zum Ende geheim, auch die Anzeige „Verräter übrig“ entfällt.
2. **Rollen verteilen:** Ein zufälliger Spielername wird angezeigt. Dieser Spieler nimmt das Gerät, tippt auf seinen Namen und sieht seine Rolle (Begriff oder „IMPOSTER“). Erneut tippen → nächster Spieler.
3. **Spielrunde** (Vote und Ergebnis auf einer Seite):
   - Angezeigt wird, wer beginnt. Reihum sagt jeder **laut** ein Wort zum Begriff, eingetippt wird nichts.
   - Habt ihr einen Verdacht, einigt ihr euch mündlich. Dann tippt ihr unter **„Jemanden rauswählen“** den Spieler an (zweimal, damit niemand aus Versehen rausfliegt). Danach wird aufgedeckt, ob er Verräter war. Die nächste Runde beginnt der Nächste in der Reihe.
   - Wird ein unschuldiger Spieler rausgewählt, gewinnen die Verräter. Sind alle Verräter raus, gewinnen die Spieler.
   - **Verräter können jederzeit den Begriff raten** (Name wählen + Begriff eingeben). Richtig = gewonnen, falsch = verloren, ausgeschieden ist man in jedem Fall. Die anderen erfahren den Begriff nicht. Ist er der einzige (verbleibende) Verräter, entscheidet sein Tipp das ganze Spiel.
   - Am Ende erscheint das Ergebnis direkt auf derselben Seite, inklusive Begriff und aufgedeckter Rollen.

Beim Raten werden Groß-/Kleinschreibung, Umlaute, kleine Tippfehler und alternative Namen (z. B. „USA“/„Amerika“, bei Personen auch der Nachname) toleriert.

## Online-Modus

- Einer erstellt eine **Lobby** und ist Host. Die anderen treten mit dem **4-stelligen Code** oder über den **Einladungslink** bei.
- Nur der Host ändert die Einstellungen und startet das Spiel. Er kann außerdem Spieler entfernen, einen abwesenden Spieler überspringen, eine Abstimmung vorzeitig auswerten oder abbrechen und das Spiel beenden.
- Jeder sieht **nur seine eigene Rolle**. Der Server kennt alle Rollen und den Begriff und schickt jedem Gerät nur, was es sehen darf. Das Feld „Begriff raten“ erscheint nur bei Verrätern.
- Tipps, Abstimmung und Regeln sind dieselben wie bei Pass & Play – abgestimmt wird gleichzeitig, jeder auf seinem Gerät.
- Lädt jemand die Seite neu oder verliert kurz die Verbindung, kommt er automatisch zurück ins Spiel.

### Lokal starten (z. B. im selben WLAN)

Voraussetzung: [Node.js](https://nodejs.org) ab Version 18.

```bash
npm install
npm start
```

Dann `http://localhost:3000` öffnen. Andere Geräte im selben WLAN erreichen das Spiel über die IP-Adresse des Rechners, z. B. `http://192.168.0.23:3000`.

### Kostenlos ins Internet stellen (Render.com)

1. Bei [render.com](https://render.com) mit dem GitHub-Konto anmelden.
2. **New → Blueprint** wählen und dieses Repository auswählen. Render liest `render.yaml` und richtet alles ein.
3. Nach ein paar Minuten gibt es eine Adresse wie `https://imposter-xxxx.onrender.com` – diese Adresse an alle schicken.

Hinweis: Der kostenlose Plan schläft nach 15 Minuten ohne Besucher ein. Der erste Aufruf danach dauert bis zu einer Minute.

## Wer bin ich?

**Pass & Play**
1. Spieler eintragen (ab 2 Spielern).
2. **Personen ausdenken:** Reihum bekommt ein Spieler das Gerät und denkt sich eine Person für einen anderen Spieler aus (der darf nicht hinschauen). Mit „Vorschlag“ gibt es eine zufällige Person aus den Kategorien Musiker, Schauspieler, Politiker, Geschichte und Streamer.
3. **Personen zeigen:** Reihum hält jeder das Gerät mit dem Bildschirm zu den anderen und tippt blind auf das Feld – alle sehen seine Person, nur er nicht. Nochmal tippen verdeckt sie wieder.
4. **Spielrunde:** Für jeden Spieler gibt es ein Feld. Wer dran ist, stellt laut Ja/Nein-Fragen. Bei „Ja“ darf er weiterfragen, bei „Nein“ tippt er auf „Nächster“. Im Textfeld kann er seine Person raten: richtig = geschafft (mit Platzierung), falsch = der Nächste ist dran. Hat jemand eine Person vergessen, tippt man auf das Feld des Spielers.

**Online**
- Keine Aufdeck-Phase: Jeder sieht dauerhaft die Personen aller anderen, nur die eigene nicht.
- Jeder denkt sich auf seinem Gerät eine Person für einen anderen Spieler aus. Der Host kann fehlende Personen zufällig vergeben.
- Wer dran ist, **schreibt seine Frage auf**. Die anderen stimmen mit **Ja**, **Nein** oder **Enthaltung** ab. Enthaltungen zählen nicht; gibt es mehr Ja- als Nein-Stimmen, lautet die Antwort „Ja“ und man darf weiterfragen. Bei mehr Nein-Stimmen oder Gleichstand ist der Nächste dran.
- Unter dem eigenen Profil steht ein Textfeld zum Raten der eigenen Person.

Beim Raten spielen Groß-/Kleinschreibung, Umlaute und kleine Tippfehler keine Rolle; bei Personen reicht auch der Nachname. Das Spiel endet, wenn höchstens noch ein Spieler seine Person nicht erraten hat.

## SPIEGEL (2 Spieler)

- Jeder hat die Karten **1–9**, einen **Fallenjoker** und **2 Lügenjoker**. Jede Karte kann nur einmal gelegt werden – eine Karte bleibt am Ende übrig.
- **Vor dem Spiel** stellt jeder eine **Falle**: eine Karte des Gegners und eine Rundenspanne von höchstens 3 Runden. Spielt der Gegner die Karte in der Spanne, gibt es Punkte: 3 Runden = 3, 2 Runden = 6, 1 Runde = 9.
- Es gibt **8 Runden**, die Rollen wechseln jede Runde.
- Wer zuerst legt, wählt verdeckt eine Karte und nennt **3 Zahlen** („meine Karte ist eine davon“). Ist die Karte nicht dabei, ist es eine **Lüge** – das erkennt das Spiel automatisch.
- Der andere kann den **Lügenjoker** einschalten und legt dann seine Karte. Beide Karten werden aufgedeckt.
- **Karten:** Differenz ≥ 2 → die höhere Karte gewinnt die Differenz beider Karten (9 gegen 3 = 6 Punkte). Differenz 1 → die niedrigere Karte knackt den Jackpot: fest 10 Punkte. Gleiche Karten → keine Punkte.
- **Lügenjoker richtig:** Der Lügner bekommt in dieser Runde **0 Punkte** (auch keine Fallenpunkte), der Entlarver **+2**.
- **Lügenjoker falsch:** **−2** für den, der ihn eingesetzt hat.
- **Unentdeckte Lüge:** **+2**, solange der Gegner noch Lügenjoker hat.
- **Spielende:** Jeder ungenutzte Lügenjoker kostet **−1**. Danach gewinnt, wer mehr Punkte hat. Der Endbildschirm zeigt groß den Punktestand und darunter das Rundenlog.
- **Pass & Play:** Das Gerät wird vor jedem geheimen Zug übergeben (Falle stellen, Karte legen, Joker-Entscheidung). Das Aufdecken sehen beide.
- Die Wertung steht in `spiegel-rules.js` und wird von Pass & Play und vom Server gemeinsam benutzt.

## Stadt Land Fluss (nur online, 1–20 Spieler)

- **Lobby:** Der Host legt die Kategorien fest (Vorgabe: Stadt, Land, Fluss, Name, Tier, Beruf – eigene lassen sich eintippen, bis zu 12), die Zeit pro Runde (ohne Timer oder 1–5 Minuten) und die Rundenzahl (1–20). Alle sehen die Einstellungen.
- **Schreiben:** Jede Runde gibt es einen zufälligen Anfangsbuchstaben (ohne Q, X, Y). Jeder füllt auf seinem Gerät für jede Kategorie ein Feld aus. „Fertig“ geht erst, wenn jedes Feld mindestens 2 Zeichen hat. Wer fertig ist, kann noch einmal ändern, solange die Runde läuft.
- Die Runde endet, wenn **alle fertig** sind oder der **Timer abläuft** – dann wird gewertet, was bis dahin eingetippt ist. Der Host kann die Runde auch vorzeitig beenden.
- **Auswertung:** Unter jeder Kategorie stehen die Antworten aller Spieler. Jeder stimmt bei den Antworten der anderen mit **gültig** oder **ungültig** ab; ungültig ist eine Antwort, wenn mehr Stimmen dagegen als dafür sind.
- Gleiche Antworten erkennt das Spiel automatisch – auch mit Groß-/Kleinschreibung, Umlauten und kleinen Tippfehlern. Der Host kann mit **Gleichsetzen** weitere Antworten als gleich werten oder mit **Trennen** eine automatische Zuordnung aufheben.
- **Punkte:** als Einziger eine gültige Antwort in der Kategorie = **20**, eine Antwort, die kein anderer hat = **10**, gleiche Antwort wie ein anderer = **5**, ungültig oder leer = 0. Die Punkte werden schon während der Auswertung angezeigt.
- Nach jeder Runde gibt es einen **Punktestand** mit Rundentabelle; nach der letzten Runde den Endstand.

## Kritzeln (nur online, 2–20 Spieler)

- Reihum zeichnet jeder einmal pro Runde. Der Zeichner wählt eines von 3 Wörtern (nach 15 Sekunden wird automatisch gewählt), die anderen raten im Chat.
- **Einstellungen des Hosts:** Schwierigkeit der Begriffe (einfach, mittel, schwer, sehr schwer – auch mehrere gleichzeitig), Tipps (keine, wenig, mittel, viel), Zeichenzeit (60–150 Sekunden) und Rundenzahl (1–10).
- **Tipps:** Rater sehen das Wort als Lücken. Im Laufe der Zeit werden einzelne Buchstaben aufgedeckt, gleichmäßig verteilt zwischen 30 % und 90 % der Zeichenzeit. Die Anzahl hängt von der Wortlänge ab (wenig ≈ 15 %, mittel ≈ 30 %, viel ≈ 45 % der Buchstaben, mindestens 1, höchstens die Hälfte) – ein Wort mit 2 Buchstaben bekommt also auch bei „viel“ nur einen Tipp, eines mit 20 Buchstaben bekommt 9.
- **Mehrere Schwierigkeiten:** Für jeden der drei Vorschläge wird zuerst eine der gewählten Stufen ausgelost – alle gleich wahrscheinlich, unabhängig davon, wie viele Begriffe eine Stufe hat – und dann ein Begriff daraus. Es können also auch alle drei aus derselben Stufe kommen. Aus welcher Stufe ein Vorschlag stammt, wird nicht angezeigt.
- **Schwierigkeit:** Jeder Begriff hat drei Noten von 1 bis 5 – wie schwer er zu zeichnen ist, wie unbekannt er ist und wie schwer er zu buchstabieren ist. Wertung: Zeichnen × 3 + Bekanntheit × 1 + Buchstabieren × 0,5. Bis 8 Punkte = einfach, bis 11 = mittel, bis 14,5 = schwer, darüber = sehr schwer. Die Noten stehen in `draw-words.js` und lassen sich dort anpassen. „Knapp daneben“ sieht nur der Rater selbst. Wer das Wort erraten hat, schreibt danach nur noch für andere, die es auch kennen.
- **Punkte:** 50 bis 200 für richtiges Raten – je schneller, desto mehr. Der Zeichner bekommt 50 Punkte pro richtigem Rater. Der Zug endet, wenn alle erraten haben oder die Zeit abläuft.
- **Zeichenfeld:** Stift mit 18 Farben und 4 Stärken, Radierer, Füllen, Rückgängig und Leeren. Die Zeichnung wird live an alle übertragen und sieht auf jedem Gerät gleich aus; wer neu lädt, bekommt sie vollständig.
- **Apple Pencil:** Die Strichstärke folgt dem Druck. Es wird immer nur ein Strich gleichzeitig gezeichnet; sobald der Stift erkannt wurde, werden Finger und Handballen ignoriert. Setzt der Handballen vor dem Stift auf, wird dieser Strich wieder entfernt.
- **Zoom:** Beim Zeichner wird ein bestehender Zoom zurückgesetzt und Zwei-Finger- sowie Doppeltipp-Zoom gesperrt, solange er zeichnet. Danach ist Zoomen wieder möglich.
- Die Wortliste (749 Begriffe: 278 einfach, 120 mittel, 171 schwer, 180 sehr schwer) steht in `draw-words.js` und liegt nur auf dem Server.

## Fälscher (Pass & Play oder online, 3–8 Spieler)

1. **Frage:** Die App stellt eine obskure Frage, etwa „Was ist ein ‚Gongoozler‘?“ oder „Warum wurde der erste Läufer im Ziel beim olympischen Marathon 1904 disqualifiziert?“. Es gibt fünf Typen: obskure Wörter, Geschichte, kuriose Ereignisse, Namensherkunft und Natur.
2. **Fälschen:** Jeder schreibt geheim eine glaubwürdige, aber falsche Antwort, höchstens 200 Zeichen. Leere Antworten gehen nicht.
3. **Zusammenlegen:** Antworten werden nur zusammengelegt, wenn sie praktisch gleich geschrieben sind: normalisiert (Kleinbuchstaben, ohne Satzzeichen, Leerzeichen zusammengefasst), Levenshtein-Abstand höchstens 2, unter 15 Zeichen höchstens 1.
   - Gleich mit der offiziellen Antwort: +2, keine Abstimmung, keine Punkte durch Stimmen.
   - Gleich untereinander: Die Antworten erscheinen einmal in der Liste, und jeder Autor bekommt die Stimmen.
4. **Antwortliste:** Alle Antworten erscheinen nummeriert und gemischt, die offizielle ohne Markierung. Einer liest vor.
5. **Abstimmen:** Jeder wählt geheim eine Antwort, die eigene geht nicht. Bleibt nur die offizielle übrig, muss man sie wählen. Haben alle die echte Antwort geschrieben, entfällt die Abstimmung.
6. **Aufdecken:** Die echte Antwort mit Erklärung, wer was geschrieben und gewählt hat, und die Punkte.

**Wertung:** +2 für das Wählen der offiziellen Antwort, +2 für eine Antwort, die mit der offiziellen zusammengelegt wurde, +1 für jede Stimme auf die eigene Antwort. Wählt niemand die offizielle Antwort, bekommt jeder Autor in der Liste +1. Nur die offizielle Antwort zählt als richtig, auch wenn eine Fälschung inhaltlich stimmt. Bei Gleichstand teilen sich die Spieler den Platz.

- **Pass & Play:** Beim Schreiben und Abstimmen gibt es Übergabe-Bildschirme („Gib das Handy an …“ → „Ich bin …“).
- **Online:** Alle schreiben und stimmen gleichzeitig ab, angezeigt wird, auf wen noch gewartet wird. Der Host schaltet weiter. Die offizielle Antwort verlässt den Server erst beim Aufdecken, Zusammenlegen und Wertung laufen dort.
- **Einstellbar:** 4–15 Fragen, Standard 8. Keine Frage kommt in einem Spiel doppelt, zuletzt gespielte kommen erst später wieder.
- **Ende:** Rangliste und Rundenlog mit Frage, echter Antwort und bester Fälschung samt Autor. Danach „Nochmal spielen“ mit neuen Fragen.
- Die 295 Fragen (je 60 Wörter, Geschichte, Herkunft und Natur, 55 Ereignisse) stehen in `faelscher-fragen.js` (Felder id, typ, frage, antwort, erklaerung), die Regeln in `faelscher-rules.js`.

## Geheime Auktion (Tablet in der Mitte für 2–4 Spieler, online für 2–20)

- **Lose:** Jedes Los hat einen Katalogtext, eine Kategorie und einen Schätzpreis. Was es wirklich ist, erfährt man erst am Ende:
  - **Echt:** Der Wert liegt bei Schätzpreis ±15 %.
  - **Fälschung:** Es bleibt nur der Materialwert. Ein gefälschtes Goldobjekt ist noch Gold wert, ein gefälschter Brief 0.
  - **Verkannter Schatz:** Das Auktionshaus hat ein Detail übersehen, das Los ist viel mehr wert.
- **Mischung pro Spiel:** Bei 10 Losen sind etwa 4 echt, 5 gefälscht und 1 ein Schatz. Jedes Los gibt es als echte und als gefälschte Version, die sich nur in einem kleinen Detail unterscheiden, manche zusätzlich als Schatz. Welche Version drankommt, wird jedes Spiel neu ausgelost. Zuletzt gespielte Lose kommen erst später wieder.
- **Bieten:** Jeder startet mit 1000. Die Knöpfe +5, +10, +20, +50, +100 und +200 erhöhen das Höchstgebot. Zu jedem Los gibt es erst 20 Sekunden Lesezeit, in der noch niemand bieten kann. Danach gibt es kein Zeitlimit bis zum ersten Gebot. Will keiner bieten, geht das Los mit „Keiner bietet – Los zurückgeben“ zurück (online kann das nur der Host). Nach jedem Gebot läuft „Zum Ersten, zum Zweiten, zum Dritten“ (10 Sekunden). Bietet keiner mehr, ist das Los verkauft. Mehr bieten, als man hat, geht nicht.
- **Tablet in der Mitte:** Jeder Spieler hat eine gleich große Ecke mit seinen Bietknöpfen: 1 unten links, 2 oben rechts, 3 unten rechts, 4 oben links. Die oberen Ecken sind zu den Spielern auf der anderen Tischseite gedreht. Die Loskarte in der Mitte dreht man mit „Karte drehen“ zu den oberen Spielern. Während der Auktion ist das Zoomen gesperrt, damit mehrere Finger gleichzeitig auf dem Bildschirm nichts vergrößern. Danach ist Zoomen wieder möglich.
- **Online:** Jeder bietet am eigenen Handy. Der Server entscheidet über Zeit und Zuschlag. Was ein Los wirklich ist, verlässt den Server erst bei der Auflösung.
- **Auflösung:** Die Lose werden nacheinander aufgedeckt, mit Erklärung, worin die Fälschung bzw. der übersehene Schatz bestand. Gewinner ist, wer am meisten hat: Restgeld plus echter Wert der ersteigerten Lose.
- Die 179 Lose (davon 43 auch als möglicher verkannter Schatz) stammen aus 14 Bereichen: Physik, Chemie, Astronomie, Naturkunde, Geschichte, Politik, Kunst, Musik, Literatur, Wirtschaft, Schmuck, Technik, Alltag & Design und Sport. Sie stehen in `auktion-lose.js`, die Regeln (Mischung, Werte, Endstand) in `auktion-rules.js`.

## Galerie (nur online, 3–12 Spieler)

1. **Begriffe:** Jeder schreibt einen Begriff auf, oder 2 bzw. 3, wenn der Host das so einstellt. Doppelte Begriffe zählen nur einmal. Jeder Begriff ist eine Runde.
2. **Zeichnen:** Ein Begriff wird gelost und alle zeichnen ihn gleichzeitig, auch wer ihn geschrieben hat. Die Zeit stellt der Host ein (45–180 Sekunden). Mit „Fertig“ ist man früher durch, mit „Doch weiterzeichnen“ geht es weiter, solange die Zeit läuft. Das Zeichenfeld ist dasselbe wie bei Kritzeln, mit Apple-Pencil-Druck, Handballen-Erkennung und Zoom-Sperre.
3. **Galerie:** Die Zeichnungen hängen ohne Namen und in zufälliger Reihenfolge an der Wand. Jeder tippt die beste an, die eigene geht nicht. Leere Zeichnungen werden nicht ausgestellt.
4. **Ergebnis:** Jetzt sieht man, wer was gezeichnet hat und von wem der Begriff kam. Jede Stimme bringt **100 Punkte**, die meistgewählte Zeichnung **100 extra**. Danach kommt der nächste Begriff, bis alle einmal dran waren.

- Die Zeichnungen bleiben während des Zeichnens auf dem Server. Erst zur Abstimmung werden sie unter zufälligen Kennungen an alle geschickt, die Namen kommen erst mit dem Ergebnis.
- Fehlt jemand, kann der Host mit „Nicht länger warten“ bzw. „Zeichnen beenden“ weitermachen.

## Wer würde am ehesten? (Pass & Play, 3–20 Spieler)

- Einer hat das Handy und liest die Frage vor, zum Beispiel „Wer würde am ehesten an einer Tür ziehen, auf der groß ‚Drücken‘ steht?“.
- Die Gruppe entscheidet gemeinsam und tippt an, wer es **am ehesten** und wer es **am wenigsten** tun würde. Dieselbe Person kann nicht beides sein. Eine Frage lässt sich auch überspringen.
- **685 Fragen** in `ehesten-fragen.js`: Alltag, Schule und Arbeit, Peinliches, Party, Freundschaft, Crush und Dating, Gruppenchat, Sport, Reisen, Zukunft, Essen, Geld, Gaming, Familie und absurde Szenarien. Zuletzt gespielte Fragen kommen erst wieder, wenn die anderen durch sind.
- **Auswertung** (jederzeit über „Beenden“): Für jeden Spieler steht, wie oft und bei welchen Fragen er am ehesten bzw. am wenigsten gewählt wurde. Danach kann man weiterspielen.
- **Wer ist wer? (Profile von Claude):** Ab 5 gespielten Fragen kann Claude die Antworten auswerten und über jeden ein kurzes, freches Profil in Jugendsprache schreiben, mit Spitznamen und ohne Namen. Die Profile erscheinen gemischt. Ihr tippt bei jedem an, wen ihr vermutet, und löst dann auf.
  - Das geht nur in der **Claude-Version** (claude.ai-Link). Die Anfrage läuft über das claude.ai-Konto der Person, die das Handy hat. Beim ersten Mal fragt claude.ai, ob die Seite Claude benutzen darf.
  - An Claude gehen nur die Namen und die Fragen, bei denen jemand gewählt wurde.
  - Auf der Render-Seite fehlt dieser Teil, dort gibt es nur die einfache Auswertung.

## Quizwand (Pass & Play, 1–10 Spieler)

- **Kategorien:** Ihr wählt 10 von 18 Kategorien (oder lasst auffüllen). Der Zufall verteilt sie auf zwei Seiten mit je 5 Kategorien. Jede Kategorie hat 5 Fragen: 100, 200, 300, 400 und 500 Punkte. Auf Seite 2 zählt alles doppelt (200 bis 1000).
- **Ablauf:** Reihum wählt einer ein Feld und tippt seine Antwort ein. Richtig gibt die Punkte, falsch kostet die Hälfte (bei 300 also −150), „Weiß ich nicht“ kostet nichts. Dann dürfen die anderen klauen, mit denselben Regeln: Jeder bekommt einen großen Buzzer auf dem Bildschirm (nach 1,5 Sekunden scharf), und wer zuerst drückt, darf antworten. Danach ist der Nächste dran. Ist eine Seite leer gespielt (oder vorzeitig beendet), geht es zu Seite 2 und dann zum Endstand.
- **Bewertung:** Eindeutige Treffer (auch mit kleinen Tippfehlern) erkennt das Spiel selbst. Alles andere beurteilt **Claude** mit kurzer Begründung – Synonyme, andere Schreibweisen und sachlich richtige Antworten zählen. Ist die Runde anderer Meinung, dreht sie das Urteil mit „Doch richtig“ / „Doch falsch“ um.
  - Claude gibt es nur in der **Claude-Version** (claude.ai-Link). Anderswo wird die Lösung gezeigt und die Runde entscheidet selbst.
  - An Claude gehen nur die Frage, die Lösung und die getippte Antwort.
- **Besonderheiten:** Bei *Flaggen* wird die Flagge als Emoji gezeigt (auf Windows-PCs zeigen manche Browser statt der Flagge nur zwei Buchstaben). Bei *Minecraft-Crafting* erscheint das Rezept im 3×3-Feld. Bei *Was ist die Frage?* steht die Antwort da und man muss die passende Frage bilden („Was ist …?“).
- **Fragen:** 1.851 Fragen in 18 Kategorien: Mathe, Chemie, Physik, Flaggen, Hauptstädte, Minecraft-Crafting, Was ist die Frage?, Musik, Filme & Serien, Tiere, Fußball, Geschichte, Weltall, Menschlicher Körper, Essen & Trinken, Videospiele, Wörter & Redewendungen, Erfindungen & Technik. Zuletzt gespielte Fragen kommen erst später wieder.
- Die Fragen stehen als JSON in `quiz-fragen/` (Format in `quiz-fragen/FORMAT.md`). Nach Änderungen `node tools/quiz-build.js` ausführen, das erzeugt `quiz-fragen.js`.

## Mein Partner kann (Pass & Play, 2–6 Zweierteams)

- **Rollen:** Pro Aufgabe bietet aus jedem Team einer, der Partner muss antreten und darf beim Bieten nichts verraten. Nach jeder Aufgabe tauschen die Rollen.
- **Bieten:** Die Aufgabe erscheint, zum Beispiel „Wie viele Länder Europas kann dein Partner aufzählen?“. Reihum überbieten sich die Bieter („Ben schafft 12!“) oder passen. Wer passt, ist für diese Aufgabe raus. Jede Runde eröffnet ein anderes Team. Solange noch niemand geboten hat, lässt sich die Aufgabe tauschen.
- **Antreten:** Bleibt nur noch ein Team übrig, muss dessen Partner das Gebot schaffen. **Geschafft: +2 Punkte, nicht geschafft: −1.** Die anderen Teams zählen mit und entscheiden.
- **Aufgaben:** 280 Stück in drei Arten – Wissen (103, z. B. Länder, Hunderassen, Nachkommastellen von Pi), Denken (87, z. B. Wortketten, Kopfrechnen, Ziffern merken) und Körper (90, z. B. Liegestütze, Wandsitz, Papierkugeln werfen). Die Arten lassen sich abwählen und wechseln sich im Spiel ab.
- **Zeit:** 199 Aufgaben haben ein Zeitlimit (10 bis 120 Sekunden, die App zählt herunter und piept am Ende), 55 laufen ohne Zeit (z. B. bis zum ersten Fehler), bei 26 ist das Gebot selbst eine Zeit („Wie viele Sekunden hält dein Partner den Wandsitz?“) – dort läuft eine Stoppuhr und meldet, wenn das Ziel erreicht ist.
- **Kartenstapel:** Bei 60 Aufgaben liefert die App das Material, das sonst ein anderes Team ausdenken müsste. Das abfragende Team sieht Vorlage und Lösung (z. B. „8 × 7 – Lösung: 56“, „Marseille – Frankreich“, „Morgenstund hat … – Gold im Mund“) und tippt bei jeder richtigen Antwort auf „Richtig“; die App zählt mit und meldet, wenn das Gebot erreicht ist. Rechenaufgaben, Buchstaben, Ziffern- und Begriffsfolgen zum Merken, Buchstabensalat, Farbwörter und Ähnliches erzeugt die App selbst, Begriffe zum Erklären kommen aus den Verräter-Listen, Flaggen, Hauptstädte und Wissensfragen aus der Quizwand. Wenn der Partner selbst aufs Display schauen muss (Flaggen, Buchstabensalat, Farbwörter, Emojis), bleibt die Lösung verdeckt, bis man sie aufdeckt. Die festen Listen stehen in `partner-stapel-listen.js`, die Stapel in `partner-stapel.js`.
- Einige Körper-Aufgaben brauchen einfache Dinge wie Papierkugeln, Münzen oder Becher; das steht im Hinweis unter der Aufgabe.
- **Einstellbar:** 6 bis 20 Aufgaben. Die Aufgaben stehen in `partner-aufgaben.js`.

## Claude-Version

`node tools/claude-bundle.js partyspiele.html` baut eine einzelne HTML-Seite mit allen Spielen für Pass & Play (ohne Server). Sie wird auf claude.ai veröffentlicht. Nur dort können Quizwand und „Wer würde am ehesten?“ Claude benutzen.

## Kontextlos (nur online, 3–12 Spieler)

Jede Runde hat vier Schritte:

1. **Antworten:** Jeder bekommt eine harmlose Frage und antwortet ganz normal, zum Beispiel „Was sagst du, wenn du etwas richtig Leckeres isst?“. Bei der Art *Bilder* wählt man stattdessen eines von vier Bildern zum Posten.
2. **Verdrehen:** Jeder bekommt die Antwort eines anderen, aber ohne die ursprüngliche Frage. Dazu erfindet er den fehlenden Zusammenhang, und zwar so, dass der andere ohne Kontext möglichst schlecht dasteht. Die Zuteilung läuft im Kreis, niemand bekommt seine eigene Antwort.
   - **Videos:** Die Antwort steht als Kommentar unter einem Video, der Verdreher erfindet den Videotitel.
   - **Kommentare:** Die Antwort ist die Antwort auf einen Beitrag, der Verdreher erfindet den Beitrag.
   - **Fragen:** Die Antwort bleibt eine Antwort, der Verdreher erfindet eine neue Frage.
   - **Bilder:** Das gewählte Bild wird gepostet, der Verdreher schreibt die Bildunterschrift.
3. **Enthüllen:** Der Host deckt die Beiträge nacheinander auf. Sie sehen aus wie Ausschnitte aus sozialen Netzwerken. Über jedem Beitrag steht, von wem die ursprüngliche Aussage ist, im Beitrag ist sie markiert.
4. **Abstimmen:** Jeder stimmt für den schlimmsten Beitrag, den eigenen kann man nicht wählen. Jede Stimme bringt dem Verdreher **100 Punkte**, der meistgewählte Beitrag bekommt **100 extra** (bei Gleichstand alle). Erst jetzt wird verraten, wer was verdreht hat.

- **Einstellungen des Hosts:** welche Arten drankommen (Videos, Kommentare, Fragen, Bilder – beliebig kombinierbar) und die Rundenzahl (1–10). Jede Antwort bekommt zufällig eine der gewählten Arten.
- Fehlt jemand, kann der Host mit **„Nicht länger warten“** weitermachen. Wer nicht geantwortet hat, ist in der Runde nicht dabei, und unverdrehte Beiträge fallen weg.
- Die Fragen (567: je rund 160 für Videos, Kommentare und Fragen, 85 für Bilder) stehen in `kontext-prompts.js` und liegen nur auf dem Server. Die ursprüngliche Frage sieht nur, wer sie beantwortet – auch nach der Runde wird sie nicht angezeigt. Die Fotos liegen im Ordner `kontext-bilder/` (höchstens 900 px, als JPG). Ein neues Bild legt man dort ab und trägt den Namen in `kontext-images.js` ein. Pro Runde bekommt jeder 4 Bilder zur Auswahl, möglichst andere als die anderen Spieler.

## Kategorien (Verräter)

18 Kategorien mit insgesamt 2.727 Begriffen, jeweils **leicht**, **mittel** und **schwer**. Kategorien und Schwierigkeiten lassen sich beliebig kombinieren (mehrere gleichzeitig antippen, „Alle“ wählt alle Kategorien). Für jede Runde wird zuerst eine der gewählten Kategorien und dann eine der gewählten Stufen ausgelost, jeweils gleich wahrscheinlich:

Länder · Städte · Marken · Promis · Lebensmittel · Tiere · Sehenswürdigkeiten · Berufe · Filme & Serien · Animes · Sportarten · Videospiele · Gegenstände · Orte · Figuren · Fahrzeuge · Kleidung & Accessoires · Hobbys & Freizeit

- **Marken** fasst Auto-, Mode-, Lebensmittel- und Techmarken sowie Firmen zusammen.
- **Promis** fasst historische Persönlichkeiten, Politiker, Schauspieler, Musiker & Bands, Sportler und Fußballer zusammen. **Deutsche Streamer** kommen nur dazu, wenn *schwer* ausgewählt ist.

In `words.js` bleiben die Einzellisten erhalten (`WORD_SOURCES`, für Wer bin ich? und die Hinweise). `MERGED_CATEGORIES` legt fest, welche Listen beim Verräter zusammengefasst werden.

Eigene Begriffe lassen sich in `words.js` ergänzen – Browser und Server benutzen dieselbe Datei.

### Hinweis für den Verräter

Wenn die Einstellung „Verräter bekommt einen vagen Hinweis“ an ist, sieht der Verräter auf seiner Rollenkarte ein Stichwort zum Begriff, zum Beispiel *Linksverkehr* bei Großbritannien. Der Hinweis passt absichtlich auch zu mehreren anderen Begriffen der Kategorie. Er nennt nie das bekannteste Merkmal, keinen Slogan, kein Logo und keinen Namensteil. Am Ende der Runde sehen alle, welcher Hinweis es war.

Die Hinweise stehen in `verraeter-hints.js` (Schlüssel: Einzelliste aus `WORD_SOURCES` und angezeigter Begriff). Online kennt sie nur der Server: Er schickt den Hinweis allein an die Verräter, sonst ließe sich der Begriff in der Liste nachschlagen. Bei Pass & Play wird die Datei erst beim Spielstart nachgeladen. Ein neuer Begriff in `words.js` braucht dort auch einen Hinweis, sonst spielt der Verräter ohne.
