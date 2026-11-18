export interface StudyCard {
  index: number;
  title: string;
  body: string;
  rarity: "common" | "rare" | "epic";
}

const MAX_CARD_CHARS = 700;

function cleanInline(s: string) {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1")
    .trim();
}

function firstSentence(text: string, max = 48) {
  const s = text.split(/(?<=[.!?])\s/)[0] ?? text;
  const clean = s.replace(/^[-*+]\s+/, "").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

function chunk(text: string): string[] {
  if (text.length <= MAX_CARD_CHARS) return [text];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > MAX_CARD_CHARS && buf) {
      out.push(buf.trim());
      buf = s;
    } else buf = `${buf} ${s}`;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function rarityFor(body: string): StudyCard["rarity"] {
  if (body.length > 450) return "epic";
  if (body.length > 200) return "rare";
  return "common";
}

/**
 * Splits notes into study cards. Markdown headings (#, ##, ...) or "Title:" style
 * lines start new sections; otherwise blank-line separated paragraphs become cards.
 */
export function parseStudyCards(content: string): StudyCard[] {
  const text = content.replace(/\r\n?/g, "\n").trim();
  if (!text) return [];
  const lines = text.split("\n");
  const sections: { title: string; paras: string[] }[] = [];
  let current: { title: string; paras: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    const p = para.join("\n").trim();
    para = [];
    if (!p) return;
    if (!current) {
      current = { title: "", paras: [] };
      sections.push(current);
    }
    current.paras.push(p);
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = /^\s{0,3}#{1,6}\s+(.+?)\s*#*$/.exec(line);
    const underline = /^\s*(=+|-{3,})\s*$/.test(line) && para.length === 1;
    if (heading) {
      flushPara();
      current = { title: cleanInline(heading[1] ?? ""), paras: [] };
      sections.push(current);
    } else if (underline) {
      const title = para[0];
      para = [];
      current = { title: cleanInline(title ?? ""), paras: [] };
      sections.push(current);
    } else if (!line.trim()) {
      flushPara();
    } else {
      para.push(line);
    }
  }
  flushPara();

  const hasHeadings = sections.some((s) => s.title);
  const cards: Omit<StudyCard, "index">[] = [];

  for (const s of sections) {
    if (hasHeadings && s.title) {
      const body = s.paras.map(cleanInline).join("\n\n");
      const parts = body ? chunk(body) : [""];
      parts.forEach((part, i) =>
        cards.push({
          title: parts.length > 1 ? `${s.title} (${i + 1}/${parts.length})` : s.title,
          body: part || "(No details yet — add text under this heading.)",
          rarity: rarityFor(part),
        }),
      );
    } else {
      for (const p of s.paras) {
        const clean = cleanInline(p);
        for (const part of chunk(clean)) {
          cards.push({ title: firstSentence(part), body: part, rarity: rarityFor(part) });
        }
      }
    }
  }
  return cards.map((c, i) => ({ ...c, index: i + 1 }));
}

export const MAX_UPLOAD_BYTES = 1_000_000;
export const ACCEPTED_EXTENSIONS = [".txt", ".md", ".markdown"];

export function isAcceptedFile(name: string) {
  const lower = name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function titleFromFileName(name: string) {
  return name.replace(/\.(txt|md|markdown)$/i, "").replace(/[-_]+/g, " ").trim() || "Untitled";
}
