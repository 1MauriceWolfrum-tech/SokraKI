import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { fallakte } from "@/lib/inhalte/faelle";
import { abschlussZustand, antwortPhase, folgeZustand, startZustand } from "@/lib/coach/phasen";
import { skriptAntwort, skriptEinordnung } from "@/lib/coach/skript";
import { CoachNichtVerfuegbar, claudeAntwort, claudeEinordnung } from "@/lib/coach/claude";
import {
  MAX_BEITRAEGE,
  MAX_ZEICHEN,
  PHASEN,
  type CoachAnfrage,
  type CoachAntwort,
  type Einordnung,
  type Ereignis,
} from "@/lib/typen";

// Dialog-Steuerung (Konzept, Kapitel 8.5): einzige Stelle mit Zugang zum Sprachmodell.

const MODUS: CoachAntwort["modus"] = process.env.COACH_MODUS === "claude" ? "claude" : "skript";

const ZAEHLER = ["zuege", "geprueft", "ueberarbeitungen", "einsichtSchritte"] as const;

function istGueltig(daten: unknown): daten is CoachAnfrage {
  if (typeof daten !== "object" || daten === null) return false;
  const a = daten as Record<string, unknown>;
  if (typeof a.fallId !== "string" || a.fallId.length > 40) return false;
  if (a.ueberdenken !== undefined && typeof a.ueberdenken !== "boolean") return false;

  if (!Array.isArray(a.verlauf) || a.verlauf.length > MAX_BEITRAEGE) return false;
  const beitraegeOk = a.verlauf.every((b: unknown) => {
    if (typeof b !== "object" || b === null) return false;
    const { rolle, text } = b as Record<string, unknown>;
    return (rolle === "coach" || rolle === "lehrkraft") && typeof text === "string" && text.length <= MAX_ZEICHEN;
  });
  if (!beitraegeOk) return false;
  if (a.verlauf.length > 0 && (a.verlauf.at(-1) as { rolle: string }).rolle !== "lehrkraft") return false;

  if (typeof a.zustand !== "object" || a.zustand === null) return false;
  const z = a.zustand as Record<string, unknown>;
  if (!PHASEN.some((p) => p.id === z.phase)) return false;
  if (typeof z.diagnose !== "boolean" || typeof z.abgeschlossen !== "boolean") return false;
  return ZAEHLER.every((k) => Number.isInteger(z[k]) && (z[k] as number) >= 0 && (z[k] as number) <= MAX_BEITRAEGE);
}

function fehlerHinweis(fehler: unknown): string {
  if (fehler instanceof Anthropic.AuthenticationError) return "KI-Zugang abgelehnt – prüfe die Zugangsdaten.";
  if (fehler instanceof Anthropic.RateLimitError) return "KI gerade ausgelastet.";
  if (fehler instanceof Anthropic.APIError) return `KI-Fehler ${fehler.status ?? ""}`.trim() + ".";
  if (fehler instanceof Anthropic.AnthropicError) return "KI nicht eingerichtet – fehlen die Zugangsdaten (siehe README)?";
  if (fehler instanceof CoachNichtVerfuegbar) return "KI hat die Antwort abgebrochen.";
  if (fehler instanceof SyntaxError) return "KI-Einordnung war nicht lesbar.";
  return "KI nicht erreichbar oder nicht eingerichtet – Zugangsdaten prüfen (siehe README).";
}

export async function POST(request: Request) {
  let daten: unknown;
  try {
    daten = await request.json();
  } catch {
    return NextResponse.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }
  if (!istGueltig(daten)) {
    return NextResponse.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }
  const anfrage = daten;
  const fall = fallakte(anfrage.fallId);
  if (!fall || !fall.spielbar) {
    return NextResponse.json({ fehler: "Diese Fallakte ist noch nicht spielbar." }, { status: 404 });
  }

  const { verlauf, zustand } = anfrage;

  if (verlauf.length === 0) {
    const antwort: CoachAntwort = {
      antwort: fall.ausgangsfrage,
      zustand: startZustand(),
      ereignisse: [],
      modus: MODUS,
    };
    return NextResponse.json(antwort);
  }

  if (zustand.phase === "synthese") {
    const antwort: CoachAntwort = {
      antwort: fall.skript.abschluss,
      zustand: abschlussZustand(zustand),
      ereignisse: ["abgeschlossen"],
      modus: MODUS,
    };
    return NextResponse.json(antwort);
  }

  const letzterBeitrag = verlauf.at(-1)?.text ?? "";
  let modus = MODUS;
  let hinweis: string | undefined;

  let einordnung: Einordnung;
  let diagnoseJetzt: boolean;
  if (modus === "claude") {
    try {
      ({ einordnung, diagnose: diagnoseJetzt } = await claudeEinordnung(fall, verlauf));
    } catch (fehler) {
      console.error("Einordnung fehlgeschlagen:", fehler);
      hinweis = `${fehlerHinweis(fehler)} Der Coach arbeitet für diese Antwort nach Drehbuch.`;
      modus = "skript";
      ({ einordnung, diagnose: diagnoseJetzt } = skriptEinordnung(letzterBeitrag, fall));
    }
  } else {
    ({ einordnung, diagnose: diagnoseJetzt } = skriptEinordnung(letzterBeitrag, fall));
  }
  if (anfrage.ueberdenken) einordnung = "ueberarbeitung";

  const phase = antwortPhase(zustand, einordnung, diagnoseJetzt);
  const neu = folgeZustand(zustand, phase, diagnoseJetzt);

  let text: string | null = null;
  if (modus === "claude") {
    try {
      const ergebnis = await claudeAntwort(fall, verlauf, phase, neu);
      text = ergebnis.antwort;
      if (ergebnis.korrigiert) {
        hinweis = text
          ? "Der Coach war aus der Rolle gefallen und wurde automatisch korrigiert."
          : "Die KI-Antwort hielt die Regeln nicht ein; das Drehbuch hat übernommen.";
      }
    } catch (fehler) {
      console.error("Antwort fehlgeschlagen:", fehler);
      hinweis = `${fehlerHinweis(fehler)} Der Coach arbeitet für diese Antwort nach Drehbuch.`;
    }
  }
  if (!text) {
    text = skriptAntwort(fall, phase, neu);
    modus = "skript";
  }

  const ereignisse: Ereignis[] = [];
  if (phase === "aporie") ereignisse.push("annahme_verworfen");
  if (neu.diagnose && !zustand.diagnose) ereignisse.push("diagnose_erreicht");

  const antwort: CoachAntwort = { antwort: text, zustand: neu, ereignisse, modus, hinweis };
  return NextResponse.json(antwort);
}
