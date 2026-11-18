import { parseStudyCards } from "./notes-parser";

export interface QA {
  front: string;
  back: string;
}

function trimQ(s: string, max = 160) {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/**
 * Rule-based flashcard generator (no AI):
 * 1. "Term: definition" / "Term - definition" / "Term = definition" lines
 * 2. "X is/are/means Y" sentences
 * 3. Heading sections → "What do you know about <heading>?"
 */
export function generateFlashcards(content: string, limit = 40): QA[] {
  const out: QA[] = [];
  const seen = new Set<string>();
  const push = (front: string, back: string) => {
    const key = front.toLowerCase();
    if (seen.has(key) || !front.trim() || !back.trim()) return;
    seen.add(key);
    out.push({ front: trimQ(front), back: trimQ(back, 400) });
  };

  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  for (const raw of lines) {
    const line = raw.replace(/^\s*[-*+]\s+|^\s*\d+[.)]\s+/, "").replace(/\*\*|__|`/g, "").trim();
    if (!line || line.startsWith("#")) continue;
    const def = /^([^:=–—]{2,60}?)\s*(?::|=|\s[-–—]\s)\s*(.{3,})$/.exec(line);
    if (def && def[1].split(" ").length <= 7 && !/https?$/i.test(def[1])) {
      push(`What is ${def[1].trim()}?`, def[2]);
      continue;
    }
    const sentences = line.split(/(?<=[.!?])\s+/);
    for (const s of sentences) {
      const m = /^((?:The |A |An )?[A-Z][\w\s'()-]{1,50}?)\s+(is|are|means|refers to|was|were)\s+(.{6,})$/.exec(s);
      if (m && m[1].split(" ").length <= 6) {
        const verb = m[2] === "are" || m[2] === "were" ? "are" : "is";
        push(`What ${verb} ${m[1].replace(/^(The|A|An) /, (x) => x.toLowerCase())}?`, `${m[1]} ${m[2]} ${m[3]}`);
      }
    }
  }

  for (const card of parseStudyCards(content)) {
    if (/^#|\n/.test(card.title)) continue;
    if (content.includes(`# ${card.title.replace(/ \(\d+\/\d+\)$/, "")}`)) {
      push(`What do you know about "${card.title}"?`, card.body);
    }
  }

  return out.slice(0, limit);
}
