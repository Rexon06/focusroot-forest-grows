import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { EmptyState } from "@/components/pixel/Panel";
import { PixelIcon } from "@/components/pixel/Sprite";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { StudyCard } from "@/lib/notes-parser";
import { cn } from "@/lib/utils";

const RARITY = {
  common: { label: "Common", band: "bg-primary", text: "text-primary" },
  rare: { label: "Rare", band: "bg-sky", text: "text-sky" },
  epic: { label: "Epic", band: "bg-gold", text: "text-gold" },
} as const;

export function StudyCardCarousel({ cards, sourceTitle }: { cards: StudyCard[]; sourceTitle: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<StudyCard | null>(null);

  const scrollTo = useCallback((i: number) => {
    const el = scroller.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { root, threshold: 0.6 },
    );
    Array.from(root.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [cards]);

  if (cards.length === 0) {
    return <EmptyState title="No cards yet">Add some text to this note to create study cards.</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-pixel text-[9px] uppercase text-muted-foreground">
          Card {active + 1} / {cards.length}
        </span>
        <div className="flex gap-2">
          <Button size="icon-sm" variant="outline" onClick={() => scrollTo(Math.max(0, active - 1))} disabled={active === 0} aria-label="Previous card">
            <ChevronLeft />
          </Button>
          <Button size="icon-sm" variant="outline" onClick={() => scrollTo(Math.min(cards.length - 1, active + 1))} disabled={active === cards.length - 1} aria-label="Next card">
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div
        ref={scroller}
        className="scrollbar-pixel -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 pt-1"
        tabIndex={0}
        aria-label="Study cards"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") scrollTo(Math.min(cards.length - 1, active + 1));
          if (e.key === "ArrowLeft") scrollTo(Math.max(0, active - 1));
        }}
      >
        {cards.map((c, i) => {
          const r = RARITY[c.rarity];
          return (
            <article
              key={c.index}
              data-index={i}
              className={cn(
                "pixel-panel flex w-[82%] shrink-0 snap-center flex-col p-0 sm:w-80",
                i === active ? "" : "opacity-80",
              )}
            >
              <div className={cn("flex items-center justify-between px-3 py-2", r.band)}>
                <span className="font-pixel text-[9px] text-primary-foreground">#{String(c.index).padStart(2, "0")}</span>
                <span className="font-pixel text-[8px] uppercase text-primary-foreground">{r.label}</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start gap-2">
                  <PixelIcon name="leaf" size={16} className="mt-0.5 shrink-0" />
                  <h3 className="text-[10px] leading-relaxed text-foreground">{c.title}</h3>
                </div>
                <p className="line-clamp-6 min-h-[9rem] whitespace-pre-line text-foreground/90">{c.body}</p>
                <div className="mt-auto flex items-center justify-between gap-2 border-t-2 border-dashed border-outline pt-3">
                  <span className="truncate text-sm text-muted-foreground">
                    {sourceTitle} · {c.index}/{cards.length}
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => setExpanded(c)}>
                    <Maximize2 /> Expand
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={!!expanded} onOpenChange={(o) => !o && setExpanded(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{expanded?.title}</DialogTitle>
            <DialogDescription>
              Card {expanded?.index} of {cards.length} · from “{sourceTitle}”
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-line text-lg leading-relaxed">{expanded?.body}</p>
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!expanded || expanded.index <= 1}
              onClick={() => expanded && setExpanded(cards[expanded.index - 2])}
            >
              <ChevronLeft /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!expanded || expanded.index >= cards.length}
              onClick={() => expanded && setExpanded(cards[expanded.index])}
            >
              Next <ChevronRight />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
