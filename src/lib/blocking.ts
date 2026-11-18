import type { Distraction } from "./types";

/**
 * Distraction blocking adapter.
 *
 * A browser cannot see or block other installed apps, so the web build ships a
 * "reminder" adapter that only shows the user their own list before a session.
 * A future native Android shell (e.g. Capacitor + UsageStats/Accessibility APIs,
 * with explicit consent) can provide a "native" adapter with the same shape.
 */
export interface BlockingAdapter {
  id: "web-reminder" | "native-android";
  canBlockApps: boolean;
  canBlockWebsites: boolean;
  onSessionStart(list: Distraction[]): Promise<void>;
  onSessionEnd(): Promise<void>;
}

export const webReminderAdapter: BlockingAdapter = {
  id: "web-reminder",
  canBlockApps: false,
  canBlockWebsites: false,
  async onSessionStart() {
    /* Reminder UI is shown by the app; nothing is blocked. */
  },
  async onSessionEnd() {},
};

declare global {
  interface Window {
    FocusRootNative?: BlockingAdapter;
  }
}

export function getBlockingAdapter(): BlockingAdapter {
  if (typeof window !== "undefined" && window.FocusRootNative) return window.FocusRootNative;
  return webReminderAdapter;
}
