import { ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState, PixelProgress } from "@/components/pixel/Panel";
import { PixelIcon } from "@/components/pixel/Sprite";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { buildQuiz, type QuizQuestion } from "@/lib/quiz";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const LETTERS = ["A", "B", "C", "D"];

export function QuizPanel({ noteId }: { noteId: string }) {
  const flashcards = useAppStore((s) => s.flashcards);
  const results = useAppStore((s) => s.quizResults);
  const recordQuiz = useAppStore((s) => s.recordQuiz);
  const sfx = useSfx();

  const own = useMemo(() => flashcards.filter((f) => f.noteId === noteId), [flashcards, noteId]);
  const others = useMemo(() => flashcards.filter((f) => f.noteId !== noteId).map((f) => f.back), [flashcards, noteId]);
  const pastResults = results.filter((r) => r.noteId === noteId);
  const best = pastResults.reduce<number | null>((b, r) => Math.max(b ?? 0, Math.round((r.score / r.total) * 100)), null);
  const canQuiz = own.length > 0 && new Set([...own.map((f) => f.back), ...others]).size >= 4;

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<{ q: QuizQuestion; picked: number }[]>([]);
  const [finished, setFinished] = useState<{ xp: number } | null>(null);

  const start = () => {
    setQuestions(buildQuiz(own, others, 10));
    setQi(0);
    setPicked(null);
    setScore(0);
    setWrong([]);
    setFinished(null);
    sfx("start");
  };

  if (!canQuiz) {
    return (
      <EmptyState title="Not enough flashcards">
        Quizzes need at least 4 different flashcard answers (from this note or others). Add or regenerate flashcards
        first.
      </EmptyState>
    );
  }

  if (!questions) {
    return (
      <div className="pixel-inset flex flex-col items-center gap-4 px-4 py-8 text-center">
        <Trophy className="size-10 text-gold" />
        <p className="font-pixel text-[10px] uppercase leading-relaxed">Multiple choice quiz</p>
        <p className="max-w-sm text-muted-foreground">
          Up to {Math.min(10, own.length)} questions built from this note's flashcards. Each correct answer gives 2 XP.
        </p>
        {best !== null && <p className="font-pixel text-[9px] text-gold">Best score: {best}%</p>}
        <Button size="lg" onClick={start}>Start quiz</Button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col gap-4">
        <div className="pixel-inset flex flex-col items-center gap-3 px-4 py-8 text-center animate-rise">
          <PixelIcon name="star" size={40} className="animate-bob" />
          <p className="font-pixel text-[10px] uppercase text-gold">Quiz complete</p>
          <p className="font-pixel text-3xl">
            {score}/{questions.length}
          </p>
          <p className="text-lg text-muted-foreground">
            {pct === 100 ? "Perfect! The forest spirits applaud." : pct >= 70 ? "Great work — almost there!" : "Every attempt grows your roots. Try again!"}
          </p>
          <p className="font-pixel text-[9px] text-primary">+{finished.xp} XP</p>
          <div className="flex gap-2">
            <Button onClick={start}><RotateCcw /> Retry</Button>
            <Button variant="outline" onClick={() => setQuestions(null)}>Done</Button>
          </div>
        </div>
        {wrong.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-pixel text-[9px] uppercase text-gold">Review</p>
            {wrong.map(({ q, picked: p }, i) => (
              <div key={i} className="pixel-inset p-3">
                <p className="text-foreground">{q.question}</p>
                <p className="text-sm text-destructive">Your answer: {q.options[p]}</p>
                <p className="text-sm text-success">Correct: {q.options[q.correctIndex]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const q = questions[qi];
  const answered = picked !== null;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.correctIndex) {
      setScore((s) => s + 1);
      sfx("click");
    } else {
      setWrong((w) => [...w, { q, picked: i }]);
      sfx("error");
    }
  };

  const next = () => {
    if (qi + 1 >= questions.length) {
      const xp = recordQuiz(noteId, score, questions.length);
      setFinished({ xp });
      sfx("complete");
    } else {
      setQi(qi + 1);
      setPicked(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between font-pixel text-[9px] uppercase text-muted-foreground">
        <span>
          Question {qi + 1} / {questions.length}
        </span>
        <span className="text-gold">Score {score}</span>
      </div>
      <PixelProgress value={(qi + (answered ? 1 : 0)) / questions.length} tone="gold" label="Quiz progress" />
      <div className="pixel-panel p-5">
        <p className="text-xl leading-relaxed">{q.question}</p>
      </div>
      <div className="grid gap-2" role="radiogroup" aria-label="Answers">
        {q.options.map((opt, i) => {
          const correct = answered && i === q.correctIndex;
          const wrongPick = answered && i === picked && i !== q.correctIndex;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={picked === i}
              onClick={() => choose(i)}
              disabled={answered}
              className={cn(
                "pixel-btn flex items-start gap-3 bg-panel-inset p-3 text-left disabled:cursor-default",
                correct && "bg-primary text-primary-foreground",
                wrongPick && "bg-destructive text-destructive-foreground",
                answered && !correct && !wrongPick && "opacity-60",
              )}
            >
              <span className="font-pixel text-[10px]">{LETTERS[i]}</span>
              <span className="line-clamp-4">{opt}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="flex flex-wrap items-center justify-between gap-3 animate-rise">
          <p className={cn("font-pixel text-[10px] uppercase", picked === q.correctIndex ? "text-success" : "text-destructive")}>
            {picked === q.correctIndex ? "Correct!" : "Not quite"}
          </p>
          <Button onClick={next}>
            {qi + 1 >= questions.length ? "See results" : "Next"} <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}
