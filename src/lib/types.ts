export type ThemeName = "emerald" | "autumn" | "midnight";
export type AvatarName = "sprout" | "mushroom" | "fox" | "owl";

export interface Profile {
  name: string;
  avatar: AvatarName;
}

export interface Settings {
  dailyGoalMinutes: number;
  defaultDurationMinutes: number;
  soundEnabled: boolean;
  soundVolume: number; // 0..1
  notificationsEnabled: boolean;
  theme: ThemeName;
  reduceMotion: boolean;
  reminderBeforeSession: boolean;
}

export type TimerStatus = "idle" | "running" | "paused";

export interface TimerState {
  status: TimerStatus;
  /** Planned length of the current session in ms. */
  durationMs: number;
  /** Absolute epoch ms when a running session ends. Null unless running. */
  endsAt: number | null;
  /** Remaining ms while idle or paused. */
  remainingMs: number;
  /** Epoch ms when the session was first started. */
  startedAt: number | null;
  intention: string;
}

export interface FocusSession {
  id: string;
  startedAt: number;
  endedAt: number;
  minutes: number;
  intention: string;
  xp: number;
}

export interface Reward {
  minutes: number;
  xp: number;
  acorns: number;
  growth: number;
  treeCompleted: TreeType | null;
  leveledUpTo: number | null;
  at: number;
}

export type TreeType = "oak" | "pine" | "birch" | "cherry" | "maple" | "spirit";
export type DecorType = "flower" | "bluebell" | "mushroom" | "rock" | "bush" | "lantern" | "pond" | "fox";

export interface GardenTile {
  id: string;
  kind: "tree" | "decor";
  type: TreeType | DecorType;
  x: number;
  y: number;
  plantedAt: number;
}

export interface GardenState {
  growth: number; // growth points toward the current tree
  currentTree: TreeType;
  tiles: GardenTile[];
  inventory: Partial<Record<DecorType, number>>;
  treesGrown: number;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  source: "manual" | "upload";
  fileName?: string | undefined;
  createdAt: number;
  updatedAt: number;
}

export type FlashcardStatus = "new" | "remembered" | "revision";

export interface Flashcard {
  id: string;
  noteId: string;
  front: string;
  back: string;
  status: FlashcardStatus;
  auto: boolean;
}

export interface QuizResult {
  id: string;
  noteId: string;
  score: number;
  total: number;
  at: number;
}

export interface Distraction {
  id: string;
  name: string;
  kind: "app" | "website";
  /** Reserved for a future native Android build. Web build only supports "reminder". */
  blockMode: "reminder" | "native";
  createdAt: number;
}

export interface Activity {
  id: string;
  type: "session" | "quiz" | "note" | "tree" | "flashcards";
  text: string;
  at: number;
}

export interface DailyIntention {
  date: string; // yyyy-mm-dd
  text: string;
}
