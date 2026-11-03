"use client";

import Link from "next/link";
import { useSpielstand } from "@/lib/spielstand";

export type SchrittId = "akte" | "dialog" | "profil" | "werkstatt" | "challenge" | "kompass" | "ergebnis";

// Fortschrittsleiste innerhalb einer Fallakte (Transparenz nach Dyrna 2021: „Du bist hier“).
export function FallSchritte({ fallId, aktiv }: { fallId: string; aktiv: SchrittId }) {
  const { fall } = useSpielstand();
  const f = fall(fallId);
  const basis = `/fall/${fallId}`;
  const schritte: { id: SchrittId; titel: string; href: string; fertig: boolean }[] = [
    { id: "akte", titel: "Akte", href: basis, fertig: f.verlauf.length > 0 },
    { id: "dialog", titel: "Diagnose-Dialog", href: `${basis}/dialog`, fertig: Boolean(f.zustand?.abgeschlossen) },
    { id: "profil", titel: "Profil", href: `${basis}/profil`, fertig: f.profil.gespeichert },
    { id: "werkstatt", titel: "Prompt-Werkstatt", href: `${basis}/werkstatt`, fertig: f.prompt.erzeugt },
    { id: "challenge", titel: "Validierung", href: `${basis}/challenge`, fertig: f.challengeAusgewertet },
    { id: "kompass", titel: "Kompass-Check", href: `${basis}/kompass`, fertig: f.kompassBestanden },
    { id: "ergebnis", titel: "Arbeitsblatt", href: `${basis}/ergebnis`, fertig: f.reflexion.trim().length > 0 },
  ];
  return (
    <nav aria-label="Schritte der Fallakte">
      <ol className="schritte">
        {schritte.map((s) => (
          <li key={s.id}>
            <Link
              href={s.href}
              className={s.fertig ? "fertig" : undefined}
              aria-current={s.id === aktiv ? "step" : undefined}
            >
              {s.titel}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
