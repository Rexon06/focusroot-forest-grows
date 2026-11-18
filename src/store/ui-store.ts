import { create } from "zustand";

interface UiState {
  reminderOpen: boolean;
  pendingMinutes: number | null;
  breathing: { open: boolean; reason: "distracted" | "reset" };
  openReminder(minutes: number | null): void;
  closeReminder(): void;
  openBreathing(reason: "distracted" | "reset"): void;
  closeBreathing(): void;
}

export const useUiStore = create<UiState>()((set) => ({
  reminderOpen: false,
  pendingMinutes: null,
  breathing: { open: false, reason: "distracted" },
  openReminder: (minutes) => set({ reminderOpen: true, pendingMinutes: minutes }),
  closeReminder: () => set({ reminderOpen: false, pendingMinutes: null }),
  openBreathing: (reason) => set({ breathing: { open: true, reason } }),
  closeBreathing: () => set((s) => ({ breathing: { ...s.breathing, open: false } })),
}));
