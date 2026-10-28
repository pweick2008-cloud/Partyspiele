"use strict";

/* =========================================================
   Kontextlos – harmlose Fragen für die erste Phase
   Wer antwortet, weiß nicht, wofür die Antwort später benutzt wird.
   Die Fragen sind so gewählt, dass kurze, alltägliche Sätze entstehen,
   die man gut aus dem Zusammenhang reißen kann.
   Nur der Server lädt diese Datei.
   ========================================================= */
const KX_PROMPTS = {
  // Die Antwort wird zum Kommentar unter einem Video – der andere erfindet den Videotitel.
  video: [
    "Was sagst du, wenn du etwas richtig Leckeres isst?",
    "Was rufst du, wenn dein Lieblingsteam ein Tor schießt?",
    "Wie lobst du jemanden, der gut gekocht hat?",
    "Was sagst du, wenn dich ein Baby anlächelt?",
    "Was sagst du, wenn du endlich im Urlaub ankommst?",
    "Was denkst du beim Anblick eines Sonnenuntergangs?",
    "Was sagst du nach einem richtig guten Training?",
    "Was sagst du, wenn du ein Geschenk auspackst?",
    "Was sagst du, wenn der Bus endlich kommt?",
    "Was murmelst du morgens beim ersten Kaffee?",
    "Was sagst du zu einem Hund, der brav Sitz macht?",
    "Was sagst du, wenn du ein großes Puzzle fertig hast?",
    "Was sagst du, wenn im Restaurant endlich das Essen kommt?",
    "Was sagst du beim Blick in einen frisch gefüllten Kühlschrank?",
    "Was ruft man beim Achterbahnfahren?",
    "Was sagst du, wenn du direkt vor der Tür einen Parkplatz findest?",
    "Wie bedankst du dich bei deinem Friseur?",
    "Was sagst du, wenn dein Kuchen perfekt aus dem Ofen kommt?",
    "Was sagst du zu einer Pflanze, damit sie besser wächst?",
    "Wie kommentierst du ein Video von einem kleinen Kätzchen?",
    "Was sagst du, wenn du im Lotto fünf Euro gewinnst?",
    "Was sagst du, wenn die Pizza geliefert wird?",
    "Was sagst du, wenn du nach dem Sport unter die warme Dusche gehst?",
    "Was sagst du, wenn du nach langer Zeit wieder ins Kino gehst?",
    "Was sagst du, wenn du ein altes Foto von dir als Kind findest?",
    "Was sagst du, wenn dein Lieblingslied im Radio läuft?",
    "Was sagst du, wenn der Schnee über Nacht liegen geblieben ist?",
    "Was sagst du beim Anschneiden einer Wassermelone?",
    "Was sagst du, wenn ein Freund dir zeigt, wie er Gitarre spielt?",
    "Was sagst du, wenn du endlich den Wohnungsschlüssel wiederfindest?",
    "Was sagst du, wenn deine Oma dir ein Rezept verrät?",
    "Was sagst du, wenn du zum ersten Mal ein Ikea-Regal ohne Hilfe aufgebaut hast?"
  ],

  // Die Antwort wird zur Antwort auf einen Beitrag – der andere erfindet den Beitrag.
  kommentar: [
    "Wie gratulierst du jemandem zur bestandenen Prüfung?",
    "Was antwortest du, wenn dich jemand fragt, wie dein Wochenende war?",
    "Was schreibst du unter das Babyfoto deiner Cousine?",
    "Was sagst du, wenn ein Freund dir sein neues Auto zeigt?",
    "Wie tröstest du jemanden, der seinen Bus verpasst hat?",
    "Was sagst du, wenn dir jemand sein selbst gemaltes Bild zeigt?",
    "Was antwortest du, wenn dich jemand zum Essen einlädt?",
    "Was sagst du einem Kollegen am Freitagnachmittag?",
    "Was schreibst du in eine Glückwunschkarte zur Hochzeit?",
    "Was sagst du, wenn dir jemand ein Rezept empfiehlt?",
    "Was antwortest du auf: „Wer kommt mit zum Wandern?“",
    "Was sagst du, wenn ein Freund erzählt, dass er Vater wird?",
    "Wie motivierst du jemanden vor einem Marathon?",
    "Was antwortest du deiner Mutter, wenn sie fragt, ob du genug isst?",
    "Was sagst du zu jemandem, der dir Blumen schenkt?",
    "Was sagst du, wenn jemand seine neue Frisur zeigt?",
    "Was schreibst du, wenn jemand ein Foto von seinem Abendessen postet?",
    "Was antwortest du auf eine Einladung zum Grillen?",
    "Was sagst du, wenn dir jemand von seinem neuen Haustier erzählt?",
    "Wie lobst du ein Kind, das sein Zimmer aufgeräumt hat?",
    "Was sagst du, wenn sich jemand für deine Hilfe bedankt?",
    "Was sagst du einem Freund, der in eine andere Stadt zieht?",
    "Was sagst du, wenn dir jemand seine Urlaubspläne erzählt?",
    "Was schreibst du deinem besten Freund zum Geburtstag?",
    "Was sagst du, wenn jemand ein neues Hobby anfängt?",
    "Was sagst du, wenn deine Nachbarin dir Kuchen vorbeibringt?",
    "Was sagst du, wenn jemand seinen ersten Job bekommt?",
    "Was sagst du nach einem schönen Spieleabend?",
    "Was antwortest du, wenn jemand fragt, ob du beim Umzug hilfst?",
    "Was sagst du, wenn jemand dir stolz seinen Garten zeigt?",
    "Was antwortest du, wenn dein Chef dich für ein Projekt lobt?",
    "Was schreibst du in die Familiengruppe, wenn du gut angekommen bist?"
  ],

  // Die Antwort wird zur Antwort auf eine Frage – der andere erfindet eine neue Frage.
  frage: [
    "Was ist dein Lieblingsort zum Entspannen?",
    "Womit verbringst du am liebsten deinen Sonntag?",
    "Was hast du immer in deiner Tasche dabei?",
    "Was hast du zuletzt gekocht?",
    "Wie hieß dein erstes Haustier oder Kuscheltier?",
    "Was würdest du mit einem freien Tag machen?",
    "Was ist dein Lieblingsgeräusch?",
    "Wer ist dein großes Vorbild?",
    "Was isst du am liebsten zum Frühstück?",
    "Wohin würdest du gern einmal reisen?",
    "Was hast du als Kind gesammelt?",
    "Was ist dein bestes Talent?",
    "Was hast du zuletzt im Internet bestellt?",
    "Wie viele Stunden schläfst du normalerweise?",
    "Was war dein liebstes Spiel als Kind?",
    "Welches Werkzeug benutzt du am häufigsten?",
    "Was machst du, wenn du nicht einschlafen kannst?",
    "Was riecht für dich nach Zuhause?",
    "Was ist dein liebstes Getränk im Sommer?",
    "Was hast du immer im Kühlschrank?",
    "Welche Sportart würdest du gern lernen?",
    "Was ist das Schönste an deiner Wohnung?",
    "Was machst du als Erstes, wenn du nach Hause kommst?",
    "Wie würden dich deine Freunde in drei Worten beschreiben?",
    "Was ist dein Lieblingsgemüse?",
    "Was tust du, um runterzukommen?",
    "Was war dein Lieblingsfach in der Schule?",
    "Welche Musik hörst du beim Putzen?",
    "Was ist dein liebster Feiertag?",
    "Womit hast du dein erstes Geld verdient?",
    "Was nimmst du immer mit in den Urlaub?",
    "Was kannst du richtig gut kochen?"
  ],

  // Man wählt ein Bild zum Posten – der andere schreibt die Bildunterschrift.
  bild: [
    "Poste ein Foto von deinem Wochenende.",
    "Welches Bild zeigt deinen Montagmorgen?",
    "Poste ein Foto, das dich glücklich macht.",
    "Zeig uns dein schönstes Urlaubsfoto.",
    "Poste ein Bild von deinem Abendessen.",
    "Welches Foto würdest du deiner Oma schicken?",
    "Poste ein Bild von deinem neuen Hobby.",
    "Zeig uns deinen Lieblingsplatz.",
    "Welches Bild passt zu deiner Familie?",
    "Welches Foto zeigt deinen Feierabend?",
    "Poste ein Bild zu deinem Geburtstag.",
    "Welches Bild beschreibt deine Woche?",
    "Poste ein Foto für deine Kollegen.",
    "Welches Bild zeigt dein Zuhause am besten?",
    "Poste ein Erinnerungsfoto an deinen letzten Ausflug.",
    "Welches Foto würdest du als Profilbild nehmen?"
  ]
};

if (typeof module !== "undefined") module.exports = { KX_PROMPTS };
