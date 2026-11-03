"use client";

import Link from "next/link";
import { FAELLE } from "@/lib/inhalte/faelle";
import { MODULE } from "@/lib/inhalte/module";
import { ABZEICHEN, AVATARE, STUFEN, STUFEN_ICONS } from "@/lib/inhalte/spiel";
import { erledigteSchritte, useSpielstand } from "@/lib/spielstand";
import type { Lernpfad } from "@/lib/typen";

const PFADE: { id: Lernpfad; icon: string; titel: string; faelle: string }[] = [
  { id: "mathe", icon: "🔢", titel: "Mathematik", faelle: "Jonas, Can, Mia" },
  { id: "bwr", icon: "📊", titel: "BWR", faelle: "Lena, Daria, Mia" },
];

const SCHRITTE_JE_FALL = 7;

export default function Kurskarte() {
  const { stand, geladen, stufeIndex, setzePfad, setzeAvatar, fall, zuruecksetzen } = useSpielstand();
  if (!geladen) return <p className="leise">Lade Spielstand …</p>;

  const faelle = FAELLE.filter((f) => !stand.pfad || f.pfade.includes(stand.pfad)).sort(
    (a, b) => a.stufe - b.stufe,
  );

  return (
    <>
      <section className="karte karte-akzent held">
        <div className="held-kopf">
          <span className="gross-icon" aria-hidden="true">
            {stand.avatar}
          </span>
          <div style={{ flex: 1 }}>
            <p className="chip chip-gold">Kapitel 1 · Dein erstes Jahr</p>
            <h1 className="abstand">
              Willkommen an der <span className="verlaufstext">Berufsschule Am Marktplatz</span>
            </h1>
            <p>
              Die Schulleitung hat dir eine kaufmännische Klasse übertragen. Für einzelne Schüler:innen erstellst du ein
              Förderarbeitsblatt – mit KI, aber in deiner Verantwortung. Der Coach stellt Fragen; entscheiden musst du.
            </p>
          </div>
        </div>

        <div className="stufen-leiste" aria-label="Deine Stufe">
          {STUFEN.map((s, i) => (
            <div key={s} className={`stufe ${i === stufeIndex ? "aktuell" : i < stufeIndex ? "erreicht" : ""}`}>
              <span className="stufe-icon" aria-hidden="true">
                {STUFEN_ICONS[i]}
              </span>
              Lv {i + 1} · {s}
            </div>
          ))}
        </div>

        <div className="abstand">
          <p className="klein leise" id="avatar-titel">
            Wähle deinen Avatar
          </p>
          <div className="avatar-wahl" role="group" aria-labelledby="avatar-titel">
            {AVATARE.map((a) => (
              <button
                key={a}
                type="button"
                className="avatar-knopf"
                aria-pressed={stand.avatar === a}
                aria-label={`Avatar ${a}`}
                onClick={() => setzeAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <p className="klein leise abstand">
          Prototyp · Alle Personen sind erfunden · Dein Fortschritt wird nur in diesem Browser gespeichert.
        </p>
      </section>

      <h2 className="abschnitt-titel">🗺️ Wähle deinen Lernpfad</h2>
      <div className="raster">
        {PFADE.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`knopf karte-spiel ${stand.pfad === p.id ? "knopf-primaer" : ""}`}
            style={{ minHeight: 72, justifyContent: "flex-start", fontSize: "1.05rem" }}
            aria-pressed={stand.pfad === p.id}
            onClick={() => setzePfad(p.id)}
          >
            <span style={{ fontSize: "1.8rem" }} aria-hidden="true">
              {p.icon}
            </span>
            <span style={{ textAlign: "left" }}>
              {p.titel}
              <br />
              <span className="klein" style={{ fontWeight: 600 }}>
                {p.faelle}
              </span>
            </span>
          </button>
        ))}
      </div>
      {stand.pfad === "bwr" && (
        <p className="hinweis abstand">
          Im BWR-Pfad sind die Fallakten noch in Arbeit. Spielbar ist im Prototyp Fall 1 des Mathematik-Pfads: Jonas.
        </p>
      )}

      <h2 className="abschnitt-titel">📜 Deine Quests</h2>
      <div className="raster">
        {faelle.map((f) => {
          const s = fall(f.id);
          const erledigt = erledigteSchritte(s);
          const fertig = s.kompassBestanden && s.arbeitsblatt;
          return (
            <article key={f.id} className={`karte karte-spiel ${f.spielbar ? "" : "karte-gesperrt"}`}>
              <div className="zeile" style={{ justifyContent: "space-between" }}>
                <span className="sterne" aria-label={`Schwierigkeit ${f.stufe} von 3`}>
                  {"★".repeat(f.stufe)}
                  {"☆".repeat(3 - f.stufe)}
                </span>
                {fertig ? (
                  <span className="chip chip-gold">🏆 geschafft</span>
                ) : f.spielbar ? (
                  <span className="chip chip-gut">▶ spielbar</span>
                ) : (
                  <span className="chip">🔒 in Arbeit</span>
                )}
              </div>
              <h3 className="abstand">
                {f.name}, {f.alter}
              </h3>
              <p className="klein">
                {f.beruf}
                <br />
                <span className="leise">{f.themaTitel}</span>
              </p>
              <p className="klein leise">🧭 Kompass: {f.kompassEbene}</p>
              {f.spielbar && (
                <div className="feld">
                  <div className="zeile klein leise" style={{ justifyContent: "space-between" }}>
                    <span>Fortschritt</span>
                    <span>
                      {erledigt}/{SCHRITTE_JE_FALL}
                    </span>
                  </div>
                  <div className="fortschritt" aria-hidden="true">
                    <div style={{ width: `${(erledigt / SCHRITTE_JE_FALL) * 100}%` }} />
                  </div>
                </div>
              )}
              <Link className={`knopf ${f.spielbar ? "knopf-primaer" : ""}`} href={`/fall/${f.id}`}>
                {f.spielbar ? (erledigt > 0 ? "▶ Weiterspielen" : "▶ Quest starten") : "Ansehen"}
              </Link>
            </article>
          );
        })}
      </div>

      <h2 className="abschnitt-titel">🏫 Räume der Schule</h2>
      <div className="raster">
        {MODULE.map((m) => (
          <article key={m.nr} className={`karte ${m.imPrototyp ? "" : "karte-gesperrt"}`}>
            <div className="zeile" style={{ gap: "0.75rem" }}>
              <span className="raum-icon" aria-hidden="true">
                {m.icon}
              </span>
              <div>
                <h3 style={{ margin: 0 }}>
                  Modul {m.nr}: {m.titel}
                </h3>
                <span className="klein leise">
                  {m.raum} · {m.dauer} min
                </span>
              </div>
            </div>
            <p className="klein abstand">{m.leitfrage}</p>
            {m.imPrototyp ? (
              <span className="chip chip-gut">über die Quests spielbar</span>
            ) : (
              <span className="chip">🔒 folgt</span>
            )}
          </article>
        ))}
      </div>

      <h2 className="abschnitt-titel">🏅 Abzeichen</h2>
      <div className="raster-klein">
        {ABZEICHEN.map((a) => {
          const erhalten = stand.abzeichen.includes(a.id);
          return (
            <article
              key={a.id}
              className={`karte ${erhalten ? "abzeichen-erhalten karte-akzent" : "abzeichen-offen"}`}
              style={{ textAlign: "center" }}
            >
              <div className="abzeichen-icon" aria-hidden="true">
                {a.imPrototyp || erhalten ? a.icon : "🔒"}
              </div>
              <h3 style={{ fontSize: "0.95rem" }}>{a.titel}</h3>
              <p className="klein leise" style={{ margin: 0 }}>
                {erhalten ? "erhalten" : a.kriterium}
              </p>
            </article>
          );
        })}
      </div>

      <p className="abstand">
        <button
          type="button"
          className="knopf knopf-leise"
          onClick={() => {
            if (window.confirm("Spielstand in diesem Browser wirklich zurücksetzen?")) zuruecksetzen();
          }}
        >
          ↺ Spielstand zurücksetzen
        </button>
      </p>
    </>
  );
}
