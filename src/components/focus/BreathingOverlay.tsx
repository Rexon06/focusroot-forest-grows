import { useEffect, useState } from "react";

import { Sprite } from "@/components/pixel/Sprite";
import { growthSprite } from "@/components/pixel/sprites";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { useAppStore } from "@/store/app-store";
import { useUiStore } from "@/store/ui-store";

const BREATH_SECONDS = 10;

/** Calming interruption screen with a 10-second breathing countdown. */
export function BreathingOverlay() {
  const { open, reason } = useUiStore((s) => s.breathing);
  const close = useUiStore((s) => s.closeBreathing);
  const reset = useAppStore((s) => s.resetSession);
  const intention = useAppStore((s) => s.timer.intention);
  const sfx = useSfx();
  const [left, setLeft] = useState(BREATH_SECONDS);

  useEffect(() => {
    if (!open) return;
    const startedAt = Date.now();
    setLeft(BREATH_SECONDS);
    const id = window.setInterval(() => {
      const remaining = Math.max(0, BREATH_SECONDS - Math.floor((Date.now() - startedAt) / 1000));
      setLeft(remaining);
      if (remaining === 0) window.clearInterval(id);
    }, 200);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  const phase = left > 5 ? "Breathe in…" : left > 0 ? "Breathe out…" : "Well done.";

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-panel-inset/95 p-6 text-center animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Breathing break"
    >
      <p className="font-pixel text-[10px] uppercase text-primary">
        {reason === "reset" ? "Before you quit…" : "Feeling distracted?"}
      </p>
      <div className="relative grid h-56 w-56 place-items-center">
        <div className="absolute inset-0 animate-breathe border-[6px] border-primary bg-accent/40" />
        <div className="absolute inset-6 animate-breathe border-[4px] border-gold/70 [animation-delay:150ms]" />
        <Sprite sprite={growthSprite("sapling", "oak")} size={72} className="relative animate-sway" />
      </div>
      <div>
        <p className="text-2xl text-foreground">{phase}</p>
        <p className="mt-2 font-pixel text-3xl text-gold" aria-live="polite">{left}</p>
      </div>
      {intention && (
        <p className="max-w-sm text-muted-foreground">
          You came here to: <span className="text-foreground">{intention}</span>
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={() => {
            sfx("click");
            close();
          }}
        >
          {reason === "reset" ? "Keep focusing" : "Back to focus"}
        </Button>
        {reason === "reset" && (
          <Button
            variant="destructive"
            disabled={left > 0}
            onClick={() => {
              reset();
              sfx("pause");
              close();
            }}
          >
            {left > 0 ? `End session (${left})` : "End session"}
          </Button>
        )}
      </div>
    </div>
  );
}
