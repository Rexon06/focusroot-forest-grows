import { Link } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";

import { PixelIcon } from "@/components/pixel/Sprite";
import { useNow } from "@/hooks/use-now";
import { formatClock, getRemainingMs } from "@/lib/timer";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function MiniTimer({ variant }: { variant: "sidebar" | "floating" }) {
  const timer = useAppStore((s) => s.timer);
  const pause = useAppStore((s) => s.pauseSession);
  const resume = useAppStore((s) => s.resumeSession);
  const now = useNow(500);
  const remaining = getRemainingMs(timer, now);
  const running = timer.status === "running";
  const pct = 1 - remaining / Math.max(1, timer.durationMs);

  if (variant === "floating" && timer.status === "idle") return null;

  return (
    <div
      className={cn(
        "pixel-panel flex items-center gap-3 p-2.5",
        variant === "floating" && "animate-rise",
      )}
    >
      <Link to="/focus" className="flex min-w-0 flex-1 items-center gap-2" aria-label="Open focus timer">
        <PixelIcon name="clock" size={22} className={running ? "animate-bob" : undefined} />
        <div className="min-w-0">
          <div className={cn("font-pixel text-sm text-foreground", !running && timer.status === "paused" && "animate-blink")}>
            {formatClock(remaining)}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {timer.status === "idle" ? "Ready to focus" : running ? "Focusing…" : "Paused"}
          </div>
        </div>
      </Link>
      {timer.status !== "idle" && (
        <button
          type="button"
          onClick={running ? pause : resume}
          className="pixel-btn grid h-9 w-9 shrink-0 place-items-center bg-primary text-primary-foreground"
          aria-label={running ? "Pause timer" : "Resume timer"}
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
      )}
      {variant === "sidebar" && timer.status !== "idle" && (
        <span className="sr-only">{Math.round(pct * 100)}% complete</span>
      )}
    </div>
  );
}
