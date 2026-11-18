import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, Panel, PanelTitle, PixelProgress, StatTile } from "@/components/pixel/Panel";
import { PixelIcon, Sprite } from "@/components/pixel/Sprite";
import { growthSprite } from "@/components/pixel/sprites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNow } from "@/hooks/use-now";
import { useStartFocus } from "@/hooks/use-start-focus";
import {
  GROWTH_PER_TREE,
  currentStreak,
  dailyMessage,
  dayKey,
  greeting,
  growthStage,
  levelProgress,
  minutesOnDay,
} from "@/lib/progress";
import { formatClock, getRemainingMs } from "@/lib/timer";
import { useAppStore } from "@/store/app-store";
import banner from "@/assets/forest-banner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · FocusRoot" },
      { name: "description", content: "Your FocusRoot dashboard: today's focus time, streak, forest level and quick start." },
      { property: "og:title", content: "Home · FocusRoot" },
      { property: "og:description", content: "Your FocusRoot dashboard: today's focus time, streak, forest level and quick start." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const ACTIVITY_ICON = { session: "clock", quiz: "star", note: "notes", tree: "garden", flashcards: "leaf" } as const;

function HomePage() {
  const now = useNow(30_000);
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.settings);
  const sessions = useAppStore((s) => s.sessions);
  const xp = useAppStore((s) => s.xp);
  const garden = useAppStore((s) => s.garden);
  const activity = useAppStore((s) => s.activity);
  const timer = useAppStore((s) => s.timer);
  const intention = useAppStore((s) => s.intention);
  const setIntention = useAppStore((s) => s.setIntention);
  const { requestStart } = useStartFocus();

  const today = dayKey(now);
  const todayMinutes = minutesOnDay(sessions, today);
  const todaySessions = sessions.filter((s) => dayKey(s.endedAt) === today).length;
  const streak = currentStreak(sessions, now);
  const lvl = levelProgress(xp);
  const stage = growthStage(garden.growth);
  const goalPct = todayMinutes / settings.dailyGoalMinutes;
  const todaysIntention = intention.date === today ? intention.text : "";
  const [draft, setDraft] = useState(todaysIntention);

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <section className="pixel-panel relative overflow-hidden">
        <img src={banner} alt="" className="pixelated absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-panel-inset via-panel-inset/80 to-transparent" />
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="max-w-md">
            <p className="font-pixel text-[9px] uppercase text-primary">{format(now, "EEEE, d MMMM yyyy")}</p>
            <h1 className="mt-3 text-base leading-relaxed text-foreground sm:text-xl">
              {greeting(now)}
              {profile.name ? `, ${profile.name}` : ""}!
            </h1>
            <p className="mt-3 text-lg text-foreground/90">“{dailyMessage(now)}”</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {timer.status === "idle" ? (
                <Button size="lg" onClick={() => requestStart(settings.defaultDurationMinutes)}>
                  <Play /> Start {settings.defaultDurationMinutes} min focus
                </Button>
              ) : (
                <Button size="lg" variant="gold" onClick={() => requestStart()}>
                  <Play /> {timer.status === "running" ? "Return to session" : "Resume"} ·{" "}
                  {formatClock(getRemainingMs(timer, Date.now()))}
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 self-center sm:self-end">
            <div className="animate-sway">
              <Sprite sprite={growthSprite(stage, garden.currentTree)} size={120} title={`Your ${stage}`} />
            </div>
            <span className="font-pixel text-[8px] uppercase text-muted-foreground">
              {garden.growth}/{GROWTH_PER_TREE} growth
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Today's stats">
        <StatTile icon={<PixelIcon name="clock" size={16} />} label="Focus today" value={`${todayMinutes}m`} sub={`Goal ${settings.dailyGoalMinutes}m`} />
        <StatTile icon={<PixelIcon name="leaf" size={16} />} label="Sessions" value={todaySessions} sub={`${sessions.length} all-time`} />
        <StatTile icon={<PixelIcon name="flame" size={16} />} label="Streak" value={`${streak}d`} sub={streak ? "Keep it alive!" : "Start one today"} />
        <StatTile icon={<PixelIcon name="star" size={16} />} label="Forest LV" value={lvl.level} sub={`${garden.treesGrown} trees grown`} />
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-5 lg:col-span-3">
          <Panel>
            <PanelTitle icon={<PixelIcon name="clock" size={14} />}>Daily focus goal</PanelTitle>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-pixel text-sm text-foreground">
                {todayMinutes} / {settings.dailyGoalMinutes} min
              </span>
              <span className="font-pixel text-[9px] text-primary">{Math.min(100, Math.round(goalPct * 100))}%</span>
            </div>
            <PixelProgress value={goalPct} label="Daily goal progress" />
            <p className="mt-3 text-muted-foreground">
              {goalPct >= 1
                ? "Goal reached! The forest is glowing today."
                : `${settings.dailyGoalMinutes - todayMinutes} minutes to go. About ${Math.ceil((settings.dailyGoalMinutes - todayMinutes) / settings.defaultDurationMinutes)} more session(s).`}
            </p>
          </Panel>

          <Panel>
            <PanelTitle icon={<PixelIcon name="star" size={14} />}>Forest level {lvl.level}</PanelTitle>
            <PixelProgress value={lvl.pct} tone="xp" label="Experience to next level" />
            <p className="mt-2 text-muted-foreground">
              {lvl.into} / {lvl.needed} XP to level {lvl.level + 1}
            </p>
          </Panel>

          <Panel>
            <PanelTitle icon={<PixelIcon name="leaf" size={14} />}>Recent activity</PanelTitle>
            {activity.length === 0 ? (
              <EmptyState art={<Sprite sprite={growthSprite("seed", "oak")} size={56} />} title="Nothing yet">
                Finish a focus session or add some notes and your journey will appear here.
              </EmptyState>
            ) : (
              <ul className="flex flex-col gap-2">
                {activity.slice(0, 6).map((a) => (
                  <li key={a.id} className="pixel-inset flex items-center gap-3 px-3 py-2">
                    <PixelIcon name={ACTIVITY_ICON[a.type]} size={16} className="text-primary" />
                    <span className="min-w-0 flex-1 truncate">{a.text}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">{format(a.at, "d MMM, HH:mm")}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <Panel>
            <PanelTitle icon={<PixelIcon name="shield" size={14} />}>Today's intention</PanelTitle>
            {todaysIntention && <p className="mb-3 pixel-inset px-3 py-2 text-lg text-foreground">“{todaysIntention}”</p>}
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setIntention(draft.trim());
                toast.success("Intention saved");
              }}
            >
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="What deserves your attention today?" maxLength={140} />
              <Button type="submit" variant="secondary" disabled={!draft.trim()}>
                {todaysIntention ? "Update intention" : "Set intention"}
              </Button>
            </form>
          </Panel>

          <Panel>
            <PanelTitle icon={<PixelIcon name="notes" size={14} />}>Study corner</PanelTitle>
            <p className="mb-3 text-muted-foreground">Turn notes into collectible study cards, flashcards and quizzes.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/notes">Open notes</Link>
            </Button>
          </Panel>

          <Panel>
            <PanelTitle icon={<PixelIcon name="shield" size={14} />}>Distractions</PanelTitle>
            <p className="mb-3 text-muted-foreground">List what pulls you away, and get a gentle reminder before each session.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/distractions">Manage list</Link>
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
