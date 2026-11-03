"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FallRahmen, useFallId } from "@/components/FallRahmen";
import { PUNKTE } from "@/lib/inhalte/spiel";
import { useSpielstand, type FallStand } from "@/lib/spielstand";
import { ARBEITSBLATT_TEILE, type Fallakte } from "@/lib/typen";

// Prompt-Baukasten nach dem Dreischritt aus den Seminarunterlagen:
// 1 Kritische Analyse, 2 Spezifikation (Few-Shot), 3 Strukturierung (Chain-of-Thought).

type Prompt = FallStand["prompt"];

const KRITERIEN: { id: string; titel: string; erfuellt: (p: Prompt) => boolean }[] = [
  // „Lernziel: …“ aus der Profilübernahme ist nur ein Platzhalter und zählt erst, wenn er ausgefüllt ist.
  { id: "ziel", titel: "Lernziel genannt", erfuellt: (p) => /lernziel:[ \t]*[^\s…]|ziel ist|soll .*können|soll .*lernen/i.test(alle(p)) },
  { id: "staerke", titel: "Stärke als Anknüpfungspunkt", erfuellt: (p) => /stärke|knüpf|kann .*sicher|sicher .*rechn/i.test(alle(p)) },
  { id: "schwierigkeit", titel: "Schwierigkeit präzise benannt", erfuellt: (p) => /schwierig|fehler|fehlvorstellung|scheitert|verwechselt/i.test(alle(p)) },
  { id: "rahmen", titel: "Rahmenbedingungen berücksichtigt", erfuellt: (p) => /smartphone|handy|drucker|digital|mobil/i.test(alle(p)) },
  { id: "sprache", titel: "Sprachniveau festgelegt", erfuellt: (p) => /sprach|einfache|kurze sätze|niveau/i.test(alle(p)) },
  { id: "beispiel", titel: "Mindestens ein Beispiel (Few-Shot)", erfuellt: (p) => p.beispiele.trim().length >= 30 },
  {
    id: "schritte",
    titel: "Mindestens drei Schritte (Chain-of-Thought)",
    erfuellt: (p) => p.schritte.split("\n").filter((z) => z.trim().length > 2).length >= 3,
  },
  { id: "pruefen", titel: "Auftrag zur Selbstprüfung der KI", erfuellt: (p) => /prüf|kontrollier|fehlerfrei/i.test(alle(p)) },
];

function alle(p: Prompt): string {
  return `${p.analyse}\n${p.beispiele}\n${p.schritte}`;
}

const MINDEST_KRITERIEN = 5;

function zusammensetzen(p: Prompt): string {
  return `<Rolle>Du unterstützt eine Lehrkraft an einer Berufsschule beim Erstellen eines Förderarbeitsblatts.</Rolle>
<Analyse>
${p.analyse.trim()}
</Analyse>
<Beispiele>
${p.beispiele.trim()}
</Beispiele>
<Schritte>
${p.schritte.trim()}
</Schritte>
<Ausgabe>Gliedere das Arbeitsblatt in diese acht Teile: ${ARBEITSBLATT_TEILE.map((t) => t.titel.replace(/^\d+ /, "")).join(", ")}. Kennzeichne es als „KI-gestützt erstellt“.</Ausgabe>`;
}

function ausProfil(akte: Fallakte, f: FallStand): string {
  const p = f.profil;
  return `Lernausgangslage: ${akte.name}, ${akte.alter} Jahre, ${akte.beruf}, ${akte.abschluss}.
Stärke: ${p.staerke || "…"}
Schwierigkeit: ${p.schwierigkeit || "…"}
Rahmenbedingungen: ${p.rahmen || "…"}
Lernziel: …
Nimm nichts über ${akte.name} an, was hier nicht steht, und verwende keine Klischees über Personen.`;
}

export default function WerkstattPage() {
  const id = useFallId();
  const router = useRouter();
  const { fall, aendereFall, vergebe } = useSpielstand();
  const [kopiert, setKopiert] = useState(false);
  const f = fall(id);
  const p = f.prompt;

  function setze(feld: "analyse" | "beispiele" | "schritte", wert: string) {
    aendereFall(id, (s) => ({ ...s, prompt: { ...s.prompt, [feld]: wert } }));
  }

  const erfuellt = KRITERIEN.filter((k) => k.erfuellt(p));

  function erzeugen() {
    for (const k of erfuellt) vergebe(`${id}-prompt-${k.id}`, PUNKTE.promptKriterium, `Prompt: ${k.titel}`);
    aendereFall(id, (s) => ({ ...s, prompt: { ...s.prompt, erzeugt: true } }));
    router.push(`/fall/${id}/challenge`);
  }

  return (
    <FallRahmen aktiv="werkstatt">
      {(akte) => (
        <>
          <h1>🛠️ Prompt-Werkstatt</h1>
          <p>
            Baue deinen Prompt in drei Schritten. Der erste KI-Entwurf ist der Ausgangspunkt, nicht das Ergebnis – du
            prüfst ihn danach.
          </p>
          {!f.profil.gespeichert && (
            <p className="hinweis">
              Dein Profil ist noch nicht gespeichert. <Link href={`/fall/${id}/profil`}>Zum Profil</Link>
            </p>
          )}

          <section className="karte">
            <h2>1 Kritische Analyse</h2>
            <p className="hilfe">
              Beschreibe Lernausgangslage, Lernziel und Rahmen. Was soll die KI ausdrücklich nicht annehmen?
            </p>
            <textarea
              aria-label="Kritische Analyse"
              value={p.analyse}
              onChange={(e) => setze("analyse", e.target.value)}
              style={{ minHeight: 140 }}
            />
            <button type="button" className="knopf knopf-leise" onClick={() => setze("analyse", ausProfil(akte, f))}>
              Aus meinem Profil übernehmen
            </button>
          </section>

          <section className="karte">
            <h2>2 Spezifikation mit Beispielen (Few-Shot)</h2>
            <p className="hilfe">Gib ein bis zwei Beispielaufgaben vor, die Stil, Niveau und Format zeigen.</p>
            <textarea
              aria-label="Beispiele"
              value={p.beispiele}
              onChange={(e) => setze("beispiele", e.target.value)}
            />
            <button
              type="button"
              className="knopf knopf-leise"
              onClick={() =>
                setze(
                  "beispiele",
                  `Beispiel für Stil und Niveau:\n„${akte.aufgaben[1]?.aufgabe ?? ""}“\nKurze Sätze, ein Rechenschritt pro Zeile, Bezug zur Kasse im Betrieb.`,
                )
              }
            >
              Beispiel aus der Akte einfügen
            </button>
          </section>

          <section className="karte">
            <h2>3 Strukturierung (Chain-of-Thought)</h2>
            <p className="hilfe">Lege fest, in welchen Schritten die KI das Arbeitsblatt aufbauen soll – ein Schritt pro Zeile.</p>
            <textarea
              aria-label="Schrittfolge"
              value={p.schritte}
              onChange={(e) => setze("schritte", e.target.value)}
              style={{ minHeight: 140 }}
            />
            <button
              type="button"
              className="knopf knopf-leise"
              onClick={() =>
                setze(
                  "schritte",
                  ARBEITSBLATT_TEILE.map((t) => `${t.titel.replace(/^(\d+) /, "$1. ")}`).join("\n") +
                    "\nPrüfe zum Schluss jede Aufgabe und jede Probe auf fachliche Richtigkeit.",
                )
              }
            >
              Arbeitsblatt-Vorlage als Schritte einfügen
            </button>
          </section>

          <section className="karte">
            <h2>Prompt-Check</h2>
            <ul className="liste">
              {KRITERIEN.map((k) => (
                <li key={k.id}>
                  {k.erfuellt(p) ? "✅" : "⬜"} {k.titel}
                </li>
              ))}
            </ul>
            <p className="klein leise">
              {erfuellt.length} von {KRITERIEN.length} Kriterien erfüllt · ab {MINDEST_KRITERIEN} kannst du den Entwurf
              erzeugen.
            </p>
          </section>

          <details className="karte">
            <summary>So sieht dein Prompt für die KI aus</summary>
            <pre className="loesung abstand">{zusammensetzen(p)}</pre>
            <button
              type="button"
              className="knopf"
              onClick={() => {
                void navigator.clipboard.writeText(zusammensetzen(p)).then(() => setKopiert(true));
              }}
            >
              {kopiert ? "Kopiert" : "Prompt kopieren"}
            </button>
            <p className="hilfe">Du kannst ihn zusätzlich in der KI deiner Hochschule ausprobieren.</p>
          </details>

          <p className="hinweis">
            In Fall 1 ist der KI-Entwurf vorbereitet: Er stammt aus einem ähnlichen Prompt und enthält typische
            KI-Mängel. So ist die Validierungs-Challenge für alle gleich und auswertbar.
          </p>
          <button
            type="button"
            className="knopf knopf-primaer"
            disabled={erfuellt.length < MINDEST_KRITERIEN}
            onClick={erzeugen}
          >
            ⚡ Entwurf erzeugen und prüfen
          </button>
        </>
      )}
    </FallRahmen>
  );
}
