import { describe, expect, it } from "vitest";

import { DECOR_SPRITES, ICONS, treeSprite } from "@/components/pixel/sprites";
import { generateFlashcards } from "./flashcards";
import { parseStudyCards } from "./notes-parser";
import { acornsForSession, currentStreak, growthStage, levelFromXp, xpForSession } from "./progress";
import { buildQuiz } from "./quiz";
import { getRemainingMs, idleTimer, isComplete, pauseTimer, resetTimer, startTimer } from "./timer";

describe("focus timer", () => {
  it("offers 25, 45 and 60 minute sessions", () => {
    expect(idleTimer(25).durationMs).toBe(25 * 60_000);
    expect(idleTimer(45).durationMs).toBe(45 * 60_000);
    expect(idleTimer(60).durationMs).toBe(60 * 60_000);
  });

  it("keeps counting from wall-clock time (survives navigation/reload)", () => {
    const t = startTimer(idleTimer(25), 1_000_000);
    expect(getRemainingMs(t, 1_000_000 + 10 * 60_000)).toBe(15 * 60_000);
  });

  it("pause freezes remaining time and resume continues from it", () => {
    let t = startTimer(idleTimer(25), 0);
    t = pauseTimer(t, 5 * 60_000);
    expect(getRemainingMs(t, 99 * 60_000)).toBe(20 * 60_000);
    t = startTimer(t, 100 * 60_000);
    expect(getRemainingMs(t, 110 * 60_000)).toBe(10 * 60_000);
  });

  it("completes when the end time passes and reset restores full duration", () => {
    const t = startTimer(idleTimer(25), 0);
    expect(isComplete(t, 25 * 60_000 - 1)).toBe(false);
    expect(isComplete(t, 25 * 60_000)).toBe(true);
    expect(getRemainingMs(resetTimer(t), 0)).toBe(25 * 60_000);
  });
});

describe("rewards", () => {
  it("gives 1 XP per minute plus 10 bonus and 1 acorn per 5 minutes", () => {
    expect(xpForSession(25)).toBe(35);
    expect(acornsForSession(25)).toBe(5);
    expect(acornsForSession(3)).toBe(1);
  });

  it("levels: L2 at 100 XP, L3 at 300 XP", () => {
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(300)).toBe(3);
  });

  it("seed grows to sprout, sapling, young, then a full tree at 60 points", () => {
    expect(growthStage(0)).toBe("seed");
    expect(growthStage(10)).toBe("sprout");
    expect(growthStage(25)).toBe("sapling");
    expect(growthStage(40)).toBe("young");
    expect(growthStage(60)).toBe("grown");
  });

  it("streak counts consecutive days", () => {
    const day = 86_400_000;
    const now = new Date(2026, 10, 18, 12).getTime();
    const s = (ts: number) => ({ id: "x", startedAt: ts, endedAt: ts, minutes: 25, intention: "", xp: 35 });
    expect(currentStreak([s(now), s(now - day), s(now - 2 * day)], now)).toBe(3);
    expect(currentStreak([s(now - 3 * day)], now)).toBe(0);
  });
});

describe("notes → study cards, flashcards, quiz", () => {
  const md = "# Cells\nCells are the basic unit of life.\n\n# Mitochondria\nMitochondria: the powerhouse of the cell.";

  it("splits on headings into cards", () => {
    const cards = parseStudyCards(md);
    expect(cards.map((c) => c.title)).toEqual(["Cells", "Mitochondria"]);
  });

  it("splits plain paragraphs when there are no headings", () => {
    expect(parseStudyCards("First idea.\n\nSecond idea.\n\nThird idea.")).toHaveLength(3);
  });

  it("creates Q&A flashcards from definitions", () => {
    const fc = generateFlashcards(md);
    expect(fc.some((f) => f.front === "What is Mitochondria?" && f.back === "the powerhouse of the cell.")).toBe(true);
  });

  it("builds quizzes with four options including the correct one", () => {
    const cards = [1, 2, 3, 4].map((n) => ({ front: `Q${n}`, back: `A${n}` }));
    const quiz = buildQuiz(cards);
    expect(quiz).toHaveLength(4);
    for (const q of quiz) {
      expect(q.options).toHaveLength(4);
      expect(q.options[q.correctIndex]).toBe(`A${q.question.slice(1)}`);
    }
    expect(buildQuiz(cards.slice(0, 2))).toEqual([]);
  });
});

describe("sprites", () => {
  it("every sprite has rows of equal width", () => {
    const all = [...Object.values(DECOR_SPRITES), ...Object.values(ICONS), treeSprite("oak"), treeSprite("pine")];
    for (const s of all) expect(new Set(s.rows.map((r) => r.length)).size).toBe(1);
  });
});
