import type { DialogZustand, Einordnung, Phase } from "@/lib/typen";

// Zustandsautomat des sokratischen Dialogs (Konzept, Kapitel 4.1 und 8.4).
// Die Phase legt die App fest, nicht das Sprachmodell: Das Modell formuliert nur die Frage.

export const MAX_ZUEGE = 12;
export const EINSICHT_SCHRITTE = 3;

export function startZustand(): DialogZustand {
  return {
    phase: "ausgangsfrage",
    zuege: 0,
    geprueft: 0,
    ueberarbeitungen: 0,
    diagnose: false,
    einsichtSchritte: 0,
    abgeschlossen: false,
  };
}

// Welche Phase bedient die nächste Antwort des Coachs?
export function antwortPhase(
  z: DialogZustand,
  einordnung: Einordnung,
  diagnoseJetzt: boolean,
): Phase {
  if (z.zuege + 1 >= MAX_ZUEGE) return "synthese";
  if (einordnung === "ueberarbeitung") return "aporie";
  const diagnose = z.diagnose || diagnoseJetzt;
  if (diagnose && z.einsichtSchritte >= EINSICHT_SCHRITTE) return "synthese";
  if (diagnose) return "einsicht";
  if (z.phase === "aporie" || z.phase === "einsicht") return "einsicht";
  return "pruefung";
}

export function folgeZustand(z: DialogZustand, phase: Phase, diagnoseJetzt: boolean): DialogZustand {
  const diagnose = z.diagnose || diagnoseJetzt;
  return {
    phase,
    zuege: z.zuege + 1,
    geprueft: z.geprueft + (z.phase === "pruefung" || z.phase === "aporie" ? 1 : 0),
    ueberarbeitungen: z.ueberarbeitungen + (phase === "aporie" ? 1 : 0),
    diagnose,
    einsichtSchritte: z.einsichtSchritte + (phase === "einsicht" && diagnose ? 1 : 0),
    abgeschlossen: false,
  };
}

export function abschlussZustand(z: DialogZustand): DialogZustand {
  return { ...z, zuege: z.zuege + 1, abgeschlossen: true };
}

// Sokrates-Meter: Wie gründlich wurde geprüft? 0 bis 10.
export function sokratesMeter(z: DialogZustand): number {
  return Math.min(10, z.geprueft + 2 * z.ueberarbeitungen + (z.diagnose ? 2 : 0));
}
