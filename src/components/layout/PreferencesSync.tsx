import { useEffect } from "react";

import { useAppStore } from "@/store/app-store";

/** Applies theme and motion preferences to the document. */
export function PreferencesSync() {
  const theme = useAppStore((s) => s.settings.theme);
  const reduceMotion = useAppStore((s) => s.settings.reduceMotion);
  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
    document.documentElement.dataset["reduceMotion"] = String(reduceMotion);
  }, [theme, reduceMotion]);
  return null;
}
