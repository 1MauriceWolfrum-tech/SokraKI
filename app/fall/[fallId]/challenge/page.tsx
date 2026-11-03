"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FallRahmen, useFallId } from "@/components/FallRahmen";
import { PUNKTE } from "@/lib/inhalte/spiel";
import { useSpielstand } from "@/lib/spielstand";
import { ARBEITSBLATT_TEILE, MANGEL_ARTEN, type ArbeitsblattTeil, type Fallakte } from "@/lib/typen";

const BEGRUENDUNG_MIN = 20;
const MAX_FEHLALARM_PUNKTE = 2;

export default function ChallengePage() {
  const id = useFallId();
  const router = useRouter();
  const { fall, aendereFall, vergebe, verleihe } = useSpielstand();
  const f = fall(id);
  const [entwurf, setEntwurf] = useState<Record<ArbeitsblattTeil, string> | null>(null);

  function meldung(teil: ArbeitsblattTeil, aenderung: { art?: string; begruendung?: string } | null) {
    aendereFall(id, (s) => {
      const meldungen = { ...s.meldungen };
      if (aenderung === null) delete meldungen[teil];
      else meldungen[teil] = { art: "", begruendung: "", ...meldungen[teil], ...aenderung };
      return { ...s, meldungen };
    });
  }

  function auswerten(akte: Fallakte) {
    let gefunden = 0;
    for (const m of akte.maengel) {
      const gemeldet = f.meldungen[m.teil];
      if (!gemeldet) continue;
      gefunden += 1;
      vergebe(`${id}-mangel-${m.teil}`, PUNKTE.mangelGefunden, `Mangel gefunden: ${m.titel}`);
      if (gemeldet.art === m.art) vergebe(`${id}-mangelart-${m.teil}`, PUNKTE.mangelArtRichtig, "Art des Mangels erkannt");
    }
    const fehlalarme = ARBEITSBLATT_TEILE.filter(
      (t) =>
        !akte.maengel.some((m) => m.teil === t.id) &&
        (f.meldungen[t.id]?.begruendung.trim().length ?? 0) >= BEGRUENDUNG_MIN,
    ).slice(0, MAX_FEHLALARM_PUNKTE);
    for (const t of fehlalarme) {
      vergebe(`${id}-fehlalarm-${t.id}`, PUNKTE.fehlalarmBegruendet, "Begründeter Prüfhinweis");
    }
    if (gefunden === akte.maengel.length) verleihe("bias", "Bias-Detektiv:in");
    aendereFall(id, (s) => ({ ...s, challengeAusgewertet: true }));
  }

  function speichern(text: Record<ArbeitsblattTeil, string>) {
    aendereFall(id, (s) => ({ ...s, arbeitsblatt: text, kompassBestanden: false }));
    router.push(`/fall/${id}/kompass`);
  }

  return (
    <FallRahmen aktiv="challenge">
      {(akte) => {
        const text = entwurf ?? f.arbeitsblatt ?? akte.entwurf;
        const gefunden = akte.maengel.filter((m) => f.meldungen[m.teil]).length;
        return (
          <>
            <h1>🕵️ Validierungs-Challenge</h1>
            {!f.prompt.erzeugt && (
              <p className="hinweis">
                Du hast noch keinen Entwurf erzeugt. <Link href={`/fall/${id}/werkstatt`}>Zur Prompt-Werkstatt</Link>
              </p>
            )}
            <p>
              Der KI-Entwurf klingt überzeugend – und enthält Mängel. Prüfe jeden Teil, melde, was du findest, und
              begründe es. Auch ein Fehlalarm zählt, wenn er gut begründet ist.
            </p>
            {f.runde > 1 && <p className="chip chip-warnung">Überarbeitungsrunde {f.runde} von 3</p>}

            {ARBEITSBLATT_TEILE.map((t) => {
              const gemeldet = f.meldungen[t.id];
              const mangel = akte.maengel.find((m) => m.teil === t.id);
              return (
                <section key={t.id} className="karte">
                  <div className="zeile" style={{ justifyContent: "space-between" }}>
                    <h3>{t.titel}</h3>
                    {f.challengeAusgewertet &&
                      (mangel ? (
                        gemeldet ? (
                          <span className="chip chip-gut">✅ Mangel gefunden</span>
                        ) : (
                          <span className="chip chip-kritisch">❌ Mangel übersehen</span>
                        )
                      ) : gemeldet ? (
                        <span className="chip chip-warnung">⚠️ kein eingebauter Mangel</span>
                      ) : null)}
                  </div>
                  <p className="teil-text">{akte.entwurf[t.id]}</p>

                  {!f.challengeAusgewertet && (
                    <>
                      <button
                        type="button"
                        className="knopf knopf-kritisch"
                        aria-pressed={Boolean(gemeldet)}
                        onClick={() => meldung(t.id, gemeldet ? null : {})}
                      >
                        {gemeldet ? "🚩 Mangel gemeldet" : "🔎 Mangel melden"}
                      </button>
                      {gemeldet && (
                        <div className="abstand">
                          <div className="feld">
                            <label htmlFor={`art-${t.id}`} className="klein">
                              Art des Mangels
                            </label>
                            <select
                              id={`art-${t.id}`}
                              value={gemeldet.art}
                              onChange={(e) => meldung(t.id, { art: e.target.value })}
                            >
                              <option value="">Bitte wählen</option>
                              {MANGEL_ARTEN.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.titel}
                                </option>
                              ))}
                            </select>
                          </div>
                          <label htmlFor={`begr-${t.id}`} className="klein">
                            Begründung
                          </label>
                          <textarea
                            id={`begr-${t.id}`}
                            value={gemeldet.begruendung}
                            onChange={(e) => meldung(t.id, { begruendung: e.target.value })}
                            placeholder="Was genau ist problematisch – und für wen?"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {f.challengeAusgewertet && gemeldet && (
                    <p className="klein">
                      <strong>Deine Begründung:</strong> {gemeldet.begruendung || "(keine)"}
                    </p>
                  )}
                  {f.challengeAusgewertet && mangel && (
                    <p className={`hinweis ${gemeldet ? "hinweis-gut" : "hinweis-kritisch"}`}>
                      <strong>{mangel.titel}:</strong> {mangel.erklaerung}
                    </p>
                  )}
                </section>
              );
            })}

            {!f.challengeAusgewertet ? (
              <button type="button" className="knopf knopf-primaer" onClick={() => auswerten(akte)}>
                Prüfung abschließen und auswerten
              </button>
            ) : (
              <>
                <section className="karte karte-akzent">
                  <h2>
                    {gefunden === akte.maengel.length ? "🏅 " : "🔎 "}
                    {gefunden} von {akte.maengel.length} Mängeln gefunden
                  </h2>
                  <p>
                    Überarbeite den Entwurf jetzt. Du verantwortest jede Zeile – auch die, die die KI geschrieben hat.
                  </p>
                </section>

                <section id="ueberarbeiten">
                  <h2>Arbeitsblatt überarbeiten</h2>
                  {ARBEITSBLATT_TEILE.map((t) => (
                    <div key={t.id} className="feld">
                      <label htmlFor={`teil-${t.id}`}>{t.titel}</label>
                      <textarea
                        id={`teil-${t.id}`}
                        value={text[t.id]}
                        onChange={(e) => setEntwurf({ ...text, [t.id]: e.target.value })}
                      />
                    </div>
                  ))}
                  <button type="button" className="knopf knopf-primaer" onClick={() => speichern(text)}>
                    Überarbeitung speichern und Kompass-Check starten
                  </button>
                </section>
              </>
            )}
          </>
        );
      }}
    </FallRahmen>
  );
}
