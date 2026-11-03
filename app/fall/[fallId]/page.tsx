"use client";

import Link from "next/link";
import { useState } from "react";
import { FallRahmen, useFallId } from "@/components/FallRahmen";
import { useSpielstand } from "@/lib/spielstand";

export default function AktePage() {
  const id = useFallId();
  const { fall, aendereFall } = useSpielstand();
  const [korrektur, setKorrektur] = useState(false);
  const f = fall(id);

  return (
    <FallRahmen aktiv="akte">
      {(akte) => (
        <>
          <h1>📁 Fallakte {akte.name}</h1>
          <p className="hinweis">
            Achte beim Lesen darauf, welche Annahmen du triffst, die nicht in der Akte stehen. Danach fragt dich der
            Kurs später.
          </p>

          <section className="karte">
            <h2>Steckbrief</h2>
            <p>
              <strong>
                {akte.name}, {akte.alter} Jahre
              </strong>{" "}
              · {akte.beruf} · {akte.abschluss}
            </p>
            <ul className="liste">
              {akte.steckbrief.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="raster">
              <div>
                <h3>Stärken</h3>
                <ul className="liste">
                  {akte.staerken.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Interessen</h3>
                <ul className="liste">
                  {akte.interessen.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Rahmenbedingungen</h3>
                <ul className="liste">
                  {akte.rahmen.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <h3>KI-Nutzung</h3>
            <p>{akte.kiNutzung}</p>
          </section>

          <section className="karte">
            <div className="zeile" style={{ justifyContent: "space-between" }}>
              <h2>Lösungen aus der letzten Übung</h2>
              <button type="button" className="knopf knopf-leise" onClick={() => setKorrektur((k) => !k)}>
                {korrektur ? "Korrektur ausblenden" : "Korrektur einblenden"}
              </button>
            </div>
            {akte.aufgaben.map((a) => (
              <div key={a.titel} className="abstand">
                <h3>{a.titel}</h3>
                <p>{a.aufgabe}</p>
                <p className="klein leise">Lösung von {akte.name}:</p>
                <pre className="loesung">{a.loesung}</pre>
                {korrektur && (
                  <p className="klein">
                    {a.richtig ? (
                      <span className="chip chip-gut">richtig</span>
                    ) : (
                      <span className="chip chip-kritisch">falsch</span>
                    )}{" "}
                    Musterlösung: {a.musterloesung}
                  </p>
                )}
              </div>
            ))}
          </section>

          <section className="karte">
            <label htmlFor="notizen">Deine Notizen zur Akte</label>
            <textarea
              id="notizen"
              value={f.notizen}
              onChange={(e) => aendereFall(id, (s) => ({ ...s, notizen: e.target.value }))}
              placeholder="Was fällt dir auf? Was willst du im Dialog klären?"
            />
          </section>

          <Link className="knopf knopf-primaer" href={`/fall/${id}/dialog`}>
            {f.verlauf.length > 0 ? "▶ Zum Diagnose-Dialog" : "▶ Diagnose-Dialog starten"}
          </Link>
        </>
      )}
    </FallRahmen>
  );
}
