"use client";

import Link from "next/link";
import { ABZEICHEN, STUFEN_ICONS } from "@/lib/inhalte/spiel";
import { useSpielstand } from "@/lib/spielstand";
import { Konfetti } from "@/components/Konfetti";

export function Kopfzeile() {
  const { stand, stufe, stufeIndex, meldung, geladen } = useSpielstand();
  return (
    <>
      <header className="kopfzeile">
        <div className="kopfzeile-innen">
          <Link href="/" className="marke">
            <span className="marke-logo" aria-hidden="true">
              🧭
            </span>
            <span>
              Sokra<span className="verlaufstext">KI</span>
            </span>
          </Link>
          {geladen && (
            <div className="status" aria-label="Spielstand">
              <span className="chip chip-akzent" title="Stufe">
                {STUFEN_ICONS[stufeIndex]} Lv {stufeIndex + 1} · {stufe}
              </span>
              <span className="chip chip-gold" title="Abzeichen">
                🏅 {stand.abzeichen.length}/{ABZEICHEN.length}
              </span>
              <span key={stand.ep} className="chip chip-gut pop" title="Erkenntnispunkte">
                ✨ {stand.ep} EP
              </span>
              <span className="avatar-klein" aria-label="Dein Avatar">
                {stand.avatar}
              </span>
            </div>
          )}
        </div>
      </header>
      <div aria-live="polite">
        {meldung && (
          <div key={meldung.id} className={`toast ${meldung.art === "abzeichen" ? "toast-gold" : ""}`}>
            <span className="toast-icon" aria-hidden="true">
              {meldung.art === "abzeichen" ? "🏅" : "✨"}
            </span>
            {meldung.text}
          </div>
        )}
      </div>
      {meldung?.art === "abzeichen" && <Konfetti key={meldung.id} />}
    </>
  );
}
