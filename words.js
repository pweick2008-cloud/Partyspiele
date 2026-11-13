// Begriffe je Überkategorie und Schwierigkeit.
// Alternative Schreibweisen werden mit "|" getrennt – der erste Eintrag wird angezeigt,
// alle weiteren werden beim Raten des Imposters ebenfalls als richtig akzeptiert.
// "person: true" bedeutet: beim Raten reicht auch der Nachname (z. B. "Einstein").
// WORD_SOURCES sind die Einzellisten (Wer bin ich? und die Hinweise nutzen sie direkt),
// CATEGORIES die Auswahl beim Verräter, in der einige Listen zusammengefasst sind.

const WORD_SOURCES = {
  laender: {
    name: "Länder",
    icon: "",
    words: {
      leicht: [
        "Deutschland", "Frankreich", "Italien", "Spanien", "USA|Vereinigte Staaten|Amerika|Vereinigte Staaten von Amerika",
        "Großbritannien|England|Vereinigtes Königreich|UK", "China", "Japan", "Russland", "Brasilien",
        "Österreich", "Schweiz", "Türkei", "Griechenland", "Kanada", "Australien", "Mexiko",
        "Ägypten", "Indien", "Niederlande|Holland", "Polen", "Portugal",
        "Ukraine", "Nordkorea", "Luxemburg", "Tunesien", "Malta", "Zypern", "Vatikanstadt|Vatikan", "Monaco",
        "Afghanistan", "Irak", "Syrien", "Pakistan", "Nigeria", "Venezuela", "Bulgarien", "Rumänien",
        "Serbien", "Slowakei", "Albanien", "Bosnien und Herzegowina|Bosnien",
        "Vereinigte Arabische Emirate|VAE|Emirate", "Katar"
      ],
      mittel: [
        "Thailand", "Argentinien", "Schweden", "Norwegen", "Dänemark", "Finnland", "Irland",
        "Kroatien", "Marokko", "Südafrika", "Kenia", "Peru", "Chile", "Kolumbien", "Vietnam",
        "Indonesien", "Südkorea|Korea", "Neuseeland", "Ungarn", "Tschechien|Tschechische Republik",
        "Island", "Kuba", "Jamaika", "Philippinen", "Saudi-Arabien", "Israel", "Iran", "Belgien",
        "Madagaskar", "Slowenien", "Estland", "Lettland", "Litauen", "Belarus|Weißrussland", "Georgien",
        "Kasachstan", "Mongolei", "Nepal", "Sri Lanka", "Malaysia", "Jordanien", "Libanon", "Malediven",
        "Dominikanische Republik|Dom Rep|Dominikanische Rep.", "Costa Rica", "Ecuador", "Uruguay", "Panama",
        "Äthiopien", "Tansania"
      ],
      schwer: [
        "Burkina Faso", "Bhutan", "Kirgisistan", "Tadschikistan", "Turkmenistan", "Usbekistan",
        "Eswatini|Swasiland", "Lesotho", "Dschibuti", "Eritrea", "Malawi", "Burundi", "Suriname",
        "Guyana", "Paraguay", "Moldau|Moldawien|Republik Moldau", "Liechtenstein", "Andorra",
        "San Marino", "Brunei", "Laos", "Myanmar|Birma", "Mauretanien", "Tuvalu", "Vanuatu",
        "Palau", "Kiribati", "Nauru", "Tschad", "Benin", "Togo", "Gabun", "Montenegro",
        "Nordmazedonien|Mazedonien",
        "Armenien", "Aserbaidschan", "Bangladesch", "Kuwait", "Oman", "Jemen", "Bolivien", "Guatemala",
        "Honduras", "Haiti", "Ghana", "Senegal", "Uganda", "Ruanda", "Namibia", "Simbabwe", "Mauritius",
        "Seychellen", "Fidschi|Fiji", "Kambodscha", "Algerien", "Somalia"
      ]
    }
  },

  staedte: {
    name: "Städte",
    icon: "",
    words: {
      leicht: [
        "Berlin", "Hamburg", "München|Muenchen", "Köln|Koeln", "Frankfurt|Frankfurt am Main", "Stuttgart",
        "Düsseldorf|Duesseldorf", "Dresden", "Leipzig", "Paris", "London", "Rom", "New York|New York City|NYC",
        "Wien", "Madrid", "Barcelona", "Amsterdam", "Tokio|Tokyo", "Moskau", "Istanbul", "Prag", "Venedig",
        "Los Angeles|LA", "Dubai",
        "Bonn", "Mainz", "Essen", "Potsdam", "Wolfsburg", "Bielefeld", "Karlsruhe", "Augsburg", "Münster",
        "Mannheim", "Mailand|Milano|Milan", "Florenz|Firenze", "Neapel|Napoli|Naples", "Pisa", "Chicago",
        "Miami", "Washington|Washington D.C.", "Bangkok", "Hongkong", "Seoul", "Shanghai", "Salzburg",
        "Liverpool", "Manchester", "Jerusalem"
      ],
      mittel: [
        "Bremen", "Hannover", "Nürnberg|Nuernberg", "Dortmund", "Heidelberg", "Freiburg", "Rostock", "Kiel",
        "Lissabon", "Athen", "Kopenhagen", "Stockholm", "Oslo", "Budapest", "Warschau", "Zürich|Zuerich",
        "Brüssel|Bruessel", "Dublin", "Edinburgh", "Sydney", "Rio de Janeiro|Rio", "Kairo", "Peking|Beijing",
        "Singapur", "Las Vegas", "San Francisco",
        "Aachen", "Wiesbaden", "Saarbrücken", "Magdeburg", "Weimar", "Würzburg", "Ulm", "Kassel",
        "Braunschweig", "Gelsenkirchen", "Bochum", "Konstanz", "Toronto", "Vancouver", "Boston",
        "New Orleans", "Melbourne", "Mumbai|Bombay", "Marseille", "Nizza|Nice", "Verona",
        "Genf|Genève|Geneva", "Dubrovnik", "Antalya", "Kiew|Kyjiw|Kyiv"
      ],
      schwer: [
        "Görlitz", "Bamberg", "Lübeck", "Erfurt", "Regensburg", "Trier", "Passau", "Flensburg", "Ljubljana",
        "Tallinn", "Riga", "Vilnius", "Krakau", "Danzig", "Porto", "Sevilla", "Marrakesch", "Reykjavík|Reykjavik",
        "Kapstadt", "Buenos Aires", "Havanna", "Hanoi", "Kyoto", "Montreal", "Valletta",
        "Stralsund", "Wismar", "Lüneburg", "Goslar", "Rothenburg ob der Tauber|Rothenburg", "Bayreuth",
        "Chemnitz", "Schwerin", "Cottbus", "Quedlinburg", "Wuppertal", "Baden-Baden", "Bratislava",
        "Belgrad|Beograd", "Sarajevo", "Bukarest|București|Bucharest", "Innsbruck",
        "Mexiko-Stadt|Mexico City|Mexiko City", "Lima", "Nairobi", "Osaka", "Bergen", "Granada", "Bologna",
        "Lyon"
      ]
    }
  },

  automarken: {
    name: "Automarken",
    icon: "",
    words: {
      leicht: [
        "Volkswagen|VW", "BMW", "Mercedes-Benz|Mercedes", "Audi", "Porsche", "Opel", "Ford", "Toyota", "Ferrari",
        "Lamborghini", "Tesla", "Fiat", "Renault", "Peugeot", "Škoda|Skoda", "Seat", "Honda", "Hyundai", "Kia",
        "Volvo", "Mini", "Smart", "Nissan", "Citroën|Citroen"
      ],
      mittel: [
        "Mazda", "Jeep", "Land Rover", "Jaguar", "Bentley", "Rolls-Royce|Rolls Royce", "Aston Martin", "Maserati",
        "Alfa Romeo", "Bugatti", "Dacia", "Cupra", "Subaru", "Mitsubishi", "Suzuki", "Lexus", "Chevrolet", "Dodge",
        "Cadillac", "McLaren", "Lancia", "Polestar", "Lotus", "BYD"
      ],
      schwer: [
        "Koenigsegg", "Pagani", "Rimac", "Lada", "Trabant|Trabi", "Wartburg", "DS Automobiles|DS", "Genesis",
        "Infiniti", "Acura", "Lincoln", "Buick", "Chrysler", "Saab", "Rover", "Abarth", "Alpine", "Morgan",
        "Lynk & Co|Lynk and Co", "NIO", "Xpeng", "MG", "Hummer", "Daihatsu", "Tata"
      ]
    }
  },
  geschichte: {
    name: "Historische Persönlichkeiten",
    icon: "",
    person: true,
    words: {
      leicht: [
        "Albert Einstein", "Napoleon|Napoleon Bonaparte", "Julius Caesar|Caesar|Cäsar", "Kleopatra|Cleopatra",
        "Martin Luther", "Johann Wolfgang von Goethe|Goethe", "Ludwig van Beethoven|Beethoven",
        "Wolfgang Amadeus Mozart|Mozart", "Christoph Kolumbus|Kolumbus", "Leonardo da Vinci|Da Vinci",
        "Abraham Lincoln", "Martin Luther King", "Mahatma Gandhi|Gandhi", "Isaac Newton",
        "Otto von Bismarck|Bismarck", "Karl der Große|Karl der Grosse", "Alexander der Große|Alexander der Grosse",
        "Marie Curie", "William Shakespeare", "Konrad Adenauer", "Queen Elizabeth II.|Queen Elizabeth|Elisabeth II."
      ],
      mittel: [
        "Friedrich der Große|Friedrich der Grosse|Der Alte Fritz", "Galileo Galilei|Galilei", "Charles Darwin",
        "Nelson Mandela", "Johann Sebastian Bach|Bach", "Karl Marx", "Sigmund Freud",
        "Dschingis Khan|Genghis Khan", "Marco Polo", "Johannes Gutenberg", "Michelangelo",
        "Winston Churchill", "Che Guevara", "Jeanne d'Arc|Johanna von Orleans", "Sophie Scholl",
        "Willy Brandt", "Marie Antoinette", "Nikola Tesla", "Florence Nightingale", "Ramses II.|Ramses",
        "Tutanchamun", "Thomas Edison"
      ],
      schwer: [
        "Hildegard von Bingen", "Friedrich Barbarossa|Barbarossa", "Kaiserin Sisi|Sisi|Elisabeth von Österreich",
        "Otto der Große|Otto der Grosse", "Hannibal", "Konfuzius", "Sokrates", "Aristoteles",
        "Immanuel Kant", "Ada Lovelace", "Simón Bolívar|Simon Bolivar", "Katharina die Große|Katharina die Grosse",
        "Suleiman der Prächtige|Süleyman", "Alexander von Humboldt", "Albrecht Dürer", "Hammurabi",
        "Nofretete", "Maria Theresia", "Wilhelm II.|Kaiser Wilhelm", "Rosa Luxemburg", "Karl V.",
        "Mustafa Kemal Atatürk|Atatürk", "Attila"
      ]
    }
  },

  politiker: {
    name: "Politiker",
    icon: "",
    person: true,
    words: {
      leicht: [
        "Olaf Scholz", "Friedrich Merz", "Angela Merkel", "Donald Trump", "Joe Biden", "Barack Obama",
        "Emmanuel Macron", "Wladimir Putin|Vladimir Putin|Putin", "Wolodymyr Selenskyj|Selenskyj|Selensky|Zelensky",
        "Robert Habeck", "Annalena Baerbock", "Christian Lindner", "Markus Söder|Markus Soeder", "Alice Weidel",
        "Sahra Wagenknecht", "Boris Pistorius", "Karl Lauterbach", "Frank-Walter Steinmeier|Steinmeier",
        "Ursula von der Leyen|von der Leyen", "Kamala Harris", "Xi Jinping", "Recep Tayyip Erdoğan|Erdoğan|Erdogan",
        "Giorgia Meloni", "Keir Starmer"
      ],
      mittel: [
        "Lars Klingbeil", "Saskia Esken", "Hubertus Heil", "Nancy Faeser", "Cem Özdemir|Cem Oezdemir",
        "Hendrik Wüst|Hendrik Wuest", "Bodo Ramelow", "Winfried Kretschmann", "Gregor Gysi", "Wolfgang Kubicki",
        "Jens Spahn", "Carsten Linnemann", "Tino Chrupalla", "Ricarda Lang", "Kevin Kühnert|Kevin Kuehnert",
        "Manuela Schwesig", "Bärbel Bas|Baerbel Bas", "Julia Klöckner|Julia Kloeckner",
        "Benjamin Netanjahu|Netanjahu|Netanyahu", "Viktor Orbán|Viktor Orban|Orbán|Orban", "Narendra Modi",
        "Justin Trudeau", "Javier Milei", "Annegret Kramp-Karrenbauer|Kramp-Karrenbauer|AKK"
      ],
      schwer: [
        "Marco Buschmann", "Michael Kretschmer", "Daniel Günther|Daniel Guenther", "Dietmar Woidke", "Kai Wegner",
        "Peter Tschentscher", "Omid Nouripour", "Franziska Giffey", "Sigmar Gabriel", "Peer Steinbrück",
        "Joschka Fischer", "Gerhard Schröder|Gerhard Schroeder", "Christian Wulff", "Joachim Gauck", "Horst Seehofer",
        "Armin Laschet", "Pedro Sánchez|Pedro Sanchez", "Lula da Silva|Lula", "Claudia Sheinbaum", "Mark Rutte",
        "Donald Tusk", "Alexander Van der Bellen|Van der Bellen", "Kim Jong-un|Kim Jong Un", "Mario Voigt",
        "Volker Wissing"
      ]
    }
  },

  schauspieler: {
    name: "Schauspieler",
    icon: "",
    person: true,
    words: {
      leicht: [
        "Leonardo DiCaprio", "Brad Pitt", "Tom Cruise", "Johnny Depp", "Angelina Jolie", "Will Smith",
        "Scarlett Johansson", "Tom Hanks", "Jennifer Aniston", "Til Schweiger", "Matthias Schweighöfer|Matthias Schweighoefer",
        "Elyas M'Barek|Elyas MBarek", "Arnold Schwarzenegger", "Keanu Reeves", "Dwayne Johnson|The Rock",
        "Jackie Chan", "Emma Watson", "Daniel Radcliffe", "Robert Downey Jr.|Robert Downey Jr|Robert Downey",
        "Julia Roberts", "Morgan Freeman", "Margot Robbie", "Ryan Reynolds", "Zendaya"
      ],
      mittel: [
        "Timothée Chalamet|Timothee Chalamet", "Florence Pugh", "Pedro Pascal", "Cillian Murphy", "Ryan Gosling",
        "Natalie Portman", "Meryl Streep", "Denzel Washington", "Christian Bale", "Anne Hathaway", "Chris Hemsworth",
        "Jennifer Lawrence", "Hugh Jackman", "Sandra Bullock", "Diane Kruger", "Daniel Brühl|Daniel Bruehl",
        "Christoph Waltz", "Moritz Bleibtreu", "Nora Tschirner", "Karoline Herfurth", "Florian David Fitz|Fitz",
        "Heike Makatsch", "Iris Berben", "Uwe Ochsenknecht"
      ],
      schwer: [
        "Sandra Hüller|Sandra Hueller", "Benno Fürmann|Benno Fuermann", "Jella Haase", "Tom Schilling", "August Diehl",
        "Lars Eidinger", "Nina Hoss", "Alexander Fehling", "Jessica Schwarz", "Wotan Wilke Möhring|Möhring|Moehring",
        "Ulrich Tukur", "Martina Gedeck", "Anya Taylor-Joy", "Austin Butler", "Jenna Ortega", "Paul Mescal",
        "Saoirse Ronan", "Tilda Swinton", "Willem Dafoe", "Joaquin Phoenix", "Mads Mikkelsen", "Javier Bardem",
        "Penélope Cruz|Penelope Cruz", "Frances McDormand", "Adam Driver"
      ]
    }
  },

  musiker: {
    name: "Musiker & Bands",
    icon: "",
    person: true,
    words: {
      leicht: [
        "Taylor Swift", "Ed Sheeran", "Beyoncé|Beyonce", "Rihanna", "Lady Gaga", "Michael Jackson", "Madonna",
        "Elvis Presley|Elvis", "The Beatles|Beatles", "Queen", "ABBA", "Rammstein", "Die Toten Hosen|Toten Hosen",
        "Die Ärzte|Ärzte|Die Aerzte", "Herbert Grönemeyer|Grönemeyer|Groenemeyer", "Helene Fischer", "Mark Forster",
        "Coldplay", "Eminem", "Justin Bieber", "Billie Eilish", "Adele", "Nena", "Udo Lindenberg", "AC/DC|ACDC"
      ],
      mittel: [
        "Kraftklub", "Peter Fox", "Seeed", "Cro", "Apache 207", "Capital Bra", "Sido", "Bushido", "Wincent Weiss",
        "Max Giesinger", "AnnenMayKantereit", "Silbermond", "Juli", "Tokio Hotel", "Scooter", "Dua Lipa",
        "Harry Styles", "The Weeknd|Weeknd", "Bruno Mars", "Imagine Dragons", "Linkin Park", "Metallica", "Nirvana",
        "Pink Floyd", "The Rolling Stones|Rolling Stones"
      ],
      schwer: [
        "Kraftwerk", "Die Fantastischen Vier|Fantastischen Vier|Fanta 4|Fanta Vier", "Element of Crime", "Tocotronic",
        "Wir sind Helden", "Die Prinzen|Prinzen", "Annett Louisan", "Clueso", "Faber", "Provinz", "Giant Rooks",
        "Trettmann", "K.I.Z|KIZ", "Deichkind", "Fettes Brot", "Arctic Monkeys", "Radiohead", "Fleetwood Mac",
        "Depeche Mode", "Daft Punk", "Florence and the Machine|Florence + the Machine", "Hozier", "Lana Del Rey",
        "Tame Impala", "Gorillaz"
      ]
    }
  },
  streamer: {
    name: "Deutsche Streamer",
    icon: "",
    words: {
      leicht: [
        "MontanaBlack|Monte|Montana Black", "Knossi", "Trymacs", "Papaplatte", "HandOfBlood|Hand of Blood",
        "Gronkh", "Rewinside", "Paluten", "EliasN97|Elias", "Reved", "Unge|Ungespielt",
        "Sidneyeweka|Sidney", "Rumathra", "Tanzverbot", "Gamerbrother"
      ],
      mittel: [
        "Staiy", "Mahluna", "NoWay4u|NoWay", "Zarbex", "Dner", "Stegi", "BastiGHG|Basti", "Maxim",
        "PietSmiet", "Zombey", "GermanLetsPlay", "AbuGoku9999|AbuGoku", "Wichtiger", "Ron Bielecki",
        "LetsHugo|Hugo", "Krokoboss", "Bonjwa", "Kayzahr", "Amar", "MckyTV|Mcky"
      ],
      schwer: [
        "Pandorya", "Shurjoka", "Dhalucard", "Lara Loft", "Gnu", "Eligella", "Hänno", "Filow",
        "Erné|Erne", "Tolkin", "Nooreax", "Wakez", "Schradin", "XRanger"
      ]
    }
  },

  essen: {
    name: "Lebensmittel",
    icon: "",
    words: {
      leicht: [
        "Apfel", "Banane", "Erdbeere", "Kirsche", "Birne", "Orange|Apfelsine", "Zitrone", "Tomate",
        "Gurke", "Karotte|Möhre|Mohrrübe", "Kartoffel", "Paprika", "Zwiebel", "Weintraube|Traube",
        "Wassermelone|Melone", "Ananas", "Brokkoli|Broccoli", "Salat|Kopfsalat", "Mais", "Pfirsich",
        "Brot", "Brötchen|Semmel|Schrippe", "Brezel|Breze|Brezn", "Käse", "Butter", "Ei|Eier", "Milch",
        "Honig", "Nudeln|Pasta", "Reis", "Pizza", "Pommes|Pommes frites", "Schokolade",
        "Pfannkuchen|Eierkuchen", "Suppe", "Hamburger|Burger", "Würstchen|Wurst", "Joghurt", "Kuchen",
        "Eis|Speiseeis|Eiscreme", "Müsli", "Salz", "Popcorn"
      ],
      mittel: [
        "Mango", "Kiwi", "Zucchini", "Aubergine", "Blumenkohl", "Spinat", "Himbeere",
        "Heidelbeere|Blaubeere", "Granatapfel", "Avocado", "Kokosnuss", "Feige", "Pflaume|Zwetschge",
        "Aprikose|Marille", "Rosenkohl", "Spargel", "Lauch|Porree", "Kürbis", "Radieschen",
        "Sellerie", "Rote Bete|Rote Beete", "Grapefruit", "Kohlrabi",
        "Schnitzel", "Currywurst", "Döner|Döner Kebab|Kebab", "Lasagne", "Sushi", "Spaghetti",
        "Croissant", "Baguette", "Kartoffelsalat", "Raclette", "Fondue", "Knödel|Klöße|Kloß", "Spätzle",
        "Sauerkraut", "Lebkuchen", "Quark", "Tofu", "Falafel", "Pesto", "Waffel|Waffeln", "Rührei",
        "Gulasch"
      ],
      schwer: [
        "Pastinake", "Topinambur", "Mangold", "Romanesco", "Schwarzwurzel", "Physalis", "Litschi",
        "Kaki|Sharonfrucht", "Drachenfrucht|Pitaya", "Kumquat", "Maracuja|Passionsfrucht", "Okra",
        "Artischocke", "Fenchel", "Stachelbeere", "Quitte", "Johannisbeere", "Rhabarber",
        "Steckrübe", "Pak Choi", "Mirabelle", "Sternfrucht|Karambole", "Papaya", "Chicorée|Chicoree",
        "Kimchi", "Hummus", "Tiramisu", "Gazpacho", "Labskaus", "Saumagen", "Pumpernickel",
        "Kaiserschmarrn|Kaiserschmarren", "Ramen", "Couscous", "Polenta", "Risotto", "Tempeh",
        "Halloumi", "Tahini|Tahin", "Miso", "Ceviche", "Schupfnudeln", "Maultaschen", "Flammkuchen",
        "Grünkohl", "Tapenade"
      ]
    }
  },

  tiere: {
    name: "Tiere",
    icon: "",
    words: {
      leicht: [
        "Hund", "Katze", "Pferd", "Kuh", "Schwein", "Schaf", "Ziege", "Huhn", "Elefant", "Löwe|Loewe", "Tiger",
        "Giraffe", "Affe", "Bär|Baer", "Hase", "Maus", "Delfin|Delphin", "Hai", "Pinguin", "Krokodil", "Schlange",
        "Frosch", "Eule", "Fuchs", "Igel",
        "Ente", "Gans", "Esel", "Hamster", "Meerschweinchen", "Kaninchen", "Eichhörnchen", "Reh", "Hirsch",
        "Wildschwein", "Spinne", "Biene", "Schmetterling", "Marienkäfer", "Ameise", "Schnecke", "Storch",
        "Taube", "Ratte", "Fledermaus", "Eisbär", "Goldfisch"
      ],
      mittel: [
        "Känguru|Kaenguru", "Koala", "Zebra", "Nashorn", "Nilpferd|Flusspferd", "Gorilla", "Panda", "Wolf", "Luchs",
        "Biber", "Otter", "Faultier", "Flamingo", "Papagei", "Adler", "Schildkröte|Schildkroete", "Chamäleon|Chamaeleon",
        "Qualle", "Tintenfisch|Krake|Oktopus", "Robbe|Seehund", "Wal", "Kamel", "Lama", "Waschbär|Waschbaer",
        "Erdmännchen|Erdmaennchen",
        "Leopard", "Hyäne", "Strauß|Vogel Strauß", "Pfau", "Specht", "Elch", "Rentier", "Walross",
        "Seestern", "Kranich", "Libelle", "Wespe", "Maulwurf", "Wellensittich", "Kojote", "Orang-Utan",
        "Schimpanse", "Möwe", "Eidechse", "Skorpion", "Schwan", "Krabbe"
      ],
      schwer: [
        "Axolotl", "Okapi", "Schnabeltier", "Gürteltier|Guerteltier", "Ameisenbär|Ameisenbaer", "Tapir",
        "Capybara|Wasserschwein", "Gnu", "Yak", "Komodowaran", "Narwal", "Pfeilgiftfrosch", "Seepferdchen", "Pelikan",
        "Kolibri", "Tukan", "Fennek|Wüstenfuchs", "Vielfraß|Vielfrass", "Dachs", "Hermelin", "Stachelschwein", "Mungo",
        "Gepard", "Leguan", "Mantarochen|Manta",
        "Wombat", "Lemur|Katta", "Schneeleopard", "Vogelspinne", "Anakonda", "Piranha", "Gottesanbeterin",
        "Kugelfisch", "Clownfisch|Anemonenfisch", "Albatros", "Feuersalamander", "Murmeltier", "Steinbock",
        "Warzenschwein", "Pavian", "Erdferkel", "Tasmanischer Teufel|Beutelteufel", "Dingo",
        "Siebenschläfer", "Bison|Büffel", "Uhu", "Alpaka"
      ]
    }
  },

  fussballer: {
    name: "Fußballer",
    icon: "",
    person: true,
    words: {
      leicht: [
        "Lionel Messi", "Cristiano Ronaldo|CR7", "Thomas Müller|Thomas Mueller", "Manuel Neuer", "Toni Kroos", "Neymar",
        "Kylian Mbappé|Kylian Mbappe", "Erling Haaland", "Robert Lewandowski", "Harry Kane", "Jamal Musiala",
        "Florian Wirtz", "Joshua Kimmich", "Mesut Özil|Mesut Oezil", "Bastian Schweinsteiger", "Philipp Lahm",
        "Miroslav Klose", "Oliver Kahn", "Franz Beckenbauer", "Zinedine Zidane", "David Beckham", "Diego Maradona",
        "Pelé|Pele", "Mohamed Salah", "Kevin De Bruyne|De Bruyne"
      ],
      mittel: [
        "İlkay Gündoğan|Ilkay Gündogan|Ilkay Guendogan|Gündogan", "Antonio Rüdiger|Antonio Ruediger",
        "Leroy Sané|Leroy Sane", "Kai Havertz", "Marc-André ter Stegen|ter Stegen", "Leon Goretzka",
        "Niclas Füllkrug|Niclas Fuellkrug", "Mats Hummels", "Marco Reus", "Jérôme Boateng|Jerome Boateng",
        "Lukas Podolski", "Michael Ballack", "Jürgen Klinsmann|Juergen Klinsmann", "Lothar Matthäus|Lothar Matthaeus",
        "Gerd Müller|Gerd Mueller", "Vinícius Júnior|Vinicius Junior|Vinicius", "Jude Bellingham",
        "Luka Modrić|Luka Modric", "Virgil van Dijk|van Dijk", "Zlatan Ibrahimović|Zlatan Ibrahimovic|Zlatan",
        "Ronaldinho", "Andrés Iniesta|Andres Iniesta", "Thierry Henry", "Wayne Rooney", "Lamine Yamal"
      ],
      schwer: [
        "Rudi Völler|Rudi Voeller", "Uwe Seeler", "Sepp Maier", "Paul Breitner", "Günter Netzer|Guenter Netzer",
        "Andreas Brehme", "Mario Götze|Mario Goetze", "André Schürrle|Andre Schuerrle", "Per Mertesacker",
        "Benedikt Höwedes|Benedikt Hoewedes", "Granit Xhaka", "Alphonso Davies", "Xabi Alonso", "Kaká|Kaka",
        "Johan Cruyff", "Ferenc Puskás|Ferenc Puskas", "Eusébio|Eusebio", "Paolo Maldini", "Andrea Pirlo",
        "Gianluigi Buffon", "Iker Casillas", "Rivaldo", "Arjen Robben", "Franck Ribéry|Franck Ribery",
        "Arturo Vidal"
      ]
    }
  },

  sportler: {
    name: "Sportler (ohne Fußball)",
    icon: "",
    person: true,
    words: {
      leicht: [
        "Michael Schumacher", "Sebastian Vettel", "Lewis Hamilton", "Max Verstappen", "Roger Federer",
        "Serena Williams", "Rafael Nadal", "Novak Đoković|Novak Djokovic", "Boris Becker", "Steffi Graf",
        "Alexander Zverev", "Usain Bolt", "Michael Phelps", "Muhammad Ali", "Mike Tyson", "Michael Jordan",
        "LeBron James", "Dirk Nowitzki", "Tiger Woods", "Wladimir Klitschko", "Vitali Klitschko", "Conor McGregor",
        "Simone Biles", "Kobe Bryant", "Mick Schumacher"
      ],
      mittel: [
        "Dennis Schröder|Dennis Schroeder", "Franz Wagner", "Angelique Kerber", "Nico Rosberg", "Henry Maske",
        "Regina Halmich", "Timo Boll", "Laura Dahlmeier", "Magdalena Neuner", "Felix Neureuther",
        "Katarina Witt|Kati Witt", "Malaika Mihambo", "Carl Lewis", "Shaquille O'Neal|Shaquille ONeal|Shaq",
        "Stephen Curry", "Tom Brady", "Wayne Gretzky", "Carlos Alcaraz", "Jannik Sinner", "Charles Leclerc",
        "Fernando Alonso", "Ayrton Senna", "Tadej Pogačar|Tadej Pogacar", "Lindsey Vonn", "Niki Lauda"
      ],
      schwer: [
        "Jan Ullrich", "Erik Zabel", "Britta Steffen", "Fabian Hambüchen|Fabian Hambuechen", "Heike Drechsler",
        "Robert Harting", "Gina Lückenkemper|Gina Lueckenkemper", "Leon Draisaitl", "Patrick Mahomes",
        "Mikaela Shiffrin", "Marcel Hirscher", "Eliud Kipchoge", "Armand Duplantis|Mondo Duplantis",
        "Nadia Comăneci|Nadia Comaneci", "Martina Navrátilová|Martina Navratilova", "Björn Borg|Bjoern Borg",
        "Andre Agassi", "Pete Sampras", "Valentino Rossi", "Kimi Räikkönen|Kimi Raikkonen", "Ronnie O'Sullivan|Ronnie OSullivan",
        "Phil Taylor", "Luke Littler", "Johannes Vetter", "Wilt Chamberlain"
      ]
    }
  },

  sehenswuerdigkeiten: {
    name: "Sehenswürdigkeiten",
    icon: "",
    words: {
      leicht: [
        "Eiffelturm", "Brandenburger Tor", "Kölner Dom|Koelner Dom", "Schloss Neuschwanstein|Neuschwanstein",
        "Freiheitsstatue", "Big Ben", "Kolosseum", "Schiefer Turm von Pisa|Turm von Pisa",
        "Pyramiden von Gizeh|Pyramiden", "Chinesische Mauer", "Taj Mahal", "Golden Gate Bridge",
        "Sagrada Família|Sagrada Familia", "Akropolis", "Stonehenge", "Machu Picchu", "Niagarafälle|Niagarafaelle",
        "Grand Canyon", "Mount Everest", "Reichstagsgebäude|Reichstag", "Burj Khalifa",
        "Opernhaus Sydney|Sydney Opera House", "Tower Bridge", "Hollywood-Schriftzug|Hollywood Sign",
        "Christusstatue|Cristo Redentor",
        "Notre-Dame|Kathedrale Notre-Dame", "Schloss Versailles|Versailles", "Weißes Haus|White House",
        "Mount Rushmore", "Sphinx|Große Sphinx", "Disneyland", "Central Park", "London Eye",
        "Kilimandscharo|Kilimanjaro", "Fuji|Mount Fuji|Fudschijama", "Allianz Arena",
        "Berliner Mauer|East Side Gallery", "Checkpoint Charlie", "Siegessäule", "Totes Meer",
        "Tower of London", "Hollywood Walk of Fame|Walk of Fame", "Wembley-Stadion|Wembley",
        "Brooklyn Bridge", "Kaaba"
      ],
      mittel: [
        "Zugspitze", "Elbphilharmonie", "Berliner Fernsehturm|Fernsehturm", "Hofbräuhaus|Hofbraeuhaus", "Holstentor",
        "Frauenkirche", "Zwinger", "Hermannsdenkmal", "Loreley", "Matterhorn", "Mont-Saint-Michel|Mont Saint Michel",
        "Louvre", "Triumphbogen|Arc de Triomphe", "Petersdom", "Trevi-Brunnen|Trevibrunnen", "Alhambra",
        "Buckingham Palace|Buckingham-Palast", "Empire State Building", "Times Square", "Angkor Wat", "Petra",
        "Chichén Itzá|Chichen Itza", "Uluru|Ayers Rock", "Victoriafälle|Victoriafaelle", "Kreml",
        "Sixtinische Kapelle", "Pantheon", "Rialtobrücke|Rialto", "Markusplatz", "Stephansdom",
        "Schloss Schönbrunn|Schönbrunn", "Hamburger Michel|Michel", "Miniatur Wunderland", "Speicherstadt",
        "Königssee", "Nordkap", "Westminster Abbey", "Alcatraz", "Yellowstone|Yellowstone-Nationalpark",
        "Roter Platz", "Blaue Moschee|Sultan-Ahmed-Moschee", "Burj al Arab", "Klagemauer", "Marienplatz",
        "Palm Jumeirah", "Galápagos-Inseln|Galapagos"
      ],
      schwer: [
        "Externsteine", "Wartburg", "Bastei", "Kreidefelsen auf Rügen|Kreidefelsen", "Völkerschlachtdenkmal",
        "Porta Nigra", "Walhalla", "Schloss Sanssouci|Sanssouci", "Atomium", "Manneken Pis", "Hagia Sophia",
        "Meteora", "Plitvicer Seen", "Kappadokien", "Moai|Osterinsel-Statuen", "Halong-Bucht|Ha-Long-Bucht",
        "Borobudur", "Verbotene Stadt", "Fushimi Inari", "Salar de Uyuni", "Iguazú-Wasserfälle|Iguazu-Wasserfälle",
        "Antelope Canyon", "Burg Eltz", "Dolomiten", "Pamukkale",
        "Heidelberger Schloss|Schloss Heidelberg", "Burg Hohenzollern",
        "Kaiser-Wilhelm-Gedächtniskirche|Gedächtniskirche", "Ulmer Münster", "Aachener Dom",
        "Zeche Zollverein", "Brocken", "Abu Simbel", "Tal der Könige", "Hoover Dam|Hoover-Damm",
        "Potala-Palast|Potala", "Pont du Gard", "Basilius-Kathedrale", "Großer Basar|Grand Bazaar",
        "Cliffs of Moher", "Giant's Causeway", "Geirangerfjord", "Blaue Lagune|Blue Lagoon",
        "Goldener Tempel", "Schloss Schwerin|Schweriner Schloss", "Kaiserdom Speyer|Speyerer Dom"
      ]
    }
  },

  berufe: {
    name: "Berufe",
    icon: "",
    words: {
      leicht: [
        "Arzt|Ärztin|Aerztin|Doktor|Doktorin", "Lehrer|Lehrerin", "Polizist|Polizistin", "Feuerwehrmann|Feuerwehrfrau|Feuerwehrleute",
        "Bäcker|Bäckerin|Baecker|Baeckerin", "Koch|Köchin|Koechin", "Friseur|Friseurin|Frisör|Frisörin|Friseuse",
        "Pilot|Pilotin", "Landwirt|Landwirtin|Bauer|Bäuerin", "Tierarzt|Tierärztin|Tieraerztin",
        "Zahnarzt|Zahnärztin|Zahnaerztin", "Verkäufer|Verkäuferin|Kassierer|Kassiererin", "Busfahrer|Busfahrerin",
        "Pflegekraft|Krankenpfleger|Krankenpflegerin|Krankenschwester|Pflegefachkraft|Pflegefachfrau|Pflegefachmann",
        "Maler|Malerin|Anstreicher|Lackierer", "Elektriker|Elektrikerin|Elektroniker|Elektronikerin",
        "Kfz-Mechatroniker|Kfz-Mechatronikerin|Mechaniker|Mechanikerin|Automechaniker", "Briefträger|Briefträgerin|Postbote|Postbotin",
        "Gärtner|Gärtnerin|Gaertner", "Metzger|Metzgerin|Fleischer|Fleischerin|Schlachter", "Kellner|Kellnerin|Servicekraft|Bedienung",
        "Sänger|Sängerin|Saenger", "Schauspieler|Schauspielerin", "Astronaut|Astronautin", "Bauarbeiter|Bauarbeiterin",
        "Tierpfleger|Tierpflegerin|Zoowärter", "Müllmann|Müllfrau|Müllwerker", "Hausmeister|Hausmeisterin",
        "Influencer|Influencerin|Youtuber", "DJ|Discjockey|DJane", "Zauberer|Zauberin|Magier",
        "Clown|Clownin", "Lkw-Fahrer|Lkw-Fahrerin|Trucker|Fernfahrer", "Detektiv|Detektivin|Privatdetektiv",
        "Soldat|Soldatin", "Bademeister|Bademeisterin|Rettungsschwimmer",
        "Notfallsanitäter|Sanitäter|Rettungssanitäter", "Fischer|Fischerin", "Kapitän|Kapitänin", "Model",
        "Tänzer|Tänzerin", "Schneider|Schneiderin", "Reinigungskraft|Putzkraft|Putzfrau|Gebäudereiniger",
        "Paketbote|Paketbotin|Paketzusteller", "Fußballprofi|Profifußballer"
      ],
      mittel: [
        "Architekt|Architektin", "Rechtsanwalt|Rechtsanwältin|Anwalt|Anwältin", "Richter|Richterin",
        "Journalist|Journalistin|Reporter|Reporterin", "Bankkaufmann|Bankkauffrau|Bankfachangestellter|Bankfachangestellte|Bankangestellter|Bankangestellte|Banker|Bankerin",
        "Apotheker|Apothekerin", "Tischler|Tischlerin|Schreiner|Schreinerin", "Dachdecker|Dachdeckerin",
        "Klempner|Klempnerin|Installateur|Installateurin|Sanitärinstallateur|Anlagenmechaniker", "Fotograf|Fotografin",
        "Hebamme|Entbindungspfleger", "Physiotherapeut|Physiotherapeutin|Krankengymnast",
        "Softwareentwickler|Softwareentwicklerin|Programmierer|Programmiererin|Informatiker|Informatikerin|Entwickler",
        "Ingenieur|Ingenieurin", "Steuerberater|Steuerberaterin", "Erzieher|Erzieherin|Kindergärtner|Kindergärtnerin",
        "Psychologe|Psychologin|Psychotherapeut|Psychotherapeutin", "Bibliothekar|Bibliothekarin", "Optiker|Optikerin|Augenoptiker",
        "Maurer|Maurerin", "Schornsteinfeger|Schornsteinfegerin|Kaminkehrer|Kaminfeger", "Taxifahrer|Taxifahrerin",
        "Lokführer|Lokführerin|Lokfuehrer|Triebfahrzeugführer", "Flugbegleiter|Flugbegleiterin|Stewardess|Steward",
        "Pfarrer|Pfarrerin|Pastor|Pastorin|Priester",
        "Tätowierer|Tätowiererin", "Kosmetiker|Kosmetikerin", "Florist|Floristin|Blumenhändler",
        "Zugbegleiter|Zugbegleiterin|Schaffner|Schaffnerin", "Türsteher|Türsteherin",
        "Rezeptionist|Rezeptionistin|Empfangsmitarbeiter",
        "Fitnesstrainer|Fitnesstrainerin|Personal Trainer", "Fahrlehrer|Fahrlehrerin",
        "Immobilienmakler|Immobilienmaklerin|Makler|Maklerin", "Bürgermeister|Bürgermeisterin",
        "Chirurg|Chirurgin", "Grafikdesigner|Grafikdesignerin|Designer", "Moderator|Moderatorin",
        "Regisseur|Regisseurin", "Barkeeper|Barkeeperin|Barmann", "Sekretär|Sekretärin|Assistenz",
        "Versicherungsvertreter|Versicherungsvertreterin|Versicherungsmakler",
        "Zollbeamter|Zollbeamtin|Zöllner", "Fliesenleger|Fliesenlegerin",
        "Medizinische Fachangestellte|Arzthelfer|Arzthelferin|MFA", "Stuntman|Stuntfrau|Stuntwoman"
      ],
      schwer: [
        "Notar|Notarin", "Hufschmied|Hufschmiedin|Schmied", "Goldschmied|Goldschmiedin|Juwelier", "Uhrmacher|Uhrmacherin",
        "Steinmetz|Steinmetzin", "Imker|Imkerin", "Winzer|Winzerin", "Förster|Försterin|Foerster", "Schäfer|Schäferin|Schaefer",
        "Bestatter|Bestatterin", "Kammerjäger|Kammerjägerin|Schädlingsbekämpfer", "Dolmetscher|Dolmetscherin|Übersetzer|Übersetzerin",
        "Archäologe|Archäologin|Archaeologe", "Meteorologe|Meteorologin", "Sommelier|Sommelière|Sommeliere",
        "Konditor|Konditorin", "Restaurator|Restauratorin", "Orthopädietechniker|Orthopädietechnikerin",
        "Hörakustiker|Hörakustikerin|Hörgeräteakustiker", "Glaser|Glaserin", "Raumausstatter|Raumausstatterin",
        "Zahntechniker|Zahntechnikerin", "Fluglotse|Fluglotsin", "Gerichtsvollzieher|Gerichtsvollzieherin",
        "Böttcher|Küfer|Boettcher",
        "Dirigent|Dirigentin", "Leuchtturmwärter", "Bergführer|Bergführerin",
        "Sprengmeister|Sprengmeisterin", "Töpfer|Töpferin|Keramiker", "Buchbinder|Buchbinderin",
        "Kartograf|Kartografin|Kartograph", "Geologe|Geologin", "Astronom|Astronomin", "Butler",
        "Croupier|Croupière", "Auktionator|Auktionatorin", "Diplomat|Diplomatin|Botschafter|Botschafterin",
        "Rechtsmediziner|Rechtsmedizinerin|Gerichtsmediziner", "Anästhesist|Anästhesistin|Narkosearzt",
        "Kranführer|Kranführerin", "Sattler|Sattlerin", "Tierpräparator|Präparator",
        "Parfümeur|Parfumeur|Parfümeurin", "Glasbläser|Glasbläserin",
        "Industriekletterer|Industriekletterin"
      ]
    }
  },

  modemarken: {
    name: "Modemarken",
    icon: "",
    words: {
      leicht: [
        "Nike", "Adidas", "Puma", "H&M|H und M|HM", "Zara", "Gucci", "Prada", "Louis Vuitton", "Chanel", "Levi's|Levis",
        "Tommy Hilfiger", "Calvin Klein", "Hugo Boss|Boss", "Lacoste", "Ralph Lauren", "Primark", "Converse", "Vans",
        "Supreme", "The North Face|North Face", "Jack Wolfskin", "Esprit", "s.Oliver|s Oliver|sOliver", "Versace", "Dior"
      ],
      mittel: [
        "Balenciaga", "Burberry", "Armani|Giorgio Armani", "Dolce & Gabbana|Dolce und Gabbana|D&G", "Hermès|Hermes",
        "Fendi", "Moncler", "Stone Island", "Carhartt", "Champion", "Fila", "Reebok", "New Balance", "Asics",
        "Under Armour", "Abercrombie & Fitch|Abercrombie", "Hollister", "Superdry", "Mango", "Bershka",
        "Pull&Bear|Pull and Bear", "Uniqlo", "Shein", "Birkenstock", "Dr. Martens|Dr Martens|Docs"
      ],
      schwer: [
        "Saint Laurent|Yves Saint Laurent|YSL", "Givenchy", "Valentino", "Bottega Veneta", "Off-White|Off White",
        "Palm Angels", "Jil Sander", "Marc O'Polo|Marc OPolo", "Bogner", "Strellson", "Drykorn", "Patagonia",
        "Arc'teryx|Arcteryx", "Salomon", "Mammut", "Ellesse", "Kappa", "Napapijri", "Woolrich", "Barbour",
        "Acne Studios", "Kenzo", "Miu Miu", "Loewe", "Closed"
      ]
    }
  },

  lebensmittelmarken: {
    name: "Lebensmittelmarken",
    icon: "",
    words: {
      leicht: [
        "Coca-Cola|Coca Cola|Cola", "Pepsi", "Fanta", "Haribo", "Milka", "Nutella", "Ritter Sport",
        "Kinder|Kinder Schokolade", "Red Bull", "McDonald's|McDonalds", "Burger King", "Dr. Oetker|Dr Oetker", "Knorr",
        "Maggi", "Lindt", "Nestlé|Nestle", "Ferrero Rocher|Ferrero", "Kellogg's|Kelloggs", "Oreo", "Pringles",
        "Lay's|Lays", "Toblerone", "Capri-Sun|Capri Sonne|CapriSun", "Mars", "Snickers"
      ],
      mittel: [
        "funny-frisch|funny frisch", "Bahlsen", "Leibniz", "Lorenz", "Kinder Bueno", "Duplo", "Hanuta", "Mentos",
        "Tic Tac", "Twix", "KitKat|Kit Kat", "Balisto", "Ehrmann", "Müllermilch|Muellermilch|Müller", "Danone",
        "Alpro", "Barilla", "Heinz", "Iglo", "Wagner", "Ben & Jerry's|Ben and Jerrys", "Langnese", "Gerolsteiner",
        "Volvic", "Monster Energy|Monster"
      ],
      schwer: [
        "Bonne Maman", "Seitenbacher", "Zentis", "Kühne|Kuehne", "Develey", "Hengstenberg",
        "Rügenwalder Mühle|Rügenwalder|Ruegenwalder", "Herta", "Meßmer|Messmer", "Teekanne", "Tchibo", "Jacobs",
        "Dallmayr", "Lavazza", "Club-Mate|Club Mate", "fritz-kola|fritz kola", "Bionade", "Almdudler", "Bauer",
        "Landliebe", "Zott", "Brandt", "Hitschler", "Katjes", "Storck"
      ]
    }
  },

  techmarken: {
    name: "Techmarken",
    icon: "",
    words: {
      leicht: [
        "Apple", "Samsung", "Microsoft", "Google", "Sony", "Nintendo", "PlayStation", "Xbox", "Huawei", "Xiaomi", "LG",
        "Philips", "Bosch", "Canon", "Nikon", "HP|Hewlett-Packard", "Dell", "Lenovo", "Intel", "Nvidia", "AMD",
        "Amazon", "Netflix", "Spotify", "Instagram"
      ],
      mittel: [
        "Asus", "Acer", "Logitech", "Razer", "JBL", "Bose", "Beats", "Sennheiser", "Garmin", "GoPro", "DJI", "Dyson",
        "Miele", "Braun", "AEG", "Grundig", "Telefunken", "Medion", "Motorola", "Nokia", "OnePlus", "Oppo",
        "Fairphone", "Panasonic", "Toshiba"
      ],
      schwer: [
        "Raspberry Pi", "Arduino", "Corsair", "SteelSeries", "HyperX", "MSI", "Gigabyte", "Western Digital", "Seagate",
        "Kingston", "Sonos", "Teufel", "Bang & Olufsen|Bang und Olufsen|B&O", "Nothing", "Realme", "Honor",
        "BlackBerry", "Wacom", "Elgato", "Anker", "Ring", "Fitbit", "tado", "AVM|FRITZ!Box|Fritzbox", "Brother"
      ]
    }
  },

  firmen: {
    name: "Firmen",
    icon: "",
    words: {
      leicht: [
        "BASF", "SAP", "Deutsche Bahn|Bahn|DB", "Deutsche Telekom|Telekom", "Deutsche Post|DHL", "Lufthansa", "Allianz",
        "Deutsche Bank", "Bayer", "thyssenkrupp|Thyssenkrupp|ThyssenKrupp", "Aldi", "Lidl", "Edeka", "Rewe",
        "dm|dm-drogerie markt", "Rossmann", "IKEA", "MediaMarkt|Media Markt", "Douglas", "Zalando", "Otto",
        "Sparkasse", "Commerzbank", "TUI", "Henkel"
      ],
      mittel: [
        "Merck", "Continental", "Infineon", "Airbus", "Boeing", "Daimler Truck", "RWE", "E.ON|EON|Eon", "EnBW",
        "Vattenfall", "Uniper", "Munich Re|Münchener Rück", "Hapag-Lloyd", "Fraport", "Deutsche Börse|Deutsche Boerse",
        "Vonovia", "Heidelberg Materials|HeidelbergCement", "Beiersdorf", "Fresenius", "Rheinmetall", "Hensoldt",
        "ZF Friedrichshafen|ZF", "Schaeffler", "Kaufland", "Würth|Wuerth"
      ],
      schwer: [
        "Trumpf", "Zeiss|Carl Zeiss", "Festo", "Kärcher|Kaercher", "Stihl", "Liebherr", "Claas", "Krones", "Sartorius",
        "Covestro", "Evonik", "Wacker Chemie|Wacker", "Lanxess", "Brenntag", "Symrise", "Bertelsmann", "Axel Springer",
        "ProSiebenSat.1|ProSieben", "Freenet", "United Internet", "Qiagen", "BioNTech", "CureVac", "Delivery Hero",
        "HelloFresh"
      ]
    }
  },

  filme: {
    name: "Filme & Serien",
    icon: "",
    words: {
      leicht: [
        "Titanic", "Avatar", "Harry Potter", "Star Wars", "Der Herr der Ringe|Herr der Ringe",
        "Der König der Löwen|König der Löwen|Koenig der Loewen", "Die Eiskönigin|Eiskönigin|Frozen", "Shrek",
        "Findet Nemo", "Toy Story", "Jurassic Park", "Spider-Man|Spiderman", "Batman", "The Avengers|Avengers",
        "Fluch der Karibik", "James Bond", "Barbie", "Stranger Things", "Friends", "Die Simpsons|Simpsons",
        "SpongeBob Schwammkopf|SpongeBob", "Game of Thrones", "Breaking Bad", "Squid Game", "Tatort",
        "Ice Age", "Cars", "Minions", "Ratatouille", "Oben|Up", "Vaiana|Moana",
        "Rapunzel – Neu verföhnt|Rapunzel|Tangled",
        "Die Schöne und das Biest|Schöne und das Biest|Beauty and the Beast", "Aladdin",
        "Arielle, die Meerjungfrau|Arielle|The Little Mermaid", "Coco", "Alles steht Kopf|Inside Out",
        "Die Unglaublichen|The Incredibles",
        "Die Tribute von Panem|Tribute von Panem|The Hunger Games|Hunger Games",
        "Twilight|Biss zum Morgengrauen", "Iron Man", "Transformers", "Mamma Mia!", "Der Grinch|Grinch",
        "Rocky", "Grey's Anatomy", "The Walking Dead|Walking Dead", "Peppa Wutz|Peppa Pig",
        "Die Monster AG|Monster AG|Monsters, Inc."
      ],
      mittel: [
        "Inception", "Interstellar", "Oppenheimer", "Matrix|The Matrix", "Forrest Gump", "Der Pate|The Godfather",
        "Pulp Fiction", "Joker", "Dune", "Top Gun", "Fast & Furious|Fast and Furious", "Zurück in die Zukunft",
        "E.T.|ET|E.T. – Der Außerirdische", "Ghostbusters", "Kevin – Allein zu Haus|Kevin allein zu Haus|Home Alone",
        "Wednesday", "The Office", "How I Met Your Mother", "The Big Bang Theory|Big Bang Theory",
        "Haus des Geldes|La Casa de Papel", "Dark", "Babylon Berlin", "Stromberg", "Pastewka",
        "Die Sendung mit der Maus|Sendung mit der Maus",
        "Der weiße Hai|Weiße Hai|Jaws", "Indiana Jones", "Terminator", "Gladiator",
        "Der Teufel trägt Prada|The Devil Wears Prada", "Pretty Woman", "Dirty Dancing", "Grease",
        "Die Truman Show|Truman Show|The Truman Show", "Mean Girls|Girls Club", "Hangover|The Hangover",
        "Shutter Island", "The Wolf of Wall Street|Wolf of Wall Street", "John Wick", "Deadpool",
        "Guardians of the Galaxy", "Mission: Impossible", "Ziemlich beste Freunde|Intouchables",
        "Keinohrhasen", "Prison Break", "Sex and the City", "Gilmore Girls", "Bridgerton", "The Crown",
        "Dr. House|House", "Modern Family", "Brooklyn Nine-Nine|Brooklyn 99"
      ],
      schwer: [
        "Das Boot", "Lola rennt", "Good Bye, Lenin!|Good Bye Lenin|Goodbye Lenin", "Das Leben der Anderen",
        "Der Untergang", "Im Westen nichts Neues", "Toni Erdmann", "Fack ju Göhte|Fack ju Goehte",
        "Der Schuh des Manitu|Schuh des Manitu", "Parasite", "Fight Club", "Shining|The Shining", "Blade Runner",
        "Alien", "Arrival", "Whiplash", "La La Land", "Everything Everywhere All at Once", "Die Sopranos|The Sopranos",
        "The Wire", "Mad Men", "Succession", "Severance", "The Last of Us", "Peaky Blinders",
        "Psycho", "Der Exorzist|Exorzist|The Exorcist", "Taxi Driver",
        "Uhrwerk Orange|A Clockwork Orange|Clockwork Orange",
        "2001: Odyssee im Weltraum|2001|2001: A Space Odyssey", "Casablanca",
        "Vom Winde verweht|Gone with the Wind", "Der Pianist|The Pianist",
        "Schindlers Liste|Schindler's List",
        "Das Schweigen der Lämmer|Schweigen der Lämmer|The Silence of the Lambs", "Memento",
        "No Country for Old Men", "Die fabelhafte Welt der Amélie|Amélie", "Pans Labyrinth", "Get Out",
        "Grand Budapest Hotel|The Grand Budapest Hotel", "Drive", "Black Swan", "Die Welle", "Twin Peaks",
        "Fargo", "True Detective", "Better Call Saul", "Chernobyl|Tschernobyl", "Fleabag", "Lost", "Dexter"
      ]
    }
  },

  animes: {
    name: "Animes",
    icon: "",
    words: {
      leicht: [
        "Pokémon|Pokemon", "Dragon Ball|Dragonball|Dragon Ball Z", "Naruto", "One Piece", "Sailor Moon",
        "Detektiv Conan|Detective Conan", "Attack on Titan|Shingeki no Kyojin", "Death Note",
        "Mein Nachbar Totoro|Totoro", "Chihiros Reise ins Zauberland|Chihiro|Spirited Away", "Digimon",
        "Yu-Gi-Oh!|Yu-Gi-Oh|Yugioh", "Demon Slayer|Kimetsu no Yaiba", "My Hero Academia|Boku no Hero Academia",
        "Jujutsu Kaisen", "One Punch Man|One-Punch Man", "Tokyo Ghoul", "Fullmetal Alchemist", "Bleach", "Beyblade",
        "Captain Tsubasa", "Doraemon", "Hunter x Hunter", "Spy x Family", "Chainsaw Man",
        "Boruto", "Shin Chan|Crayon Shin-chan", "Ponyo – Das große Abenteuer am Meer|Ponyo",
        "Tokyo Revengers", "Solo Leveling", "The Seven Deadly Sins|Seven Deadly Sins|Nanatsu no Taizai",
        "Cyberpunk: Edgerunners|Edgerunners", "Kaiju No. 8|Kaiju Nr. 8", "Dandadan",
        "Black Butler|Kuroshitsuji", "A Silent Voice|Koe no Katachi",
        "Der Junge und der Reiher|The Boy and the Heron|Kimitachi wa Dō Ikiru ka",
        "Assassination Classroom|Ansatsu Kyoshitsu", "Weathering with You|Tenki no Ko",
        "Blue Exorcist|Ao no Exorcist"
      ],
      mittel: [
        "Heidi", "Die Biene Maja|Biene Maja", "Wickie und die starken Männer|Wickie", "Hamtaro",
        "Prinzessin Mononoke|Mononoke", "Das wandelnde Schloss|Howl's Moving Castle",
        "Kikis kleiner Lieferservice|Kiki", "Your Name|Kimi no Na wa", "Neon Genesis Evangelion|Evangelion",
        "Cowboy Bebop", "Akira", "Ghost in the Shell", "Sword Art Online", "Black Clover", "Haikyu!!|Haikyu",
        "Blue Lock", "Fairy Tail", "Inuyasha", "Code Geass", "Steins;Gate|Steins Gate", "Mob Psycho 100",
        "Dr. Stone|Dr Stone", "Vinland Saga", "Frieren", "Oshi no Ko",
        "Suzume", "Re:Zero", "No Game No Life", "Fruits Basket", "Konosuba", "Overlord",
        "Meine Wiedergeburt als Schleim in einer anderen Welt|Tensura|That Time I Got Reincarnated as a Slime",
        "Mirai Nikki|Future Diary", "Darling in the Franxx", "Kuroko's Basketball|Kuroko no Basket",
        "Soul Eater", "Noragami", "Fire Force|Enen no Shouboutai", "Bungo Stray Dogs", "Cardcaptor Sakura",
        "Hellsing"
      ],
      schwer: [
        "Mushishi", "Monster", "Erased|Boku dake ga Inai Machi", "Made in Abyss", "Violet Evergarden",
        "Toradora!|Toradora", "Clannad", "Nana", "Paprika", "Perfect Blue", "Ergo Proxy", "Serial Experiments Lain|Lain",
        "Samurai Champloo", "Trigun", "Berserk", "JoJo's Bizarre Adventure|JoJo", "Gintama",
        "Kaguya-sama: Love is War|Kaguya-sama", "The Promised Neverland|Promised Neverland", "Dorohedoro",
        "Banana Fish", "Odd Taxi", "Ranma ½|Ranma 1/2|Ranma", "Slam Dunk", "Great Teacher Onizuka|GTO",
        "Die letzten Glühwürmchen|Grave of the Fireflies|Hotaru no Haka",
        "Nausicaä aus dem Tal der Winde|Nausicaä|Nausicaa", "Das Schloss im Himmel|Laputa|Castle in the Sky",
        "Porco Rosso", "Ame & Yuki – Die Wolfskinder|Wolf Children|Wolfskinder", "Kakegurui", "Elfen Lied",
        "Black Lagoon", "Initial D", "Rurouni Kenshin|Kenshin", "Yu Yu Hakusho",
        "Saint Seiya|Saint Seiya – Die Krieger des Zodiac",
        "Die Melancholie der Haruhi Suzumiya|Haruhi Suzumiya|Haruhi", "Anohana", "Angel Beats!",
        "Mila Superstar", "Parasyte|Kiseijuu"
      ]
    }
  },

  sportarten: {
    name: "Sportarten",
    icon: "",
    words: {
      leicht: [
        "Fußball|Soccer", "Basketball", "Tennis", "Schwimmen", "Volleyball", "Handball", "Eishockey",
        "Skifahren|Ski alpin|Ski", "Boxen|Boxsport", "Radsport|Radfahren", "Tischtennis|Ping Pong",
        "Badminton|Federball", "Golf", "Reiten|Reitsport", "Turnen|Gerätturnen", "Leichtathletik",
        "Snowboarden|Snowboard", "Klettern", "Surfen|Wellenreiten", "Marathon|Marathonlauf", "Bowling",
        "Darts|Dart", "Judo", "Karate", "Tauchen", "Eiskunstlauf|Eiskunstlaufen",
        "Skateboarden|Skateboard|Skaten", "Beachvolleyball", "Rudern|Rudersport", "Schach"
      ],
      mittel: [
        "Curling", "Rugby", "Fechten", "Biathlon", "Bobfahren|Bob|Bobsport", "Skispringen|Skisprung",
        "Wasserball", "Kanu|Kanusport|Kanufahren", "Segeln|Segelsport", "Triathlon", "Ringen|Ringkampf",
        "Gewichtheben", "Stabhochsprung", "Speerwurf|Speerwerfen", "Kugelstoßen", "Hürdenlauf|Hürden",
        "American Football|Football", "Baseball", "Kitesurfen|Kitesurfing", "Billard|Pool|Poolbillard",
        "Squash", "Langlauf|Skilanglauf", "Rodeln|Rennrodeln", "Bouldern", "Kickboxen",
        "Synchronschwimmen|Kunstschwimmen", "Hockey|Feldhockey", "Minigolf", "Motocross", "Bogenschießen",
        "Wasserspringen|Turmspringen|Kunstspringen", "Parkour|Freerunning"
      ],
      schwer: [
        "Sepak Takraw", "Kabaddi", "Hurling", "Lacrosse", "Cricket", "Polo", "Faustball", "Sumo|Sumoringen",
        "Skeleton", "Nordische Kombination", "Moderner Fünfkampf|Fünfkampf", "Zehnkampf",
        "Dressurreiten|Dressur", "Schwingen|Schweizer Ringen", "Kendo", "Capoeira",
        "Trampolinturnen|Trampolin", "Ultimate Frisbee|Ultimate", "Boule|Pétanque", "Snooker",
        "Padel|Padel-Tennis", "Shorttrack", "Eisstockschießen|Eisstock", "Hammerwurf", "Dreisprung", "BMX",
        "Floorball|Unihockey", "Roller Derby", "Sportschießen", "Bahnradsport|Bahnrad"
      ]
    }
  },

  videospiele: {
    name: "Videospiele",
    icon: "",
    words: {
      leicht: [
        "Minecraft", "Fortnite", "Super Mario|Mario|Super Mario Bros.", "Mario Kart", "Tetris", "Pac-Man",
        "FIFA / EA FC|FIFA|EA FC|EA Sports FC", "GTA|Grand Theft Auto", "Call of Duty|CoD",
        "The Legend of Zelda|Zelda|Legend of Zelda", "Die Sims|Sims|The Sims", "Animal Crossing", "Among Us",
        "Roblox", "League of Legends|LoL", "Counter-Strike|CS|CS:GO|CS2", "Sonic|Sonic the Hedgehog",
        "Super Smash Bros.|Smash Bros|Smash", "Candy Crush|Candy Crush Saga", "Angry Birds",
        "Clash of Clans", "Brawl Stars", "Rocket League", "Wii Sports", "Subway Surfers", "Assassin's Creed",
        "Need for Speed|NFS", "Fall Guys", "Valorant", "Overwatch"
      ],
      mittel: [
        "The Witcher|Witcher", "Red Dead Redemption|Red Dead|RDR", "Elden Ring",
        "The Elder Scrolls|Elder Scrolls|Skyrim", "World of Warcraft|WoW", "Hogwarts Legacy", "Uncharted",
        "God of War", "Halo", "Tomb Raider", "Resident Evil", "Donkey Kong", "Stardew Valley", "Terraria",
        "Portal", "Diablo", "Age of Empires", "Anno", "Crash Bandicoot|Crash", "Street Fighter",
        "Mortal Kombat", "Tekken", "Cyberpunk 2077|Cyberpunk", "Fallout", "Final Fantasy", "Gran Turismo",
        "Just Dance", "Genshin Impact|Genshin", "Mario Party", "Dark Souls", "Kirby", "Apex Legends|Apex"
      ],
      schwer: [
        "Metroid", "Shadow of the Colossus", "BioShock", "Mass Effect", "Journey", "Limbo", "Celeste",
        "Hades", "Death Stranding", "Bloodborne", "Hollow Knight", "Undertale", "Cuphead", "Gothic", "Doom",
        "Half-Life", "Metal Gear Solid|Metal Gear|MGS", "Banjo-Kazooie", "Pikmin", "Monkey Island", "Myst",
        "Civilization|Civ|Sid Meier's Civilization", "SimCity", "Die Siedler|Siedler", "StarCraft",
        "Lemmings", "Pong", "Space Invaders", "It Takes Two", "Baldur's Gate|Baldur's Gate 3"
      ]
    }
  },

  gegenstaende: {
    name: "Gegenstände",
    icon: "",
    words: {
      leicht: [
        "Schere", "Kugelschreiber|Kuli", "Zahnbürste", "Handtuch", "Regenschirm|Schirm", "Brille", "Löffel",
        "Kissen", "Schlüssel", "Lampe", "Spiegel", "Uhr", "Kamm", "Bleistift", "Rucksack", "Hammer", "Tasse",
        "Kühlschrank", "Fernbedienung", "Wecker", "Teller", "Stuhl", "Kerze", "Taschenlampe",
        "Föhn|Fön|Haartrockner", "Besen", "Radiergummi", "Geldbeutel|Portemonnaie|Geldbörse|Brieftasche",
        "Lineal", "Toaster", "Mikrowelle", "Waschmaschine"
      ],
      mittel: [
        "Schraubenzieher|Schraubendreher", "Zange", "Tesafilm|Klebeband|Tesa", "Locher", "Tacker|Hefter",
        "Büroklammer", "Gießkanne", "Wäscheklammer", "Bügeleisen", "Staubsauger", "Wasserkocher",
        "Zollstock", "Kleiderbügel", "Pinzette", "Nagelknipser|Nagelschere", "Thermometer", "Dosenöffner",
        "Korkenzieher", "Schneebesen", "Pfanne", "Sieb", "Topflappen",
        "Kehrschaufel|Kehrblech|Schaufel und Besen", "Wäscheständer", "Mülleimer|Mülltonne|Abfalleimer",
        "Briefumschlag|Umschlag|Kuvert", "Textmarker", "Taschenrechner", "Bohrmaschine", "Säge", "Fußmatte"
      ],
      schwer: [
        "Lupe", "Kompass", "Nudelholz|Teigrolle", "Knoblauchpresse", "Schuhlöffel",
        "Fusselrolle|Fusselbürste", "Eieruhr|Küchenwecker", "Trichter", "Wasserwaage", "Spachtel", "Zirkel",
        "Stimmgabel", "Sanduhr", "Pürierstab|Stabmixer", "Salatschleuder", "Kartoffelstampfer",
        "Reibe|Küchenreibe", "Brieföffner", "Fingerhut", "Stecknadel", "Dübel",
        "Inbusschlüssel|Inbus|Innensechskantschlüssel", "Schraubstock", "Pömpel|Saugglocke|Pümpel",
        "Waschbrett", "Teesieb|Tee-Ei", "Klobürste|WC-Bürste", "Schuhanzieher|Stiefelknecht", "Mörser",
        "Fernglas", "Briefwaage"
      ]
    }
  },

  orte: {
    name: "Orte",
    icon: "",
    words: {
      leicht: [
        "Supermarkt", "Krankenhaus", "Schule", "Bahnhof", "Flughafen", "Kino", "Schwimmbad|Hallenbad",
        "Freibad", "Strand", "Spielplatz", "Bäckerei", "Restaurant", "Friedhof", "Kirche", "Zoo",
        "Bibliothek|Bücherei", "Fitnessstudio|Gym|Fitnesscenter", "Tankstelle", "Apotheke",
        "Polizeistation|Polizeiwache|Polizeirevier", "Gefängnis|Knast|Justizvollzugsanstalt", "Park",
        "Bauernhof", "Hotel", "Disco|Diskothek|Club", "Stadion", "Wald", "Berg", "Kindergarten|Kita",
        "Museum", "Bank", "Universität|Uni|Hochschule"
      ],
      mittel: [
        "Bowlingbahn|Bowlingcenter", "Leuchtturm", "Freizeitpark|Vergnügungspark", "Campingplatz", "Rathaus",
        "Post|Postfiliale", "Baumarkt", "Feuerwache|Feuerwehrhaus", "Kiosk|Späti|Spätkauf", "Zahnarztpraxis",
        "Friseursalon", "Parkhaus", "Waschstraße|Autowaschanlage", "Hafen", "Eishalle|Eisstadion", "Theater",
        "Kneipe|Bar", "Jugendherberge", "Weihnachtsmarkt", "Autobahnraststätte|Raststätte|Rastplatz",
        "Skigebiet", "Sauna", "Tierheim", "Kaserne", "Gericht|Gerichtsgebäude", "Insel", "Wochenmarkt|Markt",
        "Altenheim|Seniorenheim|Pflegeheim", "Waschsalon", "Spielhalle|Spielothek"
      ],
      schwer: [
        "Weinberg", "Kläranlage", "Sternwarte|Observatorium", "Schrottplatz", "Steinbruch", "Kloster",
        "Mühle|Windmühle", "Bergwerk|Mine|Zeche", "Wertstoffhof|Recyclinghof", "Gewächshaus", "Planetarium",
        "Schleuse", "Staudamm|Talsperre", "Botanischer Garten", "Autokino", "Kletterhalle|Boulderhalle",
        "Reiterhof|Reitstall", "Kegelbahn", "Pfandhaus|Leihhaus", "Krematorium",
        "Leichenhalle|Leichenschauhaus", "Tierpark|Wildpark", "Schrebergarten|Kleingarten", "Baggersee",
        "Wasserturm", "Tropfsteinhöhle", "Seilbahnstation|Bergstation", "Escape Room", "Tattoostudio"
      ]
    }
  },

  figuren: {
    name: "Figuren",
    icon: "",
    person: true,
    words: {
      leicht: [
        "Micky Maus|Mickey Mouse|Mickey Maus", "Donald Duck", "Homer Simpson", "Bart Simpson", "Pikachu",
        "Superman", "Hulk|Der unglaubliche Hulk", "Wonder Woman", "Rotkäppchen", "Schneewittchen",
        "Aschenputtel|Cinderella", "Dornröschen", "Pinocchio",
        "Hermine Granger|Hermine|Hermione Granger|Hermione", "Darth Vader", "Yoda|Meister Yoda", "Gandalf",
        "Frodo Beutlin|Frodo|Frodo Baggins", "Elsa", "Olaf", "Simba", "Garfield", "Pumuckl",
        "Sherlock Holmes|Sherlock", "Jack Sparrow|Captain Jack Sparrow|Käpt'n Jack Sparrow", "Asterix",
        "Obelix", "Winnie Puuh|Winnie Pooh|Pu der Bär|Winnie the Pooh", "Patrick Star|Patrick"
      ],
      mittel: [
        "Gollum|Sméagol", "Lara Croft", "Link", "Lightning McQueen|McQueen", "Buzz Lightyear|Buzz", "Woody",
        "Dobby", "Lord Voldemort|Voldemort", "Albus Dumbledore|Dumbledore", "Legolas", "Chewbacca|Chewie",
        "Luke Skywalker|Luke", "Prinzessin Leia|Leia|Leia Organa", "Wolverine", "Harley Quinn",
        "Lisa Simpson", "Eric Cartman|Cartman", "Gru", "Bibi Blocksberg|Bibi", "Benjamin Blümchen",
        "Pippi Langstrumpf|Pippi", "Mulan", "Peter Pan", "Bugs Bunny", "Snoopy", "Tarzan",
        "Sheldon Cooper|Sheldon", "Walter White|Heisenberg"
      ],
      schwer: [
        "Hannibal Lecter|Lecter", "Tyrion Lannister|Tyrion", "Daenerys Targaryen|Daenerys", "Jon Snow",
        "Geralt von Riva|Geralt|Geralt of Rivia", "Master Chief", "Kratos", "Bowser", "Mewtu|Mewtwo", "Scar",
        "Ursula", "Cruella de Vil|Cruella", "Maleficent|Malefiz", "Captain Hook|Käpt'n Hook|Kapitän Hook",
        "Tinker Bell|Naseweis", "Rubeus Hagrid|Hagrid", "Severus Snape|Snape",
        "Bilbo Beutlin|Bilbo|Bilbo Baggins", "Aragorn", "Obi-Wan Kenobi|Obi-Wan", "Han Solo",
        "Grogu|Baby Yoda", "Graf Dracula|Dracula", "Hercule Poirot|Poirot", "Räuber Hotzenplotz|Hotzenplotz",
        "Der kleine Prinz|Kleiner Prinz", "Jim Knopf", "Das Sams|Sams", "Rumpelstilzchen"
      ]
    }
  },

  fahrzeuge: {
    name: "Fahrzeuge",
    icon: "",
    words: {
      leicht: [
        "Fahrrad|Rad|Velo", "Auto|PKW", "Bus|Linienbus", "Zug|Eisenbahn", "Flugzeug",
        "Hubschrauber|Helikopter", "Motorrad", "Tretroller|Roller", "Straßenbahn|Tram|Bim", "U-Bahn", "Taxi",
        "Lkw|Lastwagen|Laster", "Traktor|Trecker", "Krankenwagen|Rettungswagen|RTW",
        "Feuerwehrauto|Feuerwehrwagen|Löschfahrzeug", "Polizeiauto|Streifenwagen|Polizeiwagen", "Rakete",
        "Kinderwagen", "Segelboot", "Wohnmobil|Camper|Wohnwagen", "Bagger", "Müllauto|Müllwagen",
        "Heißluftballon|Ballon", "Schlitten", "Kreuzfahrtschiff", "E-Scooter|E-Roller", "Fähre|Autofähre",
        "Inlineskates|Inliner|Rollerblades"
      ],
      mittel: [
        "U-Boot|Unterseeboot", "Zeppelin|Luftschiff", "Rikscha", "Pistenraupe", "Segelflugzeug|Segelflieger",
        "Gleitschirm|Paraglider", "Jetski|Wassermotorrad", "Tandem", "Einrad", "Seilbahn|Gondelbahn",
        "Kutsche|Pferdekutsche", "Floß", "Katamaran", "Containerschiff", "Panzer", "Quad", "Gabelstapler",
        "Mähdrescher", "Schneemobil|Motorschlitten", "Luftkissenboot|Hovercraft", "Monstertruck",
        "Doppeldeckerbus|Doppeldecker", "Tuk-Tuk", "Segway", "Kajak", "Schlauchboot", "Go-Kart|Kart",
        "Bobby-Car", "Dampflok|Dampflokomotive", "Tretboot", "Ruderboot", "Hundeschlitten"
      ],
      schwer: [
        "Draisine", "Tragschrauber|Gyrocopter", "Trike", "Liegerad", "Lastenrad|Lastenfahrrad|Cargobike",
        "Galeere", "Dschunke", "Gondel", "Einbaum", "Postkutsche", "Planwagen", "Sänfte", "Streitwagen",
        "Mondauto|Mondfahrzeug|Lunar Rover", "Marsrover", "Eisbrecher", "Flugzeugträger", "Schwebebahn",
        "Zahnradbahn", "Paternoster", "Bollerwagen", "Rollstuhl", "Wasserflugzeug",
        "Drachenflieger|Hängegleiter|Deltasegler", "Jetpack", "Tieflader", "Space Shuttle|Raumfähre",
        "Magnetschwebebahn|Transrapid", "Velomobil", "Kettenfahrzeug|Raupenfahrzeug"
      ]
    }
  },

  kleidung: {
    name: "Kleidung & Accessoires",
    icon: "",
    words: {
      leicht: [
        "T-Shirt|Shirt", "Jeans|Jeanshose", "Pullover|Pulli", "Jacke", "Mütze", "Schal",
        "Handschuhe|Handschuh", "Socken|Socke", "Turnschuhe|Sneaker|Turnschuh", "Stiefel",
        "Sandalen|Sandale", "Hoodie|Kapuzenpulli|Kapuzenpullover", "Kleid", "Rock", "Shorts|kurze Hose",
        "Jogginghose", "Schlafanzug|Pyjama", "Badehose", "Bikini", "Unterhose", "BH|Büstenhalter", "Hemd",
        "Krawatte|Schlips", "Anzug", "Gürtel", "Sonnenbrille", "Ehering", "Halskette|Kette",
        "Ohrringe|Ohrring", "Handtasche", "Cap|Baseballcap|Basecap|Kappe", "Hausschuhe|Pantoffeln",
        "Flip-Flops|Zehentrenner", "Bademantel", "Weste"
      ],
      mittel: [
        "Smoking", "Fliege", "Strickjacke", "Blazer", "Bluse", "Poloshirt|Polohemd", "Leggings",
        "Strumpfhose", "Overall|Latzhose", "Regenjacke", "Daunenjacke", "Mantel", "Lederjacke", "Pumps",
        "High Heels|Stöckelschuhe", "Gummistiefel", "Ballerinas", "Badeanzug", "Stirnband",
        "Haarreif|Haarreifen", "Haargummi", "Armband", "Brosche", "Manschettenknöpfe", "Sturmhaube",
        "Fäustlinge|Fausthandschuhe", "Bauchtasche|Gürteltasche", "Schürze", "Dirndl", "Lederhose",
        "Hosenträger", "Trenchcoat", "Kimono", "Turban", "Strohhut", "Zylinder", "Kopftuch", "Clogs",
        "Fußkettchen"
      ],
      schwer: [
        "Monokel", "Gamaschen", "Poncho", "Sari", "Kilt", "Sombrero", "Fes", "Baskenmütze", "Schweißband",
        "Fascinator", "Stola", "Korsett|Korsage", "Petticoat", "Cardigan", "Chinos|Chinohose", "Cargohose",
        "Espadrilles", "Loafer|Slipper", "Mokassins", "Plateauschuhe", "Siegelring", "Diadem|Tiara",
        "Kummerbund", "Einstecktuch", "Krawattennadel", "Kniestrümpfe", "Overknees", "Bolero", "Tunika",
        "Kaftan", "Muff", "Pelzmütze|Uschanka", "Beanie", "Bucket Hat|Fischerhut", "Clutch", "Medaillon",
        "Choker"
      ]
    }
  },

  hobbys: {
    name: "Hobbys & Freizeit",
    icon: "",
    words: {
      leicht: [
        "Kochen", "Backen", "Lesen", "Malen", "Zeichnen", "Fotografieren|Fotografie",
        "Gärtnern|Gartenarbeit", "Angeln", "Camping|Campen|Zelten", "Wandern", "Puzzeln|Puzzle", "Karaoke",
        "Tanzen", "Singen", "Stricken", "Zocken|Videospiele|Gaming", "Brettspiele",
        "Kartenspielen|Kartenspiele", "Shoppen|Shopping", "Konzert", "Picknick", "Grillen",
        "Spazierengehen|Spaziergang", "Musizieren|Instrument spielen", "Basteln",
        "Serien schauen|Binge-Watching"
      ],
      mittel: [
        "Häkeln", "Nähen", "Geocaching", "Sudoku", "Kreuzworträtsel", "Lasertag", "Paintball",
        "Meditation|Meditieren", "Vogelbeobachtung|Vögel beobachten", "Sterne beobachten|Sternegucken",
        "Pilze sammeln|Pilzsuche", "Töpfern", "Briefmarken sammeln", "Modellbau", "Lego",
        "Pen and Paper|Pen & Paper|Rollenspiel", "Cosplay", "Poetry Slam", "Quiz|Pubquiz|Kneipenquiz",
        "Tagebuch schreiben|Tagebuch", "Bullet Journal", "Imkern|Imkerei", "Aquaristik|Aquarium",
        "Heimwerken", "Flohmarkt", "Drachen steigen lassen|Drachensteigen", "Kalligrafie|Kalligraphie",
        "Thermalbad|Therme", "Trampolinpark"
      ],
      schwer: [
        "Origami", "Makramee", "Sticken|Stickerei", "Patchwork", "Schnitzen", "Klöppeln", "Bonsai",
        "Modelleisenbahn", "Metalldetektor|Sondeln", "Ahnenforschung|Genealogie", "Amateurfunk",
        "Jonglieren", "Zaubern|Zauberei|Zaubertricks", "Bauchreden", "Speedcubing|Zauberwürfel",
        "LARP|Live-Rollenspiel", "Mittelaltermarkt", "Kerzen gießen|Kerzenziehen",
        "Seifen herstellen|Seifensieden", "Bierbrauen", "Fermentieren", "Glamping", "Vanlife",
        "Urban Exploring|Urbex|Lost Places", "Krimidinner", "Kintsugi", "Linoldruck|Linolschnitt",
        "Aquarellmalerei|Aquarell", "Graffiti", "Beatboxing|Beatbox", "Podcasten|Podcast", "Planwagenfahrt"
      ]
    }
  }
};

// Zusammengefasste Kategorien beim Verräter. Listen unter "onlyHard" kommen
// komplett in "schwer" und nie bei leicht oder mittel vor.
const MERGED_CATEGORIES = {
  marken: {
    name: "Marken",
    from: ["automarken", "modemarken", "lebensmittelmarken", "techmarken", "firmen"]
  },
  promis: {
    name: "Promis",
    person: true,
    from: ["geschichte", "politiker", "schauspieler", "musiker", "sportler", "fussballer"],
    onlyHard: ["streamer"]
  }
};

const CATEGORIES = (() => {
  const result = {};
  const mergedOf = {};
  for (const [id, m] of Object.entries(MERGED_CATEGORIES)) {
    for (const src of [...m.from, ...(m.onlyHard || [])]) mergedOf[src] = id;
  }
  for (const src of Object.keys(WORD_SOURCES)) {
    const id = mergedOf[src];
    if (!id) { result[src] = WORD_SOURCES[src]; continue; }
    if (result[id]) continue;
    const m = MERGED_CATEGORIES[id];
    const cat = { name: m.name, icon: "", words: { leicht: [], mittel: [], schwer: [] }, sourceOf: {}, onlyHard: [] };
    if (m.person) cat.person = true;
    for (const s of m.from) {
      for (const level of ["leicht", "mittel", "schwer"]) {
        for (const w of WORD_SOURCES[s].words[level]) { cat.words[level].push(w); cat.sourceOf[w] = s; }
      }
    }
    for (const s of m.onlyHard || []) {
      for (const w of Object.values(WORD_SOURCES[s].words).flat()) {
        cat.words.schwer.push(w); cat.onlyHard.push(w); cat.sourceOf[w] = s;
      }
    }
    result[id] = cat;
  }
  return result;
})();

// Ursprüngliche Einzelliste eines Begriffs (für die Hinweise)
function wordSource(catId, entry) {
  const c = CATEGORIES[catId];
  return (c && c.sourceOf && c.sourceOf[entry]) || catId;
}

const DIFFICULTY_IDS = ["leicht", "mittel", "schwer"];

// Gespeicherte Einstellungen weiter nutzen: alte Kategorie-IDs werden umgeleitet,
// "zufall" bzw. "gemischt" (früher eine eigene Auswahl) heißt jetzt: alles ausgewählt.
function resolveCategory(id) {
  if (CATEGORIES[id]) return id;
  return Object.keys(MERGED_CATEGORIES).find((m) => MERGED_CATEGORIES[m].from.concat(MERGED_CATEGORIES[m].onlyHard || []).includes(id)) || null;
}

function resolveCategories(input) {
  if (input === "zufall") return Object.keys(CATEGORIES);
  const list = (Array.isArray(input) ? input : [input]).map(resolveCategory).filter(Boolean);
  const ids = Object.keys(CATEGORIES).filter((id) => list.includes(id));
  return ids.length ? ids : ["laender"];
}

function resolveDifficulties(input) {
  if (input === "gemischt") return DIFFICULTY_IDS.slice();
  const list = Array.isArray(input) ? input : [input];
  const ids = DIFFICULTY_IDS.filter((d) => list.includes(d));
  return ids.length ? ids : ["leicht"];
}

if (typeof module !== "undefined") {
  module.exports = { CATEGORIES, WORD_SOURCES, DIFFICULTY_IDS, wordSource, resolveCategories, resolveDifficulties };
}
