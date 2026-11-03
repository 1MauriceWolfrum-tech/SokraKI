"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { fallakte } from "@/lib/inhalte/faelle";
import { useSpielstand } from "@/lib/spielstand";
import type { Fallakte } from "@/lib/typen";
import { FallSchritte, type SchrittId } from "@/components/FallSchritte";

const MODUL: Record<SchrittId, number> = {
  akte: 4,
  dialog: 4,
  profil: 4,
  werkstatt: 5,
  challenge: 5,
  kompass: 5,
  ergebnis: 5,
};

export function useFallId(): string {
  return useParams<{ fallId: string }>().fallId;
}

export function FallRahmen({
  aktiv,
  children,
}: {
  aktiv: SchrittId;
  children: (akte: Fallakte) => React.ReactNode;
}) {
  const id = useFallId();
  const akte = fallakte(id);
  const { geladen } = useSpielstand();

  if (!akte) {
    return (
      <div className="karte">
        <h1>Fallakte nicht gefunden</h1>
        <Link href="/">Zur Kurskarte</Link>
      </div>
    );
  }
  if (!akte.spielbar) {
    return (
      <div className="karte">
        <h1>Fallakte {akte.name}</h1>
        <p>
          {akte.name} ({akte.themaTitel}) ist im Konzept beschrieben, aber im Prototyp noch nicht spielbar. Schülerlösungen,
          Hilfekarten und Entwurf ergänzt das Team in der nächsten Ausbaustufe.
        </p>
        <Link className="knopf" href="/">
          Zur Kurskarte
        </Link>
      </div>
    );
  }
  if (!geladen) return <p className="leise">Lade Spielstand …</p>;

  return (
    <>
      <p className="leise klein">
        Modul {MODUL[aktiv]} · Fallakte {akte.name} · {akte.themaTitel}
      </p>
      <FallSchritte fallId={id} aktiv={aktiv} />
      {children(akte)}
    </>
  );
}
