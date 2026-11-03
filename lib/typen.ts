// Gemeinsame Typen für Inhalte, Dialog und Spielstand.

export type Phase =
  | "ausgangsfrage"
  | "behauptung"
  | "pruefung"
  | "aporie"
  | "einsicht"
  | "synthese";

export const PHASEN: { id: Phase; titel: string; kurz: string }[] = [
  { id: "ausgangsfrage", titel: "Ausgangsfrage", kurz: "Worum geht es?" },
  { id: "behauptung", titel: "Behauptung", kurz: "Du legst dich fest." },
  { id: "pruefung", titel: "Prüfung", kurz: "Belege und Gegenbeispiele" },
  { id: "aporie", titel: "Irritation", kurz: "Die Annahme trägt nicht." },
  { id: "einsicht", titel: "Neue Einsicht", kurz: "Du formulierst neu." },
  { id: "synthese", titel: "Synthese", kurz: "Entscheidungen bündeln" },
];

export type Rolle = "coach" | "lehrkraft";

// Obergrenzen für den Dialog: schützen vor überlangen Anfragen und damit vor unnötigen KI-Kosten.
export const MAX_BEITRAEGE = 40;
export const MAX_ZEICHEN = 2000;

export type Beitrag = {
  rolle: Rolle;
  text: string;
  phase?: Phase;
  aporie?: boolean;
};

export type Einordnung = "behauptung" | "begruendung" | "ueberarbeitung" | "themenfremd";

export type DialogZustand = {
  phase: Phase;
  zuege: number;
  geprueft: number;
  ueberarbeitungen: number;
  diagnose: boolean;
  einsichtSchritte: number;
  abgeschlossen: boolean;
};

export type Ereignis = "annahme_verworfen" | "diagnose_erreicht" | "abgeschlossen";

export type CoachAnfrage = {
  fallId: string;
  verlauf: Beitrag[];
  zustand: DialogZustand;
  ueberdenken?: boolean;
};

export type CoachAntwort = {
  antwort: string;
  zustand: DialogZustand;
  ereignisse: Ereignis[];
  modus: "skript" | "claude";
  hinweis?: string;
};

export type ArbeitsblattTeil =
  | "lernsituation"
  | "einstieg"
  | "kernaufgaben"
  | "hilfekarten"
  | "sprache"
  | "selbstkontrolle"
  | "kiImpuls"
  | "lehrkraftKopf";

export const ARBEITSBLATT_TEILE: { id: ArbeitsblattTeil; titel: string }[] = [
  { id: "lernsituation", titel: "1 Lernsituation" },
  { id: "einstieg", titel: "2 Einstieg über die Stärke" },
  { id: "kernaufgaben", titel: "3 Kernaufgaben in drei Niveaustufen" },
  { id: "hilfekarten", titel: "4 Gestufte Hilfekarten" },
  { id: "sprache", titel: "5 Sprachsensible Unterstützung" },
  { id: "selbstkontrolle", titel: "6 Selbstkontrolle" },
  { id: "kiImpuls", titel: "7 KI-Impuls für Lernende" },
  { id: "lehrkraftKopf", titel: "8 Lehrkraft-Kopf" },
];

export type MangelArt = "fachlich" | "bias" | "sprache";

export const MANGEL_ARTEN: { id: MangelArt | "anderes"; titel: string }[] = [
  { id: "fachlich", titel: "Fachlicher Fehler" },
  { id: "bias", titel: "Stereotyp oder Bias" },
  { id: "sprache", titel: "Sprachniveau passt nicht" },
  { id: "anderes", titel: "Anderer Mangel" },
];

export type Mangel = {
  teil: ArbeitsblattTeil;
  art: MangelArt;
  titel: string;
  erklaerung: string;
};

export type Fallakte = {
  id: string;
  name: string;
  alter: number;
  beruf: string;
  abschluss: string;
  thema: "M1" | "M2" | "W1" | "W2";
  themaTitel: string;
  pfade: Lernpfad[];
  stufe: 1 | 2 | 3;
  spielbar: boolean;
  kompassEbene: string;
  steckbrief: string[];
  staerken: string[];
  interessen: string[];
  rahmen: string[];
  kiNutzung: string;
  aufgaben: {
    titel: string;
    aufgabe: string;
    loesung: string;
    richtig: boolean;
    musterloesung: string;
  }[];
  musterdiagnose: {
    staerke: string;
    schwierigkeit: string;
    rahmen: string;
    loesungsbegriffe: string[];
  };
  hilfekarten: { stufe: string; text: string }[];
  ausgangsfrage: string;
  // Drehbuch für den Modus ohne KI und als Rückfallebene, wenn eine KI-Antwort die Prüfung nicht besteht.
  skript: {
    pruefung: string[];
    aporie: string;
    einsichtOhneDiagnose: string[];
    einsicht: string[];
    synthese: string;
    abschluss: string;
    diagnoseSignale: string[];
  };
  entwurf: Record<ArbeitsblattTeil, string>;
  maengel: Mangel[];
  kompassFragen: { ebene: string; frage: string }[];
};

export type Lernpfad = "mathe" | "bwr";
