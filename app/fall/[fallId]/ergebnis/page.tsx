"use client";

import Link from "next/link";
import { FallRahmen, useFallId } from "@/components/FallRahmen";
import { KompassRadar } from "@/components/KompassRadar";
import { ABZEICHEN, PUNKTE } from "@/lib/inhalte/spiel";
import { useSpielstand } from "@/lib/spielstand";
import { ARBEITSBLATT_TEILE } from "@/lib/typen";

const REFLEXION_MIN = 40;

export default function ErgebnisPage() {
  const id = useFallId();
  const { stand, fall, aendereFall, vergebe } = useSpielstand();
  const f = fall(id);

  return (
    <FallRahmen aktiv="ergebnis">
      {(akte) => {
        const blatt = f.arbeitsblatt;
        if (!blatt) {
          return (
            <p className="hinweis">
              Noch kein überarbeitetes Arbeitsblatt vorhanden. <Link href={`/fall/${id}/challenge`}>Zur Validierung</Link>
            </p>
          );
        }
        const fuerLernende = ARBEITSBLATT_TEILE.filter((t) => t.id !== "lehrkraftKopf");
        return (
          <>
            <section className="karte karte-akzent nicht-drucken" style={{ textAlign: "center" }}>
              <div className="trophaee" aria-hidden="true">
                🏆
              </div>
              <h1>
                Quest geschafft: <span className="verlaufstext">dein Förderarbeitsblatt</span>
              </h1>
              <p className="leise">
                {stand.ep} Erkenntnispunkte · {stand.abzeichen.length} von {ABZEICHEN.length} Abzeichen
              </p>
              <button type="button" className="knopf knopf-primaer" onClick={() => window.print()}>
                🖨️ Drucken oder als PDF speichern
              </button>
            </section>
            {!f.kompassBestanden && (
              <p className="hinweis nicht-drucken">
                Der Kompass-Check ist noch offen. <Link href={`/fall/${id}/kompass`}>Zum Kompass-Check</Link>
              </p>
            )}

            <article className="karte">
              <p className="klein leise">
                {akte.themaTitel} · für {akte.name} · KI-gestützt erstellt, von der Lehrkraft geprüft
              </p>
              {fuerLernende.map((t) => (
                <section key={t.id} className="abstand">
                  <h3>{t.titel.replace(/^\d+ /, "")}</h3>
                  <p className="teil-text">{blatt[t.id]}</p>
                </section>
              ))}
            </article>

            <article className="karte">
              <h2>Für die Lehrkraft</h2>
              <p className="teil-text">{blatt.lehrkraftKopf}</p>
              <h3 className="abstand">Diagnosebezug</h3>
              <p>
                <strong>Stärke:</strong> {f.profil.staerke || "–"}
                <br />
                <strong>Schwierigkeit:</strong> {f.profil.schwierigkeit || "–"}
              </p>
              <h3 className="abstand">Kompass-Check</h3>
              <div className="raster">
                <KompassRadar werte={f.kompass.map((k) => k.wert)} />
                <ul className="liste klein">
                  {akte.kompassFragen.map((q, i) => (
                    <li key={q.ebene}>
                      {q.ebene}: <strong>{f.kompass[i].wert || "offen"}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <section className="karte nicht-drucken">
              <label htmlFor="reflexion">Reflexion</label>
              <p className="hilfe">
                Wann hast du der KI widersprochen – und warum? Was nimmst du aus diesem Fall für deinen Unterricht mit?
              </p>
              <textarea
                id="reflexion"
                value={f.reflexion}
                onChange={(e) => aendereFall(id, (s) => ({ ...s, reflexion: e.target.value }))}
                onBlur={() => {
                  if (f.reflexion.trim().length >= REFLEXION_MIN) {
                    vergebe(`${id}-reflexion`, PUNKTE.reflexion, "Reflexion festgehalten");
                  }
                }}
              />
            </section>

            <section className="karte nicht-drucken">
              <h2>Dein Stand</h2>
              <p>
                {stand.ep} Erkenntnispunkte · {stand.abzeichen.length} von {ABZEICHEN.length} Abzeichen
              </p>
              <div className="zeile">
                {ABZEICHEN.filter((a) => stand.abzeichen.includes(a.id)).map((a) => (
                  <span key={a.id} className="chip chip-gold">
                    {a.icon} {a.titel}
                  </span>
                ))}
              </div>
              <p className="klein leise abstand">
                Nächster Schritt im Kurs: Fallakte 2 (Can, lineare Funktionen) mit weniger Hilfen – im Prototyp noch in
                Arbeit.
              </p>
              <Link className="knopf" href="/">
                Zur Kurskarte
              </Link>
            </section>
          </>
        );
      }}
    </FallRahmen>
  );
}
