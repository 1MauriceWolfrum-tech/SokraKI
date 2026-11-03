// Module 0–6 aus Konzept Kapitel 6.1. Im Prototyp sind die Module 4 und 5 über die Fallakten spielbar.

export type Modul = {
  nr: number;
  icon: string;
  titel: string;
  raum: string;
  dauer: number;
  leitfrage: string;
  artefakt: string;
  imPrototyp: boolean;
};

export const MODULE: Modul[] = [
  { nr: 0, icon: "🏫", titel: "Start", raum: "Sekretariat", dauer: 30, leitfrage: "Wo stehe ich?", artefakt: "Selbsteinschätzung, Lernpfad", imPrototyp: false },
  { nr: 1, icon: "💻", titel: "KI verstehen", raum: "Computerraum", dauer: 90, leitfrage: "Was kann KI – und was nicht?", artefakt: "Risiko-Steckbrief", imPrototyp: false },
  { nr: 2, icon: "⚖️", titel: "KI und Gerechtigkeit", raum: "Lehrerzimmer", dauer: 90, leitfrage: "Wem nützt KI, wen benachteiligt sie?", artefakt: "Kompass-Notizen", imPrototyp: false },
  { nr: 3, icon: "📚", titel: "Sokratischer Dialog", raum: "Bibliothek", dauer: 120, leitfrage: "Wie bringe ich KI dazu, mich zum Denken zu bringen?", artefakt: "Angepasster Master-Prompt", imPrototyp: false },
  { nr: 4, icon: "🩺", titel: "Diagnose", raum: "Klassenzimmer", dauer: 150, leitfrage: "Was braucht diese Person?", artefakt: "Stärken-Schwächen-Profil", imPrototyp: true },
  { nr: 5, icon: "🛠️", titel: "Prompt-Werkstatt", raum: "Werkstatt", dauer: 180, leitfrage: "Wie entsteht ein passendes, fehlerfreies Arbeitsblatt?", artefakt: "Geprüftes Arbeitsblatt", imPrototyp: true },
  { nr: 6, icon: "🎭", titel: "Transfer", raum: "Aula", dauer: 90, leitfrage: "Was nehme ich in meinen Unterricht mit?", artefakt: "Reflexion, Portfolio", imPrototyp: false },
];
