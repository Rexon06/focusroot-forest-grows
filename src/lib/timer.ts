import type { TimerState } from "./types";

export const PRESET_MINUTES = [25, 45, 60] as const;
export const MIN_CUSTOM_MINUTES = 1;
export const MAX_CUSTOM_MINUTES = 180;

export function minutesToMs(min: number) {
  return Math.round(min * 60_000);
}

export function idleTimer(minutes: number, intention = ""): TimerState {
  const ms = minutesToMs(minutes);
  return { status: "idle", durationMs: ms, endsAt: null, remainingMs: ms, startedAt: null, intention };
}

/** Remaining ms is derived from wall-clock time, so it survives navigation, tab sleep and reloads. */
export function getRemainingMs(t: TimerState, now: number): number {
  if (t.status === "running" && t.endsAt != null) return Math.max(0, t.endsAt - now);
  return Math.max(0, t.remainingMs);
}

export function startTimer(t: TimerState, now: number): TimerState {
  if (t.status === "running") return t;
  const remaining = t.remainingMs > 0 ? t.remainingMs : t.durationMs;
  return {
    ...t,
    status: "running",
    endsAt: now + remaining,
    remainingMs: remaining,
    startedAt: t.startedAt ?? now,
  };
}

export function pauseTimer(t: TimerState, now: number): TimerState {
  if (t.status !== "running") return t;
  return { ...t, status: "paused", remainingMs: getRemainingMs(t, now), endsAt: null };
}

export function resetTimer(t: TimerState): TimerState {
  return { ...t, status: "idle", endsAt: null, remainingMs: t.durationMs, startedAt: null };
}

export function isComplete(t: TimerState, now: number) {
  return t.status === "running" && getRemainingMs(t, now) <= 0;
}

export function formatClock(ms: number) {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function clampCustomMinutes(n: number) {
  if (!Number.isFinite(n)) return 25;
  return Math.min(MAX_CUSTOM_MINUTES, Math.max(MIN_CUSTOM_MINUTES, Math.round(n)));
}
