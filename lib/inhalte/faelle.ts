import type { Fallakte } from "@/lib/typen";

// Prüffragen nach den sieben Ebenen des KI-Gerechtigkeitskompasses (Seminarunterlage).
// Die Formulierung wird je Fallakte auf die Person zugeschnitten.
const kompassFragenJonas: Fallakte["kompassFragen"] = [
  {
    ebene: "1 Zugang und Teilhabe",
    frage: "Kann Jonas das Arbeitsblatt ohne Drucker und ohne Laptop vollständig auf dem Smartphone bearbeiten?",
  },
  {
    ebene: "2 Nutzungskompetenz",
    frage: "Setzt das Blatt KI-Kenntnisse voraus, die Jonas nicht hat – und falls ja, ist Unterstützung eingeplant?",
  },
  {
    ebene: "3 Bildungserträge",
    frage: "Führt das Blatt zu eigenem Verständnis statt zum Übernehmen einer fertigen Lösung?",
  },
  {
    ebene: "4 Kritische Urteilsfähigkeit",
    frage: "Gibt das Blatt Jonas einen Anlass, eine KI-Antwort selbst zu prüfen?",
  },
  {
    ebene: "5 Fairness und Bias",
    frage: "Ist das Blatt frei von stereotypen Darstellungen von Personen oder Gruppen?",
  },
  {
    ebene: "6 Psychosoziale Dimension",
    frage: "Verweist das Blatt bei Fragen auch an Menschen (Lehrkraft, Mitschüler:innen) statt nur an die KI?",
  },
  {
    ebene: "7 Professionelle Verantwortung",
    frage: "Hast du jeden Teil des KI-Entwurfs selbst geprüft, sodass du das Blatt fachlich verantworten kannst?",
  },
];

const jonas: Fallakte = {
  id: "jonas",
  name: "Jonas",
  alter: 17,
  beruf: "Kaufmann im Einzelhandel, 1. Ausbildungsjahr",
  abschluss: "Erster Schulabschluss",
  thema: "M1",
  themaTitel: "Prozentrechnung und Dreisatz",
  pfade: ["mathe"],
  stufe: 1,
  spielbar: true,
  kompassEbene: "1 Zugang: nur Smartphone, kein Drucker",
  steckbrief: [
    "Arbeitet im Ausbildungsbetrieb an der Kasse eines Elektronikmarkts.",
    "Beteiligt sich mündlich gern, schreibt in Klassenarbeiten oft nur Ergebnisse ohne Rechenweg.",
    "Hat in der letzten Lernerfolgskontrolle zur Prozentrechnung 9 von 20 Punkten erreicht.",
  ],
  staerken: [
    "Schnelles Kopfrechnen",
    "Praxiserfahrung mit Rabattaktionen an der Kasse",
    "Hohe Motivation bei Aufgaben mit Bezug zum Betrieb",
  ],
  interessen: ["Fußball, spielt im Verein", "Technik, besonders Kopfhörer und Spielkonsolen"],
  rahmen: [
    "Kein eigener Laptop, nur ein Smartphone",
    "Kein Drucker zu Hause",
    "Fährt 50 Minuten mit dem Bus zur Berufsschule",
  ],
  kiNutzung:
    "Nutzt KI selten und nur die kostenlose Version eines Chatbots auf dem Smartphone. Hat noch nie eine KI-Antwort überprüft.",
  aufgaben: [
    {
      titel: "Aufgabe 1: Nettopreis",
      aufgabe:
        "Ein Kopfhörer kostet an der Kasse 59,50 € inklusive 19 % Umsatzsteuer. Wie hoch ist der Nettopreis?",
      loesung: "59,50 € · 19 % = 11,31 €\n59,50 € − 11,31 € = 48,19 €",
      richtig: false,
      musterloesung: "59,50 € : 1,19 = 50,00 €",
    },
    {
      titel: "Aufgabe 2: Rabatt",
      aufgabe: "Ein Rucksack kostet 80 €. Es gibt 15 % Rabatt. Was zahlt die Kundin?",
      loesung: "80 € · 0,85 = 68 €",
      richtig: true,
      musterloesung: "80 € · 0,85 = 68,00 €",
    },
    {
      titel: "Aufgabe 3: Preiserhöhung",
      aufgabe: "Ein Ladekabel kostet 12 €. Der Preis steigt um 25 %. Wie viel kostet es jetzt?",
      loesung: "12 € · 1,25 = 15 €",
      richtig: true,
      musterloesung: "12 € · 1,25 = 15,00 €",
    },
    {
      titel: "Aufgabe 4: Ursprünglicher Preis",
      aufgabe:
        "Eine Spielkonsole kostet nach 20 % Rabatt noch 360 €. Wie hoch war der ursprüngliche Preis?",
      loesung: "360 € · 20 % = 72 €\n360 € + 72 € = 432 €",
      richtig: false,
      musterloesung: "360 € : 0,80 = 450,00 €",
    },
  ],
  musterdiagnose: {
    staerke:
      "Jonas rechnet sicher vorwärts: Ist der Ausgangswert (100 %) gegeben, berechnet er Rabatte und Preiserhöhungen korrekt.",
    schwierigkeit:
      "Beim Rückwärtsrechnen erkennt er nicht, dass der gegebene Preis bereits 119 % bzw. 80 % ist. Er bezieht den Prozentsatz auf den falschen Grundwert (vermehrter/verminderter Grundwert).",
    rahmen:
      "Das Arbeitsblatt muss auf dem Smartphone ohne Drucker funktionieren und sollte an seine Kassenerfahrung anknüpfen.",
    loesungsbegriffe: [
      "vermehrt",
      "vermindert",
      "119",
      "1,19",
      "0,8",
      "rückwärts",
      "rückrechn",
      "falschen grundwert",
    ],
  },
  hilfekarten: [
    {
      stufe: "Hinweis",
      text: "Vergleiche die Aufgaben, die Jonas richtig löst, mit denen, die er falsch löst. Was ist jeweils gegeben, was ist gesucht?",
    },
    {
      stufe: "Strategie",
      text: "Frag dich bei jeder Aufgabe: Wofür stehen die 100 %? Ist der gegebene Preis der Ausgangswert oder schon das Ergebnis einer Veränderung?",
    },
    {
      stufe: "Teillösung",
      text: "In Aufgabe 1 und 4 ist der gegebene Preis bereits verändert (119 % bzw. 80 %). Jonas rechnet aber so, als wäre er der Ausgangswert.",
    },
  ],
  ausgangsfrage: "Du hast dir Jonas’ vier Lösungen angesehen. Was fällt dir als Erstes auf?",
  skript: {
    pruefung: [
      "Schau dir Aufgabe 2 und 3 an. Wie passen Jonas’ Ergebnisse dort zu deiner Einschätzung?",
      "Aufgabe 2 und 3 hat Jonas richtig gelöst. Was sagt das über seine Fähigkeiten in der Prozentrechnung aus?",
      "Woran genau machst du deine Einschätzung fest – am Ergebnis oder an einem bestimmten Rechenschritt?",
    ],
    aporie:
      "Starke Einsicht – du hast deine erste Einschätzung geprüft und verändert. Was unterscheidet Aufgabe 1 und 4 von Aufgabe 2 und 3, wenn du darauf schaust, was jeweils gegeben ist?",
    einsichtOhneDiagnose: [
      "Frag dich bei Aufgabe 1: Steht der Preis von 59,50 € für 100 % oder für mehr?",
      "Welcher Preis ist in Aufgabe 4 der Ausgangswert – der Preis vor oder nach dem Rabatt?",
    ],
    einsicht: [
      "Wie formulierst du Jonas’ Stärke und seine Schwierigkeit jetzt in je einem Satz?",
      "Jonas arbeitet nur mit dem Smartphone und hat keinen Drucker. Was bedeutet das für die Form deines Arbeitsblatts?",
      "Jonas kennt Rabatte von der Kasse. Wie kannst du diese Erfahrung im Arbeitsblatt nutzen?",
    ],
    synthese:
      "Du hast Stärke, Schwierigkeit und Rahmenbedingungen herausgearbeitet und überlegt, wie du an Jonas’ Kassenerfahrung anknüpfst. Mit welcher Aufgabe lässt du Jonas an seine Stärke anknüpfen?",
    abschluss:
      "Damit ist der Diagnose-Dialog abgeschlossen. Übertrage deine Erkenntnisse jetzt in das Stärken-Schwächen-Profil.",
    diagnoseSignale: [
      "119",
      "1,19",
      "vermehrt",
      "vermindert",
      "rückwärts",
      "rückrechn",
      "zurückrechn",
      "ausgangswert",
      "ausgangspreis",
      "grundwert",
      "100 %",
      "100%",
    ],
  },
  // Vorbereiteter KI-Entwurf für die Validierungs-Challenge. Er enthält absichtlich drei Mängel
  // (siehe `maengel`), damit die Challenge für alle gleich und auswertbar ist.
  entwurf: {
    lernsituation:
      "Du arbeitest an der Kasse im Elektronikmarkt. Eine ältere Dame legt einen Kopfhörer für 59,50 € aufs Band. Wie viele Frauen kennt sie sich mit Technik nicht aus und fragt dich, wie viel der Kopfhörer ohne Umsatzsteuer kostet.",
    einstieg:
      "Aufwärmen: Ein Ladekabel kostet 12 €. Es gibt 25 % Rabatt. Wie viel kostet es jetzt? Rechne im Kopf.",
    kernaufgaben:
      "Basis: Determinieren Sie unter Berücksichtigung des inkludierten Umsatzsteuersatzes von 19 % den zugrunde liegenden Nettobetrag eines Artikels mit einem Bruttoverkaufspreis von 119,00 €.\nStandard: Ein Kopfhörer kostet 59,50 € brutto. Berechne den Nettopreis. Tipp: Der Bruttopreis entspricht 119 %.\nErweiterung: Eine Spielkonsole kostet nach 20 % Rabatt noch 360 €. Wie teuer war sie vorher?",
    hilfekarten:
      "Karte 1: Welcher Preis steht für 100 %?\nKarte 2: Zeichne einen Prozentstreifen: 100 % netto + 19 % Steuer = 119 % brutto.\nKarte 3: 59,50 € : 119 · 100 = …",
    sprache:
      "Wortspeicher: brutto = mit Steuer · netto = ohne Steuer · Grundwert = der Wert, der 100 % entspricht.",
    selbstkontrolle:
      "Probe: Ziehe vom Bruttopreis 19 % ab. Wenn du denselben Wert erhältst wie in deiner Rechnung, stimmt dein Nettopreis.",
    kiImpuls:
      "Frag die KI nicht nach der Lösung, sondern: „Stell mir eine Frage, die mir hilft, meinen Fehler zu finden.“",
    lehrkraftKopf:
      "Lernziel: Nettopreise aus Bruttopreisen und Ausgangspreise aus reduzierten Preisen berechnen.\nFormat: digital auf dem Smartphone ausfüllbar.\nKennzeichnung: KI-gestützt erstellt, von der Lehrkraft geprüft.",
  },
  maengel: [
    {
      teil: "lernsituation",
      art: "bias",
      titel: "Stereotyp in der Lernsituation",
      erklaerung:
        "„Wie viele Frauen kennt sie sich mit Technik nicht aus“ reproduziert ein Geschlechterklischee. KI-Systeme übernehmen solche Muster aus ihren Trainingsdaten (Kompass-Ebene 5).",
    },
    {
      teil: "kernaufgaben",
      art: "sprache",
      titel: "Sprachniveau der Basisaufgabe",
      erklaerung:
        "Die Basisaufgabe ist in Fachjargon formuliert („Determinieren Sie … inkludierten …“). Gerade die Einstiegsstufe muss für Jonas sprachlich zugänglich sein.",
    },
    {
      teil: "selbstkontrolle",
      art: "fachlich",
      titel: "Falsche Probe in der Selbstkontrolle",
      erklaerung:
        "Die Probe „19 % vom Bruttopreis abziehen“ ist genau Jonas’ Fehlvorstellung und würde sie bestätigen. Richtig: Nettopreis · 1,19 muss den Bruttopreis ergeben.",
    },
  ],
  kompassFragen: kompassFragenJonas,
};

// Weitere Fallakten aus dem Konzept (Kapitel 5.2). Sie sind beschrieben, aber noch nicht spielbar;
// Schüler:innenlösungen, Hilfekarten und Entwurf ergänzt das Team in der nächsten Ausbaustufe.
function inArbeit(
  basis: Pick<
    Fallakte,
    "id" | "name" | "alter" | "beruf" | "abschluss" | "thema" | "themaTitel" | "pfade" | "stufe" | "kompassEbene"
  > & { kurz: string },
): Fallakte {
  return {
    ...basis,
    spielbar: false,
    steckbrief: [basis.kurz],
    staerken: [],
    interessen: [],
    rahmen: [],
    kiNutzung: "",
    aufgaben: [],
    musterdiagnose: { staerke: "", schwierigkeit: "", rahmen: "", loesungsbegriffe: [] },
    hilfekarten: [],
    ausgangsfrage: "",
    skript: {
      pruefung: [],
      aporie: "",
      einsichtOhneDiagnose: [],
      einsicht: [],
      synthese: "",
      abschluss: "",
      diagnoseSignale: [],
    },
    entwurf: jonas.entwurf,
    maengel: [],
    kompassFragen: kompassFragenJonas,
  };
}

export const FAELLE: Fallakte[] = [
  jonas,
  inArbeit({
    id: "lena",
    name: "Lena",
    alter: 18,
    beruf: "Kauffrau für Büromanagement",
    abschluss: "Mittlerer Schulabschluss",
    thema: "W2",
    themaTitel: "Grundlagen der Buchführung",
    pfade: ["bwr"],
    stufe: 1,
    kompassEbene: "4 Kritische Urteilsfähigkeit (Automation Bias)",
    kurz: "Verwechselt Soll und Haben und übernimmt KI-Lösungen ungeprüft.",
  }),
  inArbeit({
    id: "daria",
    name: "Daria",
    alter: 23,
    beruf: "Industriekauffrau",
    abschluss: "Studienabschluss aus der Ukraine, Deutsch auf B2-Niveau",
    thema: "W1",
    themaTitel: "Bezugskalkulation und Angebotsvergleich",
    pfade: ["bwr"],
    stufe: 2,
    kompassEbene: "2 Nutzungskompetenz, 5 Fairness und Bias",
    kurz: "Rechnet fehlerfrei, scheitert an Fachbegriffen wie Skonto oder Bezugskosten.",
  }),
  inArbeit({
    id: "can",
    name: "Can",
    alter: 20,
    beruf: "Industriekaufmann",
    abschluss: "Abitur",
    thema: "M2",
    themaTitel: "Lineare Funktionen: Kosten, Erlös, Gewinnschwelle",
    pfade: ["mathe"],
    stufe: 2,
    kompassEbene: "3 Bildungserträge",
    kurz: "Löst alles mit KI, kann den Lösungsweg nicht erklären; ist unterfordert.",
  }),
  inArbeit({
    id: "mia",
    name: "Mia",
    alter: 17,
    beruf: "Kauffrau für Büromanagement",
    abschluss: "Mittlerer Schulabschluss, Rechenschwäche mit Nachteilsausgleich",
    thema: "W1",
    themaTitel: "Bezugskalkulation (angewandte Prozentrechnung)",
    pfade: ["mathe", "bwr"],
    stufe: 3,
    kompassEbene: "6 Psychosoziale Dimension",
    kurz: "Verliert bei mehrschrittigen Rechnungen den Überblick; nutzt einen Chatbot als „Freundin“.",
  }),
];

export function fallakte(id: string): Fallakte | undefined {
  return FAELLE.find((f) => f.id === id);
}
