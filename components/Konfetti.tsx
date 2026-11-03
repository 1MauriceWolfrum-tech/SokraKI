const FARBEN = ["#8b7cff", "#22d3ee", "#4ade80", "#fcd34d", "#fb7185", "#f472b6"];
const STUECKE = Array.from({ length: 36 }, (_, i) => i);

// Kurzer Konfetti-Regen für neue Abzeichen; bei „Bewegung reduzieren“ per CSS ausgeblendet.
export function Konfetti() {
  return (
    <div className="konfetti" aria-hidden="true">
      {STUECKE.map((i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: FARBEN[i % FARBEN.length],
            animationDelay: `${(i % 9) * 0.07}s`,
            transform: `rotate(${(i * 47) % 360}deg)`,
            width: `${7 + (i % 4) * 2}px`,
          }}
        />
      ))}
    </div>
  );
}
