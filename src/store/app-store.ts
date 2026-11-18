import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useEffect, useState } from "react";

import { uid } from "@/lib/id";
import { generateFlashcards } from "@/lib/flashcards";
import {
  GROWTH_PER_TREE,
  acornsForSession,
  dayKey,
  levelFromXp,
  xpForSession,
} from "@/lib/progress";
import {
  clampCustomMinutes,
  idleTimer,
  isComplete,
  minutesToMs,
  pauseTimer,
  resetTimer,
  startTimer,
} from "@/lib/timer";
import type {
  Activity,
  DailyIntention,
  DecorType,
  Distraction,
  Flashcard,
  FlashcardStatus,
  FocusSession,
  GardenState,
  GardenTile,
  Note,
  Profile,
  QuizResult,
  Reward,
  Settings,
  TimerState,
  TreeType,
} from "@/lib/types";

export const GARDEN_COLS = 8;
export const GARDEN_MIN_ROWS = 6;

export const DECOR_SHOP: { type: DecorType; name: string; price: number; level: number }[] = [
  { type: "flower", name: "Poppy", price: 4, level: 1 },
  { type: "bluebell", name: "Bluebell", price: 4, level: 1 },
  { type: "rock", name: "Mossy Rock", price: 5, level: 1 },
  { type: "mushroom", name: "Toadstool", price: 6, level: 1 },
  { type: "bush", name: "Berry Bush", price: 8, level: 2 },
  { type: "lantern", name: "Firefly Lantern", price: 15, level: 3 },
  { type: "pond", name: "Lily Pond", price: 25, level: 4 },
  { type: "fox", name: "Forest Fox", price: 40, level: 5 },
];

const DEFAULT_SETTINGS: Settings = {
  dailyGoalMinutes: 60,
  defaultDurationMinutes: 25,
  soundEnabled: true,
  soundVolume: 0.6,
  notificationsEnabled: false,
  theme: "emerald",
  reduceMotion: false,
  reminderBeforeSession: true,
};

const DEFAULT_GARDEN: GardenState = {
  growth: 0,
  currentTree: "oak",
  tiles: [],
  inventory: { flower: 1 },
  treesGrown: 0,
};

interface Data {
  profile: Profile;
  settings: Settings;
  timer: TimerState;
  sessions: FocusSession[];
  xp: number;
  acorns: number;
  garden: GardenState;
  notes: Note[];
  flashcards: Flashcard[];
  quizResults: QuizResult[];
  distractions: Distraction[];
  intention: DailyIntention;
  activity: Activity[];
  lastReward: Reward | null;
  onboarded: boolean;
}

interface Actions {
  updateProfile(p: Partial<Profile>): void;
  updateSettings(s: Partial<Settings>): void;
  completeOnboarding(name: string): void;

  setTimerDuration(minutes: number): void;
  setTimerIntention(text: string): void;
  startSession(minutes?: number): void;
  pauseSession(): void;
  resumeSession(): void;
  resetSession(): void;
  /** Completes the running session if its end time has passed. Returns the reward. */
  checkCompletion(now?: number): Reward | null;
  dismissReward(): void;

  setIntention(text: string): void;

  chooseNextTree(t: TreeType): void;
  buyDecor(t: DecorType): boolean;
  placeDecor(t: DecorType, x: number, y: number): boolean;
  pickUpDecor(id: string): void;

  addNote(n: Pick<Note, "title" | "subject" | "content" | "source" | "fileName">): Note;
  updateNote(id: string, patch: Partial<Pick<Note, "title" | "subject" | "content">>): void;
  deleteNote(id: string): void;
  regenerateFlashcards(noteId: string): number;
  addFlashcard(noteId: string, front: string, back: string): void;
  updateFlashcard(id: string, patch: Partial<Pick<Flashcard, "front" | "back" | "status">>): void;
  setFlashcardStatus(id: string, status: FlashcardStatus): void;
  deleteFlashcard(id: string): void;
  recordQuiz(noteId: string, score: number, total: number): number;

  addDistraction(name: string, kind: Distraction["kind"]): void;
  removeDistraction(id: string): void;

  logActivity(type: Activity["type"], text: string): void;
  resetProgress(): void;
}

export type AppState = Data & Actions;

function initialData(): Data {
  return {
    profile: { name: "", avatar: "sprout" },
    settings: DEFAULT_SETTINGS,
    timer: idleTimer(DEFAULT_SETTINGS.defaultDurationMinutes),
    sessions: [],
    xp: 0,
    acorns: 0,
    garden: DEFAULT_GARDEN,
    notes: [],
    flashcards: [],
    quizResults: [],
    distractions: [],
    intention: { date: "", text: "" },
    activity: [],
    lastReward: null,
    onboarded: false,
  };
}

function gardenRows(tiles: GardenTile[]) {
  const maxY = tiles.reduce((m, t) => Math.max(m, t.y), -1);
  return Math.max(GARDEN_MIN_ROWS, maxY + 2);
}

function findFreeTile(tiles: GardenTile[]) {
  const rows = gardenRows(tiles);
  const used = new Set(tiles.map((t) => `${t.x},${t.y}`));
  const free: { x: number; y: number }[] = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < GARDEN_COLS; x++) if (!used.has(`${x},${y}`)) free.push({ x, y });
  if (free.length === 0) return { x: 0, y: rows };
  return free[Math.floor(Math.random() * free.length)];
}

function makeActivity(type: Activity["type"], text: string): Activity {
  return { id: uid(), type, text, at: Date.now() };
}

function autoFlashcards(noteId: string, content: string): Flashcard[] {
  return generateFlashcards(content).map((qa) => ({
    id: uid(),
    noteId,
    front: qa.front,
    back: qa.back,
    status: "new",
    auto: true,
  }));
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      updateSettings: (patch) =>
        set((s) => {
          const settings = { ...s.settings, ...patch };
          if (patch.defaultDurationMinutes !== undefined)
            settings.defaultDurationMinutes = clampCustomMinutes(patch.defaultDurationMinutes);
          if (patch.dailyGoalMinutes !== undefined)
            settings.dailyGoalMinutes = Math.min(720, Math.max(5, Math.round(patch.dailyGoalMinutes)));
          const timer =
            patch.defaultDurationMinutes !== undefined && s.timer.status === "idle"
              ? idleTimer(settings.defaultDurationMinutes, s.timer.intention)
              : s.timer;
          return { settings, timer };
        }),
      completeOnboarding: (name) =>
        set((s) => ({ onboarded: true, profile: { ...s.profile, name: name.trim().slice(0, 24) } })),

      setTimerDuration: (minutes) =>
        set((s) => {
          if (s.timer.status !== "idle") return s;
          return { timer: idleTimer(clampCustomMinutes(minutes), s.timer.intention) };
        }),
      setTimerIntention: (text) => set((s) => ({ timer: { ...s.timer, intention: text.slice(0, 120) } })),
      startSession: (minutes) =>
        set((s) => {
          if (s.timer.status === "running") return s;
          let t = s.timer;
          if (t.status === "idle" && minutes !== undefined && minutesToMs(minutes) !== t.durationMs) {
            t = idleTimer(clampCustomMinutes(minutes), t.intention);
          }
          if (t.status === "idle" && !t.intention && s.intention.date === dayKey(Date.now())) {
            t = { ...t, intention: s.intention.text };
          }
          return { timer: startTimer(t, Date.now()) };
        }),
      pauseSession: () => set((s) => ({ timer: pauseTimer(s.timer, Date.now()) })),
      resumeSession: () => set((s) => ({ timer: startTimer(s.timer, Date.now()) })),
      resetSession: () => set((s) => ({ timer: resetTimer(s.timer) })),

      checkCompletion: (now = Date.now()) => {
        const s = get();
        if (!isComplete(s.timer, now)) return null;
        const t = s.timer;
        const minutes = Math.round(t.durationMs / 60_000);
        const endedAt = t.endsAt ?? now;
        const xp = xpForSession(minutes);
        const acorns = acornsForSession(minutes);
        const prevLevel = levelFromXp(s.xp);
        const newXp = s.xp + xp;
        const newLevel = levelFromXp(newXp);

        let growth = s.garden.growth + minutes;
        let tiles = s.garden.tiles;
        let treesGrown = s.garden.treesGrown;
        let treeCompleted: TreeType | null = null;
        const newActivities: Activity[] = [
          makeActivity("session", `Focused ${minutes} min${t.intention ? ` · ${t.intention}` : ""}`),
        ];
        while (growth >= GROWTH_PER_TREE) {
          growth -= GROWTH_PER_TREE;
          const pos = findFreeTile(tiles);
          tiles = [
            ...tiles,
            { id: uid(), kind: "tree", type: s.garden.currentTree, x: pos.x, y: pos.y, plantedAt: endedAt },
          ];
          treesGrown++;
          treeCompleted = s.garden.currentTree;
          newActivities.unshift(makeActivity("tree", `A new ${s.garden.currentTree} tree joined your forest`));
        }

        const reward: Reward = {
          minutes,
          xp,
          acorns,
          growth: minutes,
          treeCompleted,
          leveledUpTo: newLevel > prevLevel ? newLevel : null,
          at: endedAt,
        };
        const session: FocusSession = {
          id: uid(),
          startedAt: t.startedAt ?? endedAt - t.durationMs,
          endedAt,
          minutes,
          intention: t.intention,
          xp,
        };
        set({
          timer: { ...idleTimer(minutes, t.intention) },
          sessions: [...s.sessions, session].slice(-2000),
          xp: newXp,
          acorns: s.acorns + acorns,
          garden: { ...s.garden, growth, tiles, treesGrown },
          activity: [...newActivities, ...s.activity].slice(0, 50),
          lastReward: reward,
        });
        return reward;
      },
      dismissReward: () => set({ lastReward: null }),

      setIntention: (text) => set({ intention: { date: dayKey(Date.now()), text: text.slice(0, 140) } }),

      chooseNextTree: (t) => set((s) => ({ garden: { ...s.garden, currentTree: t } })),
      buyDecor: (t) => {
        const s = get();
        const item = DECOR_SHOP.find((d) => d.type === t);
        if (!item || s.acorns < item.price || levelFromXp(s.xp) < item.level) return false;
        set({
          acorns: s.acorns - item.price,
          garden: { ...s.garden, inventory: { ...s.garden.inventory, [t]: (s.garden.inventory[t] ?? 0) + 1 } },
        });
        return true;
      },
      placeDecor: (t, x, y) => {
        const s = get();
        const count = s.garden.inventory[t] ?? 0;
        if (count <= 0 || s.garden.tiles.some((tile) => tile.x === x && tile.y === y)) return false;
        set({
          garden: {
            ...s.garden,
            inventory: { ...s.garden.inventory, [t]: count - 1 },
            tiles: [...s.garden.tiles, { id: uid(), kind: "decor", type: t, x, y, plantedAt: Date.now() }],
          },
        });
        return true;
      },
      pickUpDecor: (id) =>
        set((s) => {
          const tile = s.garden.tiles.find((t) => t.id === id);
          if (!tile || tile.kind !== "decor") return s;
          const type = tile.type as DecorType;
          return {
            garden: {
              ...s.garden,
              tiles: s.garden.tiles.filter((t) => t.id !== id),
              inventory: { ...s.garden.inventory, [type]: (s.garden.inventory[type] ?? 0) + 1 },
            },
          };
        }),

      addNote: (n) => {
        const now = Date.now();
        const note: Note = {
          id: uid(),
          title: n.title.trim() || "Untitled note",
          subject: n.subject.trim() || "General",
          content: n.content,
          source: n.source,
          fileName: n.fileName,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          notes: [note, ...s.notes],
          flashcards: [...s.flashcards, ...autoFlashcards(note.id, note.content)],
          activity: [makeActivity("note", `Added note “${note.title}”`), ...s.activity].slice(0, 50),
        }));
        return note;
      },
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  ...patch,
                  title: (patch.title ?? n.title).trim() || "Untitled note",
                  subject: (patch.subject ?? n.subject).trim() || "General",
                  updatedAt: Date.now(),
                }
              : n,
          ),
        })),
      deleteNote: (id) =>
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
          flashcards: s.flashcards.filter((f) => f.noteId !== id),
          quizResults: s.quizResults.filter((q) => q.noteId !== id),
        })),
      regenerateFlashcards: (noteId) => {
        const note = get().notes.find((n) => n.id === noteId);
        if (!note) return 0;
        const fresh = autoFlashcards(noteId, note.content);
        set((s) => {
          const old = s.flashcards.filter((f) => f.noteId === noteId && f.auto);
          const statusByFront = new Map(old.map((f) => [f.front, f.status]));
          return {
            flashcards: [
              ...s.flashcards.filter((f) => !(f.noteId === noteId && f.auto)),
              ...fresh.map((f) => ({ ...f, status: statusByFront.get(f.front) ?? "new" })),
            ],
          };
        });
        return fresh.length;
      },
      addFlashcard: (noteId, front, back) =>
        set((s) => ({
          flashcards: [
            ...s.flashcards,
            { id: uid(), noteId, front: front.trim(), back: back.trim(), status: "new", auto: false },
          ],
        })),
      updateFlashcard: (id, patch) =>
        set((s) => ({ flashcards: s.flashcards.map((f) => (f.id === id ? { ...f, ...patch, auto: false } : f)) })),
      setFlashcardStatus: (id, status) =>
        set((s) => ({ flashcards: s.flashcards.map((f) => (f.id === id ? { ...f, status } : f)) })),
      deleteFlashcard: (id) => set((s) => ({ flashcards: s.flashcards.filter((f) => f.id !== id) })),
      recordQuiz: (noteId, score, total) => {
        const xp = score * 2;
        const note = get().notes.find((n) => n.id === noteId);
        set((s) => ({
          quizResults: [...s.quizResults, { id: uid(), noteId, score, total, at: Date.now() }].slice(-500),
          xp: s.xp + xp,
          activity: [
            makeActivity("quiz", `Quiz on “${note?.title ?? "notes"}”: ${score}/${total}`),
            ...s.activity,
          ].slice(0, 50),
        }));
        return xp;
      },

      addDistraction: (name, kind) =>
        set((s) => {
          const clean = name.trim().slice(0, 60);
          if (!clean || s.distractions.some((d) => d.name.toLowerCase() === clean.toLowerCase())) return s;
          return {
            distractions: [
              ...s.distractions,
              { id: uid(), name: clean, kind, blockMode: "reminder", createdAt: Date.now() },
            ],
          };
        }),
      removeDistraction: (id) => set((s) => ({ distractions: s.distractions.filter((d) => d.id !== id) })),

      logActivity: (type, text) => set((s) => ({ activity: [makeActivity(type, text), ...s.activity].slice(0, 50) })),

      resetProgress: () =>
        set((s) => ({
          ...initialData(),
          onboarded: true,
          profile: s.profile,
          settings: s.settings,
          timer: idleTimer(s.settings.defaultDurationMinutes),
        })),
    }),
    {
      name: "focusroot-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        const { ...data } = s;
        return Object.fromEntries(Object.entries(data).filter(([, v]) => typeof v !== "function")) as Data;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Data>;
        return {
          ...current,
          ...p,
          settings: { ...current.settings, ...p.settings },
          profile: { ...current.profile, ...p.profile },
          garden: { ...current.garden, ...p.garden },
          timer: { ...current.timer, ...p.timer },
        };
      },
    },
  ),
);

/** True once saved data has been loaded from this device. */
export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    else void useAppStore.persist.rehydrate();
    return unsub;
  }, []);
  return hydrated;
}
