"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FallRahmen, useFallId } from "@/components/FallRahmen";
import { fallakte } from "@/lib/inhalte/faelle";
import { PUNKTE } from "@/lib/inhalte/spiel";
import { sokratesMeter, startZustand } from "@/lib/coach/phasen";
import { useSpielstand } from "@/lib/spielstand";
import {
  MAX_ZEICHEN,
  PHASEN,
  type Beitrag,
  type CoachAnfrage,
  type CoachAntwort,
  type DialogZustand,
  type Phase,
} from "@/lib/typen";

const PHASEN_ICONS: Record<Phase, string> = {
  ausgangsfrage: "🎯",
  behauptung: "✋",
  pruefung: "🔍",
  aporie: "🌀",
  einsicht: "💡",
  synthese: "🧩",
};

function PhasenLeiste({ zustand }: { zustand: DialogZustand }) {
  const aktuell = PHASEN.findIndex((p) => p.id === zustand.phase);
  const phase = PHASEN[aktuell];
  return (
    <div>
      <div className="phasen" aria-hidden="true">
        {PHASEN.map((p, i) => {
          const erreicht = i < aktuell && (p.id !== "aporie" || zustand.ueberarbeitungen > 0);
          return (
            <div key={p.id} className={`phase ${i === aktuell ? "aktuell" : erreicht ? "erreicht" : ""}`} title={p.titel}>
              {PHASEN_ICONS[p.id]}
            </div>
          );
        })}
      </div>
      <p className="klein">
        {PHASEN_ICONS[phase.id]} Phase {aktuell + 1} von 6: <strong>{phase.titel}</strong>{" "}
        <span className="leise">– {phase.kurz}</span>
      </p>
    </div>
  );
}

export default function DialogPage() {
  const id = useFallId();
  const { stand, fall, aendereFall, vergebe, verleihe, geladen } = useSpielstand();
  const f = fall(id);
  const [eingabe, setEingabe] = useState("");
  const [ueberdenken, setUeberdenken] = useState(false);
  const [laedt, setLaedt] = useState(false);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [modus, setModus] = useState<CoachAntwort["modus"] | null>(null);
  const ende = useRef<HTMLDivElement>(null);
  const gestartet = useRef(false);

  const frageCoach = useCallback(
    async (verlauf: Beitrag[], zustand: DialogZustand, ueberdenkenFlag: boolean) => {
      setLaedt(true);
      setFehler(null);
      try {
        const anfrage: CoachAnfrage = { fallId: id, verlauf, zustand, ueberdenken: ueberdenkenFlag };
        const res = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(anfrage),
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const daten = (await res.json()) as CoachAntwort;
        setModus(daten.modus);
        setHinweis(daten.hinweis ?? null);
        const coach: Beitrag = {
          rolle: "coach",
          text: daten.antwort,
          phase: daten.zustand.phase,
          aporie: daten.ereignisse.includes("annahme_verworfen"),
        };
        aendereFall(id, (s) => ({ ...s, verlauf: [...verlauf, coach], zustand: daten.zustand }));

        if (daten.ereignisse.includes("annahme_verworfen")) {
          vergebe(
            `${id}-annahme-${Math.min(daten.zustand.ueberarbeitungen, 2)}`,
            PUNKTE.annahmeVerworfen,
            "Irrtum als Erfolg: Annahme geprüft und verworfen",
          );
        }
        if (daten.ereignisse.includes("diagnose_erreicht")) {
          vergebe(`${id}-diagnose-dialog`, PUNKTE.diagnoseErreicht, "Kernschwierigkeit selbst benannt");
        }
        if (daten.ereignisse.includes("abgeschlossen")) {
          vergebe(`${id}-dialog`, PUNKTE.dialogAbgeschlossen, "Diagnose-Dialog abgeschlossen");
          if (daten.zustand.ueberarbeitungen > 0) verleihe("maeeutiker", "Mäeutiker:in");
        }
      } catch {
        setFehler("Der Coach ist gerade nicht erreichbar. Versuche es noch einmal.");
      } finally {
        setLaedt(false);
      }
    },
    [id, aendereFall, vergebe, verleihe],
  );

  useEffect(() => {
    if (!geladen || gestartet.current || !fallakte(id)?.spielbar) return;
    gestartet.current = true;
    if (f.verlauf.length === 0) void frageCoach([], startZustand(), false);
  }, [geladen, id, f.verlauf.length, frageCoach]);

  useEffect(() => {
    ende.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [f.verlauf.length, laedt]);

  function senden() {
    const text = eingabe.trim();
    if (!text || laedt || !f.zustand || f.zustand.abgeschlossen) return;
    const verlauf: Beitrag[] = [...f.verlauf, { rolle: "lehrkraft", text }];
    aendereFall(id, (s) => ({ ...s, verlauf }));
    setEingabe("");
    const flag = ueberdenken;
    setUeberdenken(false);
    void frageCoach(verlauf, f.zustand, flag);
  }

  function neuStarten() {
    if (!window.confirm("Dialog wirklich neu beginnen? Der bisherige Verlauf wird gelöscht.")) return;
    aendereFall(id, (s) => ({ ...s, verlauf: [], zustand: null }));
    void frageCoach([], startZustand(), false);
  }

  return (
    <FallRahmen aktiv="dialog">
      {(akte) => {
        const z = f.zustand;
        const meter = z ? sokratesMeter(z) : 0;
        return (
          <>
            <div className="zeile" style={{ justifyContent: "space-between" }}>
              <h1>Diagnose-Dialog: {akte.name}</h1>
              {modus && (
                <span className="chip">{modus === "claude" ? "Coach: KI (Claude)" : "Coach: Drehbuch"}</span>
              )}
            </div>
            <p className="leise">
              {modus === "claude"
                ? "Der Coach ist ein KI-System und kein Mensch."
                : modus === "skript"
                  ? "Der Coach folgt hier einem festen Drehbuch und ist kein Mensch."
                  : "Der Coach ist kein Mensch."}{" "}
              Er stellt Fragen und liefert keine Lösungen – die Diagnose erarbeitest du.
            </p>

            {z && (
              <section className="karte">
                <PhasenLeiste zustand={z} />
                <div className="zeile abstand" style={{ justifyContent: "space-between" }}>
                  <span className="klein">🧠 Sokrates-Meter: Wie gründlich prüfst du?</span>
                  <span className="klein leise">{meter} / 10</span>
                </div>
                <div
                  className="meter"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-valuenow={meter}
                  aria-label="Sokrates-Meter"
                >
                  <div style={{ width: `${meter * 10}%` }} />
                </div>
              </section>
            )}

            <details className="karte">
              <summary>Akte einblenden</summary>
              {akte.aufgaben.map((a) => (
                <div key={a.titel} className="abstand">
                  <p className="klein">
                    <strong>{a.titel}:</strong> {a.aufgabe}
                  </p>
                  <pre className="loesung">{a.loesung}</pre>
                </div>
              ))}
              <p className="klein">
                <strong>Rahmen:</strong> {akte.rahmen.join(" · ")}
              </p>
            </details>

            <div className="verlauf" aria-live="polite">
              {f.verlauf.map((b, i) =>
                b.rolle === "coach" ? (
                  <div key={i} className="blase-zeile">
                    <span className="coach-icon" aria-hidden="true">
                      🧭
                    </span>
                    <div className={`blase blase-coach ${b.aporie ? "blase-aporie" : ""}`}>
                      <div className="blase-kopf">{b.aporie ? "✨ Coach · Irrtum als Erfolg" : "Coach"}</div>
                      {b.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="blase-zeile blase-zeile-lehrkraft">
                    <div className="blase blase-lehrkraft">{b.text}</div>
                    <span className="avatar-klein" aria-hidden="true">
                      {stand.avatar}
                    </span>
                  </div>
                ),
              )}
              {laedt && (
                <div className="blase-zeile">
                  <span className="coach-icon" aria-hidden="true">
                    🧭
                  </span>
                  <div className="blase blase-coach tippt" aria-label="Der Coach denkt nach">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={ende} />
            </div>

            {hinweis && <p className="hinweis">{hinweis}</p>}
            {fehler && <p className="hinweis hinweis-kritisch">{fehler}</p>}

            {z?.abgeschlossen ? (
              <section className="karte karte-akzent">
                <h2>🎉 Dialog abgeschlossen</h2>
                <p>
                  Du hast {z.geprueft} Prüffragen beantwortet
                  {z.ueberarbeitungen > 0 ? ` und ${z.ueberarbeitungen}-mal deine Einschätzung überarbeitet` : ""}.
                  Halte deine Diagnose jetzt im Profil fest.
                </p>
                <div className="zeile">
                  <Link className="knopf knopf-primaer" href={`/fall/${id}/profil`}>
                    Weiter zum Profil
                  </Link>
                  <button type="button" className="knopf knopf-leise" onClick={neuStarten}>
                    Dialog neu beginnen
                  </button>
                </div>
              </section>
            ) : (
              <section className="karte">
                <label htmlFor="antwort">Deine Antwort</label>
                <textarea
                  id="antwort"
                  value={eingabe}
                  disabled={laedt || !z}
                  maxLength={MAX_ZEICHEN}
                  onChange={(e) => setEingabe(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) senden();
                  }}
                  placeholder="Antworte in eigenen Worten und beziehe dich auf die Akte."
                />
                <p className="hilfe">Senden mit Strg + Enter</p>
                <p id="ueberdenken-hilfe" className="hilfe">
                  „Ich überdenke meine Einschätzung“ markiert deine nächste Antwort als Überarbeitung.
                </p>
                <div className="zeile abstand">
                  <button type="button" className="knopf knopf-primaer" onClick={senden} disabled={laedt || !eingabe.trim()}>
                    Senden ➤
                  </button>
                  <button
                    type="button"
                    className={`knopf ${ueberdenken ? "knopf-primaer" : ""}`}
                    aria-pressed={ueberdenken}
                    onClick={() => setUeberdenken((u) => !u)}
                    disabled={laedt || !z || z.zuege === 0}
                    aria-describedby="ueberdenken-hilfe"
                  >
                    🌀 Ich überdenke meine Einschätzung
                  </button>
                  <button
                    type="button"
                    className="knopf"
                    disabled={f.hinweise >= akte.hilfekarten.length}
                    onClick={() => aendereFall(id, (s) => ({ ...s, hinweise: s.hinweise + 1 }))}
                  >
                    💡 Hinweis ({f.hinweise}/{akte.hilfekarten.length})
                  </button>
                </div>
                {f.hinweise > 0 && (
                  <div className="abstand">
                    {akte.hilfekarten.slice(0, f.hinweise).map((h) => (
                      <p key={h.stufe} className="hinweis hinweis-gut">
                        🃏 <strong>{h.stufe}:</strong> {h.text}
                      </p>
                    ))}
                  </div>
                )}
                {z && z.zuege > 0 && (
                  <button type="button" className="knopf knopf-leise abstand" onClick={neuStarten}>
                    Dialog neu beginnen
                  </button>
                )}
              </section>
            )}
          </>
        );
      }}
    </FallRahmen>
  );
}
