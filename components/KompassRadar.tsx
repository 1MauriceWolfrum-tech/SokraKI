import type { KompassWert } from "@/lib/spielstand";

const ACHSEN = ["Zugang", "Nutzung", "Ertrag", "Urteil", "Fairness", "Psychosozial", "Verantwortung"];
const WERT: Record<KompassWert, number> = { ja: 1, teilweise: 0.55, nein: 0.12, "": 0 };

// Kompass-Radar (Konzept, Kapitel 7.1): zeigt, wie das Arbeitsblatt die sieben Ebenen erfüllt.
export function KompassRadar({ werte }: { werte: KompassWert[] }) {
  const mitte = 160;
  const radius = 105;
  const punkt = (i: number, r: number) => {
    const winkel = (Math.PI * 2 * i) / ACHSEN.length - Math.PI / 2;
    return [mitte + Math.cos(winkel) * r, mitte + Math.sin(winkel) * r] as const;
  };
  const flaeche = werte.map((w, i) => punkt(i, radius * WERT[w]).join(",")).join(" ");

  return (
    <svg viewBox="-36 -8 392 336" width="100%" style={{ maxWidth: 380 }} role="img" aria-label="Kompass-Radar des Arbeitsblatts">
      {[0.33, 0.66, 1].map((r) => (
        <polygon
          key={r}
          points={ACHSEN.map((_, i) => punkt(i, radius * r).join(",")).join(" ")}
          fill="none"
          stroke="var(--rand)"
        />
      ))}
      {ACHSEN.map((a, i) => {
        const [x, y] = punkt(i, radius);
        const [lx, ly] = punkt(i, radius + 24);
        return (
          <g key={a}>
            <line x1={mitte} y1={mitte} x2={x} y2={y} stroke="var(--rand)" />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fill="var(--text-leise)">
              {a}
            </text>
          </g>
        );
      })}
      <polygon points={flaeche} fill="var(--akzent)" fillOpacity="0.2" stroke="var(--akzent)" strokeWidth="2" />
    </svg>
  );
}
