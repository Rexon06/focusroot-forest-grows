import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useSfx } from "@/hooks/use-sfx";
import { useNow } from "@/hooks/use-now";
import { getBlockingAdapter } from "@/lib/blocking";
import { sendNotification } from "@/lib/notify";
import { formatClock, getRemainingMs } from "@/lib/timer";
import { useAppStore } from "@/store/app-store";

/**
 * Lives in the root layout so the timer keeps working on every page.
 * The countdown is derived from an absolute end time, so it stays accurate
 * across navigation, background tabs and page reloads.
 */
export function TimerController() {
  const sfx = useSfx();

  useEffect(() => {
    const tick = () => {
      const reward = useAppStore.getState().checkCompletion();
      if (!reward) return;
      void getBlockingAdapter().onSessionEnd();
      sfx(reward.leveledUpTo ? "levelup" : "complete");
      const { notificationsEnabled } = useAppStore.getState().settings;
      const body = `+${reward.xp} XP · +${reward.acorns} acorns${reward.treeCompleted ? " · a new tree grew!" : ""}`;
      if (notificationsEnabled) sendNotification(`Focus complete: ${reward.minutes} min 🌳`, body);
      toast.success(`Session complete!`, { description: body });
    };
    tick();
    const id = window.setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [sfx]);

  return <TitleTicker />;
}

function TitleTicker() {
  const timer = useAppStore((s) => s.timer);
  const now = useNow(1000);
  const savedTitle = useRef<string | null>(null);

  useEffect(() => {
    if (timer.status === "idle") {
      if (savedTitle.current) {
        document.title = savedTitle.current;
        savedTitle.current = null;
      }
      return;
    }
    if (!savedTitle.current) savedTitle.current = document.title;
    const prefix = timer.status === "running" ? "⏳" : "⏸";
    document.title = `${prefix} ${formatClock(getRemainingMs(timer, now))} · FocusRoot`;
  }, [timer, now]);

  return null;
}
