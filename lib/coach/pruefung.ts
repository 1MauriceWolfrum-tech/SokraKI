import type { Beitrag, Fallakte } from "@/lib/typen";

// Leitplanken für jede Coach-Antwort (Konzept, Kapitel 8.4). Liefert die gefundenen Verstöße.
export function pruefeAntwort(antwort: string, verlauf: Beitrag[], fall: Fallakte): string[] {
  const probleme: string[] = [];
  const text = antwort.trim();

  const fragezeichen = (text.match(/\?/g) ?? []).length;
  if (fragezeichen !== 1 || !/\?["“”»«']?$/.test(text)) {
    probleme.push("Die Antwort endet nicht mit genau einer Frage.");
  }

  const saetze = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 0);
  if (saetze.length > 4) probleme.push("Die Antwort ist länger als drei bis vier Sätze.");

  // Lösungsbegriffe sind nur erlaubt, wenn die Lehrkraft sie selbst schon verwendet hat.
  const lehrkraft = verlauf
    .filter((b) => b.rolle === "lehrkraft")
    .map((b) => b.text.toLowerCase())
    .join(" ");
  const klein = text.toLowerCase();
  const verraten = fall.musterdiagnose.loesungsbegriffe.filter(
    (begriff) => klein.includes(begriff) && !lehrkraft.includes(begriff),
  );
  if (verraten.length > 0) probleme.push(`Die Antwort verrät die Diagnose (${verraten.join(", ")}).`);

  if (/\bich (freue|fühle|bin traurig|mag dich)/i.test(text)) {
    probleme.push("Die Antwort bekundet Gefühle.");
  }

  return probleme;
}

// Korrektur-Prompt aus dem Seminar-Handout „Sokratisches Prompting im Schulalltag“.
export function kurskorrektur(fall: Fallakte): string {
  return `Kurze Erinnerung an unsere Abmachung. Wir planen gerade ein Förderarbeitsblatt für ${fall.name} zum Thema ${fall.themaTitel}. Bitte halte dich wieder strikt an deine Rolle als Coach. Stelle immer nur exakt eine Gegenfrage und liefere keine fertigen Entwürfe oder Lösungen.`;
}
