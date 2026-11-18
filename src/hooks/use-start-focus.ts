import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { getBlockingAdapter } from "@/lib/blocking";
import { useAppStore } from "@/store/app-store";
import { useUiStore } from "@/store/ui-store";
import { useSfx } from "./use-sfx";

/** Starts (or resumes viewing) a focus session, showing the distraction reminder first when enabled. */
export function useStartFocus() {
  const navigate = useNavigate();
  const sfx = useSfx();
  const openReminder = useUiStore((s) => s.openReminder);

  const beginNow = useCallback(
    (minutes?: number) => {
      const store = useAppStore.getState();
      store.startSession(minutes);
      void getBlockingAdapter().onSessionStart(store.distractions);
      sfx("start");
      void navigate({ to: "/focus" });
    },
    [navigate, sfx],
  );

  const requestStart = useCallback(
    (minutes?: number) => {
      const { timer, settings } = useAppStore.getState();
      if (timer.status === "running") {
        void navigate({ to: "/focus" });
        return;
      }
      if (timer.status === "paused") {
        beginNow();
        return;
      }
      if (settings.reminderBeforeSession) {
        openReminder(minutes ?? null);
        return;
      }
      beginNow(minutes);
    },
    [beginNow, navigate, openReminder],
  );

  return { requestStart, beginNow };
}
