import type { IconName } from "@/components/pixel/sprites";

export const NAV_ITEMS: { to: "/" | "/focus" | "/notes" | "/garden" | "/settings"; label: string; icon: IconName }[] = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/focus", label: "Focus", icon: "focus" },
  { to: "/notes", label: "Notes", icon: "notes" },
  { to: "/garden", label: "Garden", icon: "garden" },
  { to: "/settings", label: "Settings", icon: "settings" },
];
