"use client";

import Link from "next/link";
import { FallRahmen, useFallId } from "@/components/FallRahmen";
import { PUNKTE } from "@/lib/inhalte/spiel";
import { useSpielstand, type FallStand } from "@/lib/spielstand";
import type { Fallakte } from "@/lib/typen";

type ProfilFeld = "staerke" | "schwierigkeit" | "rahmen";

const FELDER: { id: ProfilFeld; titel: string; frage: string }[] = [
  { id: "staerke", titel: "Stärke", frage: "Was kann die Person sicher? Woran knüpfst du an?" },
  { id: "schwierigkeit", titel: "Schwierigkeit", frage: "Woran genau scheitert sie – an welchem Schritt, nicht nur am Ergebnis?" },
  { id: "rahmen", titel: "Rahmenbedingungen und Konsequenzen", frage: "Was bedeutet ihre Lage für Form und Zugang des Arbeitsblatts?" },
];

function belege(akte: Fallakte): string[] {
  return [
    ...akte.aufgaben.map((a) => a.titel),
    "Steckbrief",
    "Stärken laut Akte",
    "Interessen",
    "Rahmenbedingungen",
    "KI-Nutzung",
    "Diagnose-Dialog",
  ];
}

const MINDESTLAENGE = 15;

export default function ProfilPage() {
  const id = useFallId();
  const { fall, aendereFall, vergebe, verleihe } = useSpielstand();
  const f = fall(id);
  const p = f.profil;

  function setze(feld: Exclude<keyof FallStand["profil"], "gespeichert">, wert: string) {
    aendereFall(id, (s) => ({ ...s, profil: { ...s.profil, [feld]: wert, gespeichert: false } }));
  }

  function speichern() {
    aendereFall(id, (s) => ({ ...s, profil: { ...s.profil, gespeichert: true } }));
    let mitBeleg = 0;
    for (const feld of FELDER) {
      const text = p[feld.id];
      const beleg = p[`${feld.id}Beleg` as const];
      if (text.trim().length >= MINDESTLAENGE && beleg) {
        mitBeleg += 1;
        vergebe(`${id}-profil-${feld.id}`, PUNKTE.profilBeleg, `${feld.titel} mit Beleg`);
      }
    }
    if (p.annahmen.trim().length >= MINDESTLAENGE) {
      vergebe(`${id}-annahmen`, PUNKTE.annahmenCheck, "Eigene Annahmen geprüft");
    }
    if (mitBeleg === FELDER.length) verleihe("diagnose", "Diagnose-Profi");
  }

  return (
    <FallRahmen aktiv="profil">
      {(akte) => (
        <>
          <h1>🩺 Stärken-Schwächen-Profil: {akte.name}</h1>
          <p>Übertrage deine Erkenntnisse aus dem Dialog. Jede Aussage braucht einen Beleg aus der Akte.</p>
          {!f.zustand?.abgeschlossen && (
            <p className="hinweis">
              Der Diagnose-Dialog ist noch nicht abgeschlossen. <Link href={`/fall/${id}/dialog`}>Zum Dialog</Link>
            </p>
          )}

          {FELDER.map((feld) => (
            <section key={feld.id} className="karte">
              <label htmlFor={feld.id}>{feld.titel}</label>
              <p className="hilfe">{feld.frage}</p>
              <textarea id={feld.id} value={p[feld.id]} onChange={(e) => setze(feld.id, e.target.value)} />
              <div className="feld abstand">
                <label htmlFor={`${feld.id}-beleg`} className="klein">
                  Beleg aus der Akte
                </label>
                <select
                  id={`${feld.id}-beleg`}
                  value={p[`${feld.id}Beleg` as const]}
                  onChange={(e) => setze(`${feld.id}Beleg`, e.target.value)}
                >
                  <option value="">Bitte wählen</option>
                  {belege(akte).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          ))}

          <section className="karte">
            <label htmlFor="annahmen">Annahmen-Check</label>
            <p className="hilfe">
              Welche Annahmen hast du über {akte.name} getroffen, die nicht in der Akte stehen? (Kompass-Ebene 5)
            </p>
            <textarea id="annahmen" value={p.annahmen} onChange={(e) => setze("annahmen", e.target.value)} />
          </section>

          <div className="zeile">
            <button type="button" className="knopf knopf-primaer" onClick={speichern}>
              💾 Profil speichern
            </button>
            {p.gespeichert && <span className="chip chip-gut">gespeichert</span>}
          </div>

          {p.gespeichert && (
            <section className="karte karte-akzent abstand">
              <h2>Zum Vergleich: Einschätzung aus der Fachdidaktik</h2>
              <p className="klein leise">
                Vergleiche, wo deine Diagnose abweicht. Passe sie an, wenn du überzeugt bist – oder bleib bei deiner
                Sicht, wenn du sie begründen kannst.
              </p>
              <p>
                <strong>Stärke:</strong> {akte.musterdiagnose.staerke}
              </p>
              <p>
                <strong>Schwierigkeit:</strong> {akte.musterdiagnose.schwierigkeit}
              </p>
              <p>
                <strong>Rahmen:</strong> {akte.musterdiagnose.rahmen}
              </p>
              <Link className="knopf knopf-primaer" href={`/fall/${id}/werkstatt`}>
                Weiter zur Prompt-Werkstatt
              </Link>
            </section>
          )}
        </>
      )}
    </FallRahmen>
  );
}
