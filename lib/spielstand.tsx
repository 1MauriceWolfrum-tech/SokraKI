"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ArbeitsblattTeil, Beitrag, DialogZustand, Lernpfad } from "@/lib/typen";
import { AVATARE, STUFEN } from "@/lib/inhalte/spiel";

// Fortschritt wird nur im Browser gespeichert (pseudonym, ohne Server-Datenbank).
// Für den Pilotbetrieb ersetzt die Supabase-Datenbank aus Konzept Kapitel 8.5 diesen Speicher.

export type KompassWert = "ja" | "teilweise" | "nein" | "";

export type FallStand = {
  notizen: string;
  verlauf: Beitrag[];
  zustand: DialogZustand | null;
  hinweise: number;
  profil: {
    staerke: string;
    staerkeBeleg: string;
    schwierigkeit: string;
    schwierigkeitBeleg: string;
    rahmen: string;
    rahmenBeleg: string;
    annahmen: string;
    gespeichert: boolean;
  };
  prompt: { analyse: string; beispiele: string; schritte: string; erzeugt: boolean };
  meldungen: Partial<Record<ArbeitsblattTeil, { art: string; begruendung: string }>>;
  challengeAusgewertet: boolean;
  arbeitsblatt: Record<ArbeitsblattTeil, string> | null;
  runde: number;
  kompass: { wert: KompassWert; begruendung: string }[];
  kompassBestanden: boolean;
  reflexion: string;
};

export type Spielstand = {
  pfad: Lernpfad | null;
  avatar: string;
  ep: number;
  vergeben: string[];
  abzeichen: string[];
  faelle: Record<string, FallStand>;
};

const SPEICHER_SCHLUESSEL = "sokraki-spielstand-v1";

function leererFall(): FallStand {
  return {
    notizen: "",
    verlauf: [],
    zustand: null,
    hinweise: 0,
    profil: {
      staerke: "",
      staerkeBeleg: "",
      schwierigkeit: "",
      schwierigkeitBeleg: "",
      rahmen: "",
      rahmenBeleg: "",
      annahmen: "",
      gespeichert: false,
    },
    prompt: { analyse: "", beispiele: "", schritte: "", erzeugt: false },
    meldungen: {},
    challengeAusgewertet: false,
    arbeitsblatt: null,
    runde: 1,
    kompass: Array.from({ length: 7 }, () => ({ wert: "" as KompassWert, begruendung: "" })),
    kompassBestanden: false,
    reflexion: "",
  };
}

const LEER: Spielstand = { pfad: null, avatar: AVATARE[0], ep: 0, vergeben: [], abzeichen: [], faelle: {} };

// Wie viele der sieben Schritte einer Fallakte erledigt sind (für Fortschrittsbalken).
export function erledigteSchritte(f: FallStand): number {
  return [
    f.verlauf.length > 0,
    Boolean(f.zustand?.abgeschlossen),
    f.profil.gespeichert,
    f.prompt.erzeugt,
    f.challengeAusgewertet,
    f.kompassBestanden,
    f.reflexion.trim().length > 0,
  ].filter(Boolean).length;
}

type Meldung = { id: number; text: string; art: "punkte" | "abzeichen" };

type Kontext = {
  stand: Spielstand;
  geladen: boolean;
  meldung: Meldung | null;
  stufe: string;
  stufeIndex: number;
  setzePfad: (pfad: Lernpfad) => void;
  setzeAvatar: (avatar: string) => void;
  fall: (id: string) => FallStand;
  aendereFall: (id: string, aenderung: (f: FallStand) => FallStand) => void;
  vergebe: (schluessel: string, punkte: number, grund: string) => void;
  verleihe: (abzeichenId: string, titel: string) => void;
  zuruecksetzen: () => void;
};

const SpielstandKontext = createContext<Kontext | null>(null);

function lade(): Spielstand {
  try {
    const roh = window.localStorage.getItem(SPEICHER_SCHLUESSEL);
    return roh ? { ...LEER, ...(JSON.parse(roh) as Spielstand) } : LEER;
  } catch {
    return LEER;
  }
}

export function SpielstandProvider({ children }: { children: React.ReactNode }) {
  const [stand, setStand] = useState<Spielstand>(LEER);
  const [geladen, setGeladen] = useState(false);
  const [meldung, setMeldung] = useState<Meldung | null>(null);
  const zaehler = useRef(0);

  useEffect(() => {
    setStand(lade());
    setGeladen(true);
  }, []);

  useEffect(() => {
    if (!geladen) return;
    try {
      window.localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(stand));
    } catch {
      // Speichern ist eine Komfortfunktion; ohne Speicher läuft die App weiter.
    }
  }, [stand, geladen]);

  const zeige = useCallback((text: string, art: Meldung["art"]) => {
    zaehler.current += 1;
    const id = zaehler.current;
    setMeldung({ id, text, art });
    window.setTimeout(() => setMeldung((m) => (m?.id === id ? null : m)), art === "abzeichen" ? 4200 : 3200);
  }, []);

  const fall = useCallback((id: string) => stand.faelle[id] ?? leererFall(), [stand.faelle]);

  const aendereFall = useCallback((id: string, aenderung: (f: FallStand) => FallStand) => {
    setStand((s) => ({ ...s, faelle: { ...s.faelle, [id]: aenderung(s.faelle[id] ?? leererFall()) } }));
  }, []);

  const aktuell = useRef(stand);
  aktuell.current = stand;

  // Jede Belohnung wird über einen Schlüssel genau einmal vergeben.
  const vergebe = useCallback(
    (schluessel: string, punkte: number, grund: string) => {
      if (aktuell.current.vergeben.includes(schluessel)) return;
      setStand((s) =>
        s.vergeben.includes(schluessel)
          ? s
          : { ...s, ep: s.ep + punkte, vergeben: [...s.vergeben, schluessel] },
      );
      zeige(`+${punkte} Erkenntnispunkte · ${grund}`, "punkte");
    },
    [zeige],
  );

  const verleihe = useCallback(
    (abzeichenId: string, titel: string) => {
      if (aktuell.current.abzeichen.includes(abzeichenId)) return;
      setStand((s) =>
        s.abzeichen.includes(abzeichenId) ? s : { ...s, abzeichen: [...s.abzeichen, abzeichenId] },
      );
      zeige(`Abzeichen erhalten: ${titel}`, "abzeichen");
    },
    [zeige],
  );

  const stufeIndex = useMemo(() => {
    const faelle = Object.values(stand.faelle);
    if (faelle.some((f) => f.kompassBestanden && f.arbeitsblatt)) return 2;
    if (faelle.some((f) => f.zustand?.abgeschlossen)) return 1;
    return 0;
  }, [stand.faelle]);

  const wert: Kontext = {
    stand,
    geladen,
    meldung,
    stufe: STUFEN[stufeIndex],
    stufeIndex,
    setzePfad: (pfad) => setStand((s) => ({ ...s, pfad })),
    setzeAvatar: (avatar) => setStand((s) => ({ ...s, avatar })),
    fall,
    aendereFall,
    vergebe,
    verleihe,
    zuruecksetzen: () => setStand(LEER),
  };

  return <SpielstandKontext.Provider value={wert}>{children}</SpielstandKontext.Provider>;
}

export function useSpielstand(): Kontext {
  const k = useContext(SpielstandKontext);
  if (!k) throw new Error("useSpielstand außerhalb des SpielstandProvider");
  return k;
}
