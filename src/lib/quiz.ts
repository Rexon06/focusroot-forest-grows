export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds 4-option multiple choice questions from flashcards. Wrong options are
 * answers from other cards (extra pool can come from other notes).
 */
export function buildQuiz(
  cards: { front: string; back: string }[],
  extraAnswers: string[] = [],
  max = 10,
  rand: () => number = Math.random,
): QuizQuestion[] {
  const pool = Array.from(new Set([...cards.map((c) => c.back), ...extraAnswers]));
  if (cards.length === 0 || pool.length < 4) return [];
  return shuffle(cards, rand)
    .slice(0, max)
    .map((c) => {
      const wrong = shuffle(
        pool.filter((a) => a !== c.back),
        rand,
      ).slice(0, 3);
      const options = shuffle([c.back, ...wrong], rand);
      return { question: c.front, options, correctIndex: options.indexOf(c.back) };
    });
}
