"use client";

import Link from "next/link";
import { useState } from "react";
import { FallRahmen, useFallId } from "@/components/FallRahmen";
import { PUNKTE } from "@/lib/inhalte/spiel";
import { useSpielstand, type KompassWert } from "@/lib/spielstand";

const MAX_RUNDEN = 3;
const BEGRUENDUNG_MIN = 10;
const OPTIONEN: { wert: KompassWert; titel: string; farbe: string }[] = [
  { wert: "ja", titel: "✅ Ja", farbe: "knopf-gut" },
  { wert: "teilweise", titel: "🤔 Teilweise", farbe: "knopf-warnung" },
  { wert: "nein", titel: "❌ Nein", farbe: "knopf-kritisch" },
];

export default function KompassPage() {
  const id = useFallId();
  const { fall, aendereFall, vergebe, verleihe } = useSpielstand();
  const f = fall(id);
  const [ergebnis, setErgebnis] = useState<"bestanden" | "ueberarbeiten" | "abschliessen" | null>(null);

  function setze(i: number, teil: { wert?: KompassWert; begruendung?: string }) {
    aendereFall(id, (s) => ({
      ...s,
      kompassBestanden: false,
      kompass: s.kompass.map((k, j) => (j === i ? { ...k, ...teil } : k)),
    }));
  }

  const vollstaendig = f.kompass.every(
    (k) => k.wert !== "" && (k.wert === "ja" || k.begruendung.trim().length >= BEGRUENDUNG_MIN),
  );

  function abschliessen() {
    if (f.kompass.every((k) => k.begruendung.trim().length >= BEGRUENDUNG_MIN)) {
      vergebe(`${id}-kompass`, PUNKTE.kompassBegruendet, "Kompass-Check durchgehend begründet");
    }
    const bestanden = !f.kompass.some((k) => k.wert === "nein");
    if (bestanden || f.runde >= MAX_RUNDEN) {
      aendereFall(id, (s) => ({ ...s, kompassBestanden: true }));
      if (f.arbeitsblatt) verleihe("architekt", "Arbeitsblatt-Architekt:in");
      setErgebnis(bestanden ? "bestanden" : "abschliessen");
    } else {
      aendereFall(id, (s) => ({ ...s, runde: s.runde + 1 }));
      setErgebnis("ueberarbeiten");
    }
  }

  return (
    <FallRahmen aktiv="kompass">
      {(akte) => (
        <>
          <h1>🧭 Kompass-Check</h1>
          <p>
            Prüfe dein Arbeitsblatt mit dem KI-Gerechtigkeitskompass. Bei „teilweise“ und „nein“ begründest du deine
            Einschätzung.
          </p>
          {!f.arbeitsblatt && (
            <p className="hinweis">
              Du hast das Arbeitsblatt noch nicht überarbeitet. <Link href={`/fall/${id}/challenge`}>Zur Validierung</Link>
            </p>
          )}

          {akte.kompassFragen.map((q, i) => {
            const k = f.kompass[i];
            return (
              <fieldset key={q.ebene} className="karte" style={{ margin: "0 0 1rem" }}>
                <legend className="chip">{q.ebene}</legend>
                <p className="abstand">{q.frage}</p>
                <div className="zeile" role="radiogroup" aria-label={q.ebene}>
                  {OPTIONEN.map((o) => (
                    <button
                      key={o.wert}
                      type="button"
                      role="radio"
                      aria-checked={k.wert === o.wert}
                      className={`knopf ${o.farbe}`}
                      onClick={() => setze(i, { wert: o.wert })}
                    >
                      {o.titel}
                    </button>
                  ))}
                </div>
                <textarea
                  className="abstand"
                  aria-label={`Begründung zu ${q.ebene}`}
                  value={k.begruendung}
                  onChange={(e) => setze(i, { begruendung: e.target.value })}
                  placeholder="Begründung"
                  style={{ minHeight: 60 }}
                />
              </fieldset>
            );
          })}

          <button type="button" className="knopf knopf-primaer" disabled={!vollstaendig} onClick={abschliessen}>
            Kompass-Check abschließen
          </button>
          {!vollstaendig && (
            <p className="hilfe">Beantworte alle sieben Fragen; „teilweise“ und „nein“ brauchen eine Begründung.</p>
          )}

          {ergebnis === "ueberarbeiten" && (
            <section className="karte karte-akzent abstand">
              <h2>🔁 Noch nicht bestanden</h2>
              <p>
                Mindestens eine Ebene hast du mit „nein“ bewertet. Überarbeite das Arbeitsblatt – Runde {f.runde} von{" "}
                {MAX_RUNDEN}.
              </p>
              <Link className="knopf knopf-primaer" href={`/fall/${id}/challenge#ueberarbeiten`}>
                Arbeitsblatt überarbeiten
              </Link>
            </section>
          )}
          {(ergebnis === "bestanden" || ergebnis === "abschliessen" || (f.kompassBestanden && ergebnis === null)) && (
            <section className="karte karte-akzent abstand">
              <h2>{ergebnis === "abschliessen" ? "🏁 Nach drei Runden abgeschlossen" : "🎉 Kompass-Check bestanden"}</h2>
              {ergebnis === "abschliessen" && (
                <p>Halte die offenen Punkte in deiner Reflexion fest.</p>
              )}
              <Link className="knopf knopf-primaer" href={`/fall/${id}/ergebnis`}>
                Zum fertigen Arbeitsblatt
              </Link>
            </section>
          )}
        </>
      )}
    </FallRahmen>
  );
}
