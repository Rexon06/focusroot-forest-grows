import { useCallback } from "react";

import { playSound } from "@/lib/sound";
import { useAppStore } from "@/store/app-store";

export function useSfx() {
  return useCallback((kind: Parameters<typeof playSound>[0]) => {
    const { soundEnabled, soundVolume } = useAppStore.getState().settings;
    if (soundEnabled) playSound(kind, soundVolume);
  }, []);
}
