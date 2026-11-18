import { Check, ChevronLeft, ChevronRight, Pencil, Plus, RefreshCw, RotateCw, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Chip, EmptyState } from "@/components/pixel/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSfx } from "@/hooks/use-sfx";
import type { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

type Filter = "all" | "revision" | "new";

export function FlashcardDeck({ noteId }: { noteId: string }) {
  const all = useAppStore((s) => s.flashcards);
  const setStatus = useAppStore((s) => s.setFlashcardStatus);
  const regenerate = useAppStore((s) => s.regenerateFlashcards);
  const addFlashcard = useAppStore((s) => s.addFlashcard);
  const updateFlashcard = useAppStore((s) => s.updateFlashcard);
  const deleteFlashcard = useAppStore((s) => s.deleteFlashcard);
  const logActivity = useAppStore((s) => s.logActivity);
  const sfx = useSfx();

  const cards = useMemo(() => all.filter((f) => f.noteId === noteId), [all, noteId]);
  const [filter, setFilter] = useState<Filter>("all");
  const deck = useMemo(
    () => cards.filter((c) => (filter === "all" ? true : c.status === filter)),
    [cards, filter],
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [manage, setManage] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [editing, setEditing] = useState<Flashcard | null>(null);

  useEffect(() => {
    if (index >= deck.length) setIndex(Math.max(0, deck.length - 1));
  }, [deck.length, index]);

  const card = deck[index];
  const remembered = cards.filter((c) => c.status === "remembered").length;
  const revision = cards.filter((c) => c.status === "revision").length;

  const go = (d: number) => {
    setFlipped(false);
    setIndex((i) => (deck.length ? (i + d + deck.length) % deck.length : 0));
  };

  const mark = (status: Flashcard["status"]) => {
    if (!card) return;
    setStatus(card.id, status);
    sfx(status === "remembered" ? "click" : "pause");
    if (status === "remembered" && remembered + 1 === cards.length) {
      logActivity("flashcards", `Remembered every flashcard in a deck (${cards.length})`);
      toast.success("Whole deck remembered!");
    }
    if (filter === "all") go(1);
    else setFlipped(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter flashcards">
          <Chip active={filter === "all"} onClick={() => { setFilter("all"); setIndex(0); setFlipped(false); }}>All · {cards.length}</Chip>
          <Chip active={filter === "revision"} onClick={() => { setFilter("revision"); setIndex(0); setFlipped(false); }}>Revise · {revision}</Chip>
          <Chip active={filter === "new"} onClick={() => { setFilter("new"); setIndex(0); setFlipped(false); }}>
            New · {cards.filter((c) => c.status === "new").length}
          </Chip>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const n = regenerate(noteId);
              toast.success(n ? `Generated ${n} flashcards from your note` : "No question patterns found — add cards manually.");
            }}
          >
            <RefreshCw /> Regenerate
          </Button>
          <Button size="sm" variant={manage ? "default" : "secondary"} onClick={() => setManage((m) => !m)}>
            <Pencil /> Manage
          </Button>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState title="No flashcards yet">
          Flashcards are made with simple built-in rules: lines like “Term: definition”, sentences like “X is Y”, and
          headings. Add some, or write your own below with Manage.
        </EmptyState>
      ) : !card ? (
        <EmptyState title="Nothing in this pile">All clear here — switch filter to keep studying.</EmptyState>
      ) : (
        <>
          <p className="text-center font-pixel text-[9px] uppercase text-muted-foreground">
            {index + 1} / {deck.length} · {remembered} remembered
          </p>
          <div className="flip-scene mx-auto w-full max-w-xl">
            <button
              type="button"
              onClick={() => {
                setFlipped((f) => !f);
                sfx("click");
              }}
              className={cn("flip-card relative grid min-h-64 w-full cursor-pointer text-left", flipped && "flip-flipped")}
              aria-label={flipped ? "Show question" : "Show answer"}
            >
              <div className="flip-face pixel-panel col-start-1 row-start-1 flex flex-col gap-3 p-5">
                <span className="font-pixel text-[8px] uppercase text-gold">Question</span>
                <p className="flex flex-1 items-center text-xl leading-relaxed text-foreground">{card.front}</p>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <RotateCw className="size-3.5" /> Tap to flip
                </span>
              </div>
              <div className="flip-face flip-back pixel-panel col-start-1 row-start-1 flex flex-col gap-3 bg-accent p-5">
                <span className="font-pixel text-[8px] uppercase text-primary">Answer</span>
                <p className="flex-1 overflow-y-auto whitespace-pre-line text-lg leading-relaxed text-foreground">{card.back}</p>
                <StatusBadge status={card.status} />
              </div>
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button size="icon" variant="outline" onClick={() => go(-1)} aria-label="Previous flashcard">
              <ChevronLeft />
            </Button>
            <Button variant="destructive" onClick={() => mark("revision")}>
              <X /> Needs revision
            </Button>
            <Button onClick={() => mark("remembered")}>
              <Check /> Remembered
            </Button>
            <Button size="icon" variant="outline" onClick={() => go(1)} aria-label="Next flashcard">
              <ChevronRight />
            </Button>
          </div>
        </>
      )}

      {manage && (
        <div className="pixel-inset flex flex-col gap-3 p-4">
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!front.trim() || !back.trim()) return;
              if (editing) {
                updateFlashcard(editing.id, { front, back });
                setEditing(null);
                toast.success("Flashcard updated");
              } else {
                addFlashcard(noteId, front, back);
                toast.success("Flashcard added");
              }
              setFront("");
              setBack("");
            }}
          >
            <p className="font-pixel text-[9px] uppercase text-gold">{editing ? "Edit flashcard" : "Add a flashcard"}</p>
            <Input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Question (front)" maxLength={200} />
            <Textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Answer (back)" rows={3} maxLength={600} />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!front.trim() || !back.trim()}>
                <Plus /> {editing ? "Save" : "Add"}
              </Button>
              {editing && (
                <Button type="button" size="sm" variant="outline" onClick={() => { setEditing(null); setFront(""); setBack(""); }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
          {cards.length > 0 && (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto scrollbar-pixel">
              {cards.map((c) => (
                <li key={c.id} className="flex items-start gap-2 border-b-2 border-dashed border-outline pb-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">{c.front}</p>
                    <p className="truncate text-sm text-muted-foreground">{c.back}</p>
                  </div>
                  <StatusBadge status={c.status} />
                  <Button size="icon-sm" variant="outline" aria-label="Edit flashcard" onClick={() => { setEditing(c); setFront(c.front); setBack(c.back); }}>
                    <Pencil />
                  </Button>
                  <Button size="icon-sm" variant="destructive" aria-label="Delete flashcard" onClick={() => deleteFlashcard(c.id)}>
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Flashcard["status"] }) {
  const map = {
    new: "bg-panel-inset text-muted-foreground",
    remembered: "bg-primary text-primary-foreground",
    revision: "bg-destructive text-destructive-foreground",
  } as const;
  const label = { new: "New", remembered: "Remembered", revision: "Revise" }[status];
  return <span className={cn("pixel-chip self-start px-2 py-1 font-pixel text-[7px] uppercase", map[status])}>{label}</span>;
}
