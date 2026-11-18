import type { FocusSession, TreeType } from "./types";

/** XP needed to reach a level: L2=100, L3=300, L4=600, L5=1000 ... */
export function xpForLevel(level: number) {
  return 50 * (level - 1) * level;
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, into: xp - base, needed: next - base, pct: (xp - base) / (next - base) };
}

/** 1 XP per focused minute plus a 10 XP completion bonus. */
export function xpForSession(minutes: number) {
  return Math.round(minutes) + 10;
}

/** 1 acorn per 5 focused minutes, minimum 1. */
export function acornsForSession(minutes: number) {
  return Math.max(1, Math.floor(minutes / 5));
}

export const GROWTH_PER_TREE = 60;

export type GrowthStage = "seed" | "sprout" | "sapling" | "young" | "grown";

export function growthStage(points: number): GrowthStage {
  if (points >= GROWTH_PER_TREE) return "grown";
  if (points >= 40) return "young";
  if (points >= 25) return "sapling";
  if (points >= 10) return "sprout";
  return "seed";
}

export const TREE_UNLOCKS: { type: TreeType; name: string; level: number }[] = [
  { type: "oak", name: "Old Oak", level: 1 },
  { type: "pine", name: "Whisper Pine", level: 2 },
  { type: "birch", name: "Moon Birch", level: 3 },
  { type: "cherry", name: "Cherry Bloom", level: 4 },
  { type: "maple", name: "Ember Maple", level: 5 },
  { type: "spirit", name: "Spirit Tree", level: 7 },
];

export function isTreeUnlocked(type: TreeType, level: number) {
  return (TREE_UNLOCKS.find((t) => t.type === type)?.level ?? 99) <= level;
}

export function dayKey(ts: number | Date) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function minutesOnDay(sessions: FocusSession[], key: string) {
  return sessions.filter((s) => dayKey(s.endedAt) === key).reduce((a, s) => a + s.minutes, 0);
}

/** Consecutive days with at least one session, ending today (or yesterday if today has none yet). */
export function currentStreak(sessions: FocusSession[], now: number) {
  const days = new Set(sessions.map((s) => dayKey(s.endedAt)));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const MESSAGES = [
  "Every great forest began as a single quiet seed.",
  "Roots grow in silence. So does deep work.",
  "One focused session today is a tree tomorrow.",
  "Be like moss: slow, steady, everywhere.",
  "The forest doesn't rush, yet everything gets done.",
  "Small sessions, tall trees.",
  "Turn the noise down. Let the leaves speak.",
  "Your attention is sunlight. Point it somewhere good.",
  "Rest is part of growing too.",
  "Today's acorn, tomorrow's oak.",
];

export function dailyMessage(now: number) {
  const d = new Date(now);
  const start = new Date(d.getFullYear(), 0, 0).getTime();
  const doy = Math.floor((d.getTime() - start) / 86_400_000);
  return MESSAGES[doy % MESSAGES.length];
}

export function greeting(now: number) {
  const h = new Date(now).getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
