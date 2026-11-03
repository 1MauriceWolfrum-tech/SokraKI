// Spielelemente aus Konzept Kapitel 7: Abzeichen sind an Lernziele gekoppelt, Punkte an
// regelbasierte Kriterien, Stufen an abgeschlossene Schritte.

export type Abzeichen = {
  id: string;
  icon: string;
  titel: string;
  lernziel: string;
  kriterium: string;
  imPrototyp: boolean;
};

export const ABZEICHEN: Abzeichen[] = [
  {
    id: "halluzination",
    icon: "🔍",
    titel: "Halluzinations-Jäger:in",
    lernziel: "LZ 2",
    kriterium: "Modul 1: versteckte Fehler in drei KI-Antworten finden",
    imPrototyp: false,
  },
  {
    id: "kompasstraeger",
    icon: "🧭",
    titel: "Kompass-Träger:in",
    lernziel: "LZ 3",
    kriterium: "Modul 2: Kompass-Ebenen Fallbeispielen zuordnen",
    imPrototyp: false,
  },
  {
    id: "maeeutiker",
    icon: "💡",
    titel: "Mäeutiker:in",
    lernziel: "LZ 5",
    kriterium: "Diagnose-Dialog abschließen und dabei eine eigene Annahme begründet verwerfen",
    imPrototyp: true,
  },
  {
    id: "diagnose",
    icon: "🩺",
    titel: "Diagnose-Profi",
    lernziel: "LZ 6",
    kriterium: "Stärken-Schwächen-Profil mit Belegen aus der Akte erstellen",
    imPrototyp: true,
  },
  {
    id: "bias",
    icon: "🕵️",
    titel: "Bias-Detektiv:in",
    lernziel: "LZ 8",
    kriterium: "Alle drei Mängel der Validierungs-Challenge finden",
    imPrototyp: true,
  },
  {
    id: "architekt",
    icon: "🏗️",
    titel: "Arbeitsblatt-Architekt:in",
    lernziel: "LZ 7, LZ 8",
    kriterium: "Kompass-Check bestehen und das Arbeitsblatt fertigstellen",
    imPrototyp: true,
  },
  {
    id: "peer",
    icon: "🤝",
    titel: "Peer-Mentor:in",
    lernziel: "LZ 9",
    kriterium: "Modul 6: zwei fremde Arbeitsblätter begründet rückmelden",
    imPrototyp: false,
  },
  {
    id: "kompassmeister",
    icon: "🏆",
    titel: "Kompass-Meister:in",
    lernziel: "LZ 9",
    kriterium: "Modul 6: Kurs mit Reflexion und Post-Einschätzung abschließen",
    imPrototyp: false,
  },
];

export const PUNKTE = {
  annahmeVerworfen: 30,
  diagnoseErreicht: 15,
  dialogAbgeschlossen: 20,
  profilBeleg: 10,
  annahmenCheck: 10,
  promptKriterium: 5,
  mangelGefunden: 20,
  mangelArtRichtig: 5,
  fehlalarmBegruendet: 5,
  kompassBegruendet: 15,
  reflexion: 10,
} as const;

export const STUFEN = ["Hospitant:in", "Referendar:in", "Lehrkraft", "Mentor:in"] as const;
export const STUFEN_ICONS = ["🎒", "📝", "🍎", "🌟"] as const;

// Wählbare Lehrkraft-Avatare (rein kosmetisch, Konzept Kapitel 7.1).
export const AVATARE = ["🧑‍🏫", "👩‍🏫", "👨‍🏫", "👩🏽‍🏫", "🧑🏿‍🏫", "👨🏻‍🏫", "👩🏼‍🏫", "🧑🏾‍🏫"] as const;
