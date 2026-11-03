import type { DialogZustand, Einordnung, Fallakte, Phase } from "@/lib/typen";

// Coach nach festem Drehbuch: funktioniert ohne KI-Zugang und dient als Rückfallebene.

const UEBERARBEITUNG_SIGNALE = [
  "stimmt nicht",
  "stimmt so nicht",
  "richtig gelöst",
  "richtig gerechnet",
  "kann er",
  "korrekt",
  "nicht ganz",
  "eigentlich",
  "falsch eingeschätzt",
  "korrigiere",
  "revidiere",
  "überdenke",
];

export function skriptEinordnung(
  text: string,
  fall: Fallakte,
): { einordnung: Einordnung; diagnose: boolean } {
  const klein = text.toLowerCase();
  const diagnose = fall.skript.diagnoseSignale.some((s) => klein.includes(s));
  if (UEBERARBEITUNG_SIGNALE.some((s) => klein.includes(s)) || /(^|[\s,.])doch\b/.test(klein)) {
    return { einordnung: "ueberarbeitung", diagnose };
  }
  if (klein.trim().length < 8) return { einordnung: "themenfremd", diagnose };
  return { einordnung: klein.length < 60 ? "behauptung" : "begruendung", diagnose };
}

export function skriptAntwort(fall: Fallakte, phase: Phase, z: DialogZustand): string {
  const s = fall.skript;
  switch (phase) {
    case "aporie":
      return s.aporie;
    case "einsicht":
      if (!z.diagnose) {
        return s.einsichtOhneDiagnose[(z.zuege - 1) % s.einsichtOhneDiagnose.length];
      }
      return s.einsicht[Math.min(z.einsichtSchritte - 1, s.einsicht.length - 1)];
    case "synthese":
      return s.synthese;
    default:
      return s.pruefung[Math.min(Math.max(z.geprueft, 0), s.pruefung.length - 1)];
  }
}
