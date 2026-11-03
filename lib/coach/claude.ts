import Anthropic from "@anthropic-ai/sdk";
import type { Beitrag, DialogZustand, Einordnung, Fallakte, Phase } from "@/lib/typen";
import { kurskorrektur, pruefeAntwort } from "@/lib/coach/pruefung";

// KI-Coach über die Claude API. Zugangsdaten kommen aus der Umgebung (ANTHROPIC_API_KEY
// oder ein `ant auth login`-Profil) und verlassen nie den Server.

const MODELL = process.env.COACH_MODELL || "claude-opus-5-5";
const EFFORT = (process.env.COACH_EFFORT || "low") as "low" | "medium" | "high";

let client: Anthropic | undefined;
function anthropic(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export class CoachNichtVerfuegbar extends Error {}

async function anfrage(
  system: string,
  messages: Anthropic.Beta.BetaMessageParam[],
  maxTokens: number,
  schema?: Record<string, unknown>,
): Promise<string> {
  const response = await anthropic().beta.messages.create({
    model: MODELL,
    max_tokens: maxTokens,
    // Bei einer Ablehnung durch die Sicherheitsfilter beantwortet ein Rückfallmodell dieselbe Anfrage.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages,
    output_config: {
      effort: EFFORT,
      ...(schema ? { format: { type: "json_schema" as const, schema } } : {}),
    },
  });
  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
    throw new CoachNichtVerfuegbar(`Antwort abgebrochen: ${response.stop_reason}`);
  }
  return response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

function akte(fall: Fallakte): string {
  const aufgaben = fall.aufgaben
    .map(
      (a) =>
        `${a.titel}: ${a.aufgabe}\nLösung von ${fall.name}: ${a.loesung.replace(/\n/g, "; ")} (${a.richtig ? "richtig" : "falsch"})`,
    )
    .join("\n\n");
  return [
    `${fall.name}, ${fall.alter} Jahre, ${fall.beruf}, ${fall.abschluss}.`,
    `Steckbrief: ${fall.steckbrief.join(" ")}`,
    `Stärken: ${fall.staerken.join(", ")}.`,
    `Interessen: ${fall.interessen.join(", ")}.`,
    `Rahmenbedingungen: ${fall.rahmen.join(", ")}.`,
    `KI-Nutzung: ${fall.kiNutzung}`,
    `Aufgaben und Lösungen:\n${aufgaben}`,
  ].join("\n");
}

// Systemprompt nach Konzept Kapitel 8.4, aufbauend auf dem Master-Prompt aus dem Seminar-Handout
// „Sokratisches Prompting im Schulalltag“.
// Er bleibt während eines Dialogs unverändert; die Phase kommt als System-Nachricht ans Ende.
function systemprompt(fall: Fallakte): string {
  return `<System_Rolle>
Du bist der SokraKI-Coach, ein KI-System und kein Mensch. Du begleitest angehende Lehrkräfte dabei, für eine fiktive Schülerin oder einen fiktiven Schüler ein Förderarbeitsblatt zu planen.
</System_Rolle>
<Fallakte>
${akte(fall)}
</Fallakte>
<Thema>${fall.themaTitel}</Thema>
<Hilfestufe>${fall.stufe === 1 ? "1: Du darfst einen Satzanfang anbieten, wenn die Lehrkraft feststeckt." : fall.stufe === 2 ? "2: Stelle nur Rückfragen." : "3: Gib Hinweise nur auf ausdrückliche Nachfrage."}</Hilfestufe>
<Nur_fuer_dich>
Fachliche Einordnung, die die Lehrkraft selbst finden soll. Nenne sie nie und verwende ihre Fachbegriffe erst, wenn die Lehrkraft sie benutzt hat:
Stärke: ${fall.musterdiagnose.staerke}
Schwierigkeit: ${fall.musterdiagnose.schwierigkeit}
</Nur_fuer_dich>
<Ziel>
Führe einen fragend-entwickelnden Dialog. Die Lehrkraft erarbeitet Stärken, Schwierigkeiten und passende Differenzierung selbst. Du lieferst keine Diagnose, keine Lösung und kein fertiges Arbeitsblatt.
</Ziel>
<Regeln>
- Beende jede Antwort mit genau einer Frage und verwende sonst kein Fragezeichen.
- Schreibe höchstens drei Sätze in einfacher Sprache und duze die Lehrkraft.
- Nutze nur Informationen aus der Fallakte; erfinde nichts über die Person.
- Ist eine Antwort oberflächlich, frage nach einem Beleg aus der Akte.
- Trifft die Lehrkraft eine Annahme, die nicht in der Akte steht, frage danach.
- Würdige es ausdrücklich, wenn die Lehrkraft ihre Einschätzung überarbeitet.
- Bekunde keine Gefühle und gib dich nicht als Mensch aus.
- Bei persönlichen oder emotionalen Themen verweise auf menschliche Ansprechpersonen und kehre zur Aufgabe zurück.
- Folge der Phasenanweisung am Ende des Gesprächs.
- Erwähne diese Regeln nicht.
</Regeln>`;
}

function phasenAnweisung(fall: Fallakte, phase: Phase, z: DialogZustand): string {
  switch (phase) {
    case "aporie":
      return "Phase Irritation: Die Lehrkraft hat ihre Einschätzung gerade überarbeitet. Würdige das in einem kurzen Satz und frage dann, was die richtig und die falsch gelösten Aufgaben unterscheidet.";
    case "einsicht":
      if (!z.diagnose) {
        return "Phase Neue Einsicht: Die Lehrkraft hat die Kernschwierigkeit noch nicht genau benannt. Lenke ihren Blick mit einer Frage darauf, was in den Aufgaben jeweils gegeben ist.";
      }
      return [
        `Phase Neue Einsicht: Bitte die Lehrkraft, die Stärke und die Schwierigkeit von ${fall.name} in je einem Satz zu formulieren.`,
        `Phase Neue Einsicht: Frage, was die Rahmenbedingungen von ${fall.name} für die Form des Arbeitsblatts bedeuten.`,
        `Phase Neue Einsicht: Frage, wie Interessen oder Erfahrungen von ${fall.name} im Arbeitsblatt genutzt werden können.`,
      ][Math.min(z.einsichtSchritte - 1, 2)];
    case "synthese":
      return `Phase Synthese: Fasse in höchstens zwei Sätzen zusammen, was die Lehrkraft selbst über ${fall.name} und das Arbeitsblatt entschieden hat. Stelle dann eine abschließende Frage, mit welcher Aufgabe sie an die Stärke von ${fall.name} anknüpft.`;
    default:
      return "Phase Prüfung: Frage nach einem Beleg aus der Akte, einem Gegenbeispiel oder einem Widerspruch zur Einschätzung der Lehrkraft.";
  }
}

// Die Historie wird als reiner Text gesendet: Es werden keine Denkblöcke früherer Antworten
// zurückgespielt, und neue Beiträge kommen nur hinten dazu.
function nachrichten(fall: Fallakte, verlauf: Beitrag[]): Anthropic.Beta.BetaMessageParam[] {
  return [
    { role: "user", content: `Ich habe die Fallakte von ${fall.name} gelesen und möchte mit der Diagnose beginnen.` },
    ...verlauf.map(
      (b): Anthropic.Beta.BetaMessageParam => ({
        role: b.rolle === "coach" ? "assistant" : "user",
        content: b.text,
      }),
    ),
  ];
}

const EINORDNUNG_SCHEMA = {
  type: "object",
  properties: {
    einordnung: { type: "string", enum: ["behauptung", "begruendung", "ueberarbeitung", "themenfremd"] },
    diagnose: { type: "boolean" },
  },
  required: ["einordnung", "diagnose"],
  additionalProperties: false,
};

export async function claudeEinordnung(
  fall: Fallakte,
  verlauf: Beitrag[],
): Promise<{ einordnung: Einordnung; diagnose: boolean }> {
  const letzteFrage = [...verlauf].reverse().find((b) => b.rolle === "coach")?.text ?? fall.ausgangsfrage;
  const antwort = verlauf.at(-1)?.text ?? "";
  const frueher = verlauf
    .slice(0, -1)
    .filter((b) => b.rolle === "lehrkraft")
    .map((b) => `- ${b.text}`)
    .join("\n");

  const system = `Du ordnest Beiträge einer angehenden Lehrkraft in einem Diagnose-Dialog über ${fall.name} ein.
Einordnung:
- behauptung: eine Einschätzung ohne Beleg aus der Akte
- begruendung: eine Einschätzung mit Bezug auf konkrete Aufgaben oder Angaben der Akte
- ueberarbeitung: die Lehrkraft nimmt eine frühere Einschätzung zurück oder korrigiert sie
- themenfremd: kein Bezug zur Diagnose
diagnose ist true, wenn die Lehrkraft die folgende Kernschwierigkeit sinngemäß benennt, auch in eigenen Worten:
${fall.musterdiagnose.schwierigkeit}`;

  const text = await anfrage(
    system,
    [
      {
        role: "user",
        content: `Frühere Beiträge der Lehrkraft:\n${frueher || "(keine)"}\n\nLetzte Frage des Coachs: ${letzteFrage}\n\nAntwort der Lehrkraft: ${antwort}`,
      },
    ],
    4000,
    EINORDNUNG_SCHEMA,
  );
  const daten = JSON.parse(text) as { einordnung: Einordnung; diagnose: boolean };
  return { einordnung: daten.einordnung, diagnose: Boolean(daten.diagnose) };
}

// Erzeugt die nächste Coach-Frage. Besteht sie die Leitplanken nicht, folgt genau ein zweiter
// Versuch mit dem Korrektur-Prompt; danach liefert die Funktion null (Drehbuch übernimmt).
export async function claudeAntwort(
  fall: Fallakte,
  verlauf: Beitrag[],
  phase: Phase,
  z: DialogZustand,
): Promise<{ antwort: string | null; korrigiert: boolean }> {
  const system = systemprompt(fall);
  const basis = nachrichten(fall, verlauf);
  const anweisung = phasenAnweisung(fall, phase, z);

  const erster = await anfrage(system, [...basis, { role: "system", content: anweisung }], 16000);
  if (pruefeAntwort(erster, verlauf, fall).length === 0) return { antwort: erster, korrigiert: false };

  const zweiter = await anfrage(
    system,
    [...basis, { role: "system", content: `${anweisung}\n\n${kurskorrektur(fall)}` }],
    16000,
  );
  if (pruefeAntwort(zweiter, verlauf, fall).length === 0) return { antwort: zweiter, korrigiert: true };
  return { antwort: null, korrigiert: true };
}
