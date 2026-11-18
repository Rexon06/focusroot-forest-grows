import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Pause, Play, RotateCcw, Wind } from "lucide-react";
import { useState } from "react";

import { EmptyState, Panel, PanelTitle, PixelProgress, StatTile } from "@/components/pixel/Panel";
import { PixelIcon, Sprite } from "@/components/pixel/Sprite";
import { growthSprite } from "@/components/pixel/sprites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNow } from "@/hooks/use-now";
import { useSfx } from "@/hooks/use-sfx";
import { useStartFocus } from "@/hooks/use-start-focus";
import { dayKey, minutesOnDay, type GrowthStage } from "@/lib/progress";
import {
  MAX_CUSTOM_MINUTES,
  MIN_CUSTOM_MINUTES,
  PRESET_MINUTES,
  clampCustomMinutes,
  formatClock,
  getRemainingMs,
} from "@/lib/timer";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useUiStore } from "@/store/ui-store";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus Timer · FocusRoot" },
      { name: "description", content: "A pixel-art Pomodoro timer: 25, 45, 60 or custom minute focus sessions that grow your forest." },
      { property: "og:title", content: "Focus Timer · FocusRoot" },
      { property: "og:description", content: "A pixel-art Pomodoro timer: 25, 45, 60 or custom minute focus sessions that grow your forest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FocusPage,
});

function sessionStage(pct: number, status: string): GrowthStage {
  if (status === "idle") return "seed";
  if (pct >= 0.85) return "young";
  if (pct >= 0.5) return "sapling";
  if (pct >= 0.15) return "sprout";
  return "seed";
}

function FocusPage() {
  const timer = useAppStore((s) => s.timer);
  const sessions = useAppStore((s) => s.sessions);
  const currentTree = useAppStore((s) => s.garden.currentTree);
  const distractions = useAppStore((s) => s.distractions);
  const setDuration = useAppStore((s) => s.setTimerDuration);
  const setIntention = useAppStore((s) => s.setTimerIntention);
  const pause = useAppStore((s) => s.pauseSession);
  const resume = useAppStore((s) => s.resumeSession);
  const reset = useAppStore((s) => s.resetSession);
  const openBreathing = useUiStore((s) => s.openBreathing);
  const { requestStart } = useStartFocus();
  const sfx = useSfx();
  const now = useNow(250);

  const [custom, setCustom] = useState("");
  const remaining = getRemainingMs(timer, now);
  const pct = 1 - remaining / Math.max(1, timer.durationMs);
  const durationMin = Math.round(timer.durationMs / 60_000);
  const idle = timer.status === "idle";
  const running = timer.status === "running";
  const isPreset = (PRESET_MINUTES as readonly number[]).includes(durationMin);

  const today = dayKey(now);
  const todaySessions = sessions.filter((s) => dayKey(s.endedAt) === today).reverse();
  const todayMin = minutesOnDay(sessions, today);
  const totalMin = sessions.reduce((a, s) => a + s.minutes, 0);

  const onReset = () => {
    if (idle) return;
    if (pct > 0.02) openBreathing("reset");
    else {
      reset();
      sfx("pause");
    }
  };

  const applyCustom = () => {
    const n = clampCustomMinutes(Number(custom));
    setDuration(n);
    setCustom(String(n));
    sfx("click");
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="font-pixel text-[9px] uppercase text-primary">Focus mode</p>
        <h1 className="mt-2 text-base sm:text-xl">One thing at a time.</h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-5">
        <Panel className="flex flex-col items-center gap-5 py-7 lg:col-span-3">
          <span
            className={cn(
              "pixel-chip px-2.5 py-1.5 font-pixel text-[8px] uppercase",
              running ? "bg-primary text-primary-foreground" : timer.status === "paused" ? "bg-gold text-gold-foreground animate-blink" : "bg-panel-inset text-muted-foreground",
            )}
          >
            {running ? "Focusing" : timer.status === "paused" ? "Paused" : "Ready"}
          </span>

          <div className="pixel-inset grid h-44 w-44 place-items-end justify-center pb-3 sm:h-52 sm:w-52">
            <div key={sessionStage(pct, timer.status)} className={cn("animate-grow", running && "animate-sway")}>
              <Sprite sprite={growthSprite(sessionStage(pct, timer.status), currentTree)} size={128} title="Session tree" />
            </div>
          </div>

          <div
            className="font-pixel text-5xl tabular-nums text-foreground sm:text-6xl"
            role="timer"
            aria-live="off"
            aria-label={`${formatClock(remaining)} remaining`}
          >
            {formatClock(remaining)}
          </div>

          <PixelProgress value={pct} className="max-w-md" label="Session progress" />

          {idle ? (
            <label className="flex w-full max-w-md flex-col gap-2">
              <span className="font-pixel text-[8px] uppercase text-muted-foreground">Intention (optional)</span>
              <Input value={timer.intention} onChange={(e) => setIntention(e.target.value)} placeholder="What will you work on?" maxLength={120} />
            </label>
          ) : (
            timer.intention && <p className="max-w-md text-center text-lg text-muted-foreground">“{timer.intention}”</p>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {idle && (
              <Button size="lg" onClick={() => requestStart()}>
                <Play /> Start
              </Button>
            )}
            {running && (
              <Button
                size="lg"
                variant="gold"
                onClick={() => {
                  pause();
                  sfx("pause");
                }}
              >
                <Pause /> Pause
              </Button>
            )}
            {timer.status === "paused" && (
              <Button
                size="lg"
                onClick={() => {
                  resume();
                  sfx("start");
                }}
              >
                <Play /> Resume
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={onReset} disabled={idle}>
              <RotateCcw /> Reset
            </Button>
          </div>

          {!idle && (
            <Button variant="ghost" size="sm" onClick={() => openBreathing("distracted")}>
              <Wind /> Feeling distracted?
            </Button>
          )}
        </Panel>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <Panel>
            <PanelTitle icon={<PixelIcon name="clock" size={14} />}>Session length</PanelTitle>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_MINUTES.map((m) => (
                <Button
                  key={m}
                  variant={durationMin === m ? "default" : "outline"}
                  disabled={!idle}
                  onClick={() => {
                    setDuration(m);
                    sfx("click");
                  }}
                  aria-pressed={durationMin === m}
                >
                  {m} min
                </Button>
              ))}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                applyCustom();
              }}
            >
              <Input
                type="number"
                inputMode="numeric"
                min={MIN_CUSTOM_MINUTES}
                max={MAX_CUSTOM_MINUTES}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder={`Custom (${MIN_CUSTOM_MINUTES}-${MAX_CUSTOM_MINUTES})`}
                disabled={!idle}
                aria-label="Custom minutes"
              />
              <Button type="submit" variant={!isPreset ? "default" : "secondary"} disabled={!idle || !custom}>
                Set
              </Button>
            </form>
            <p className="mt-2 text-sm text-muted-foreground">
              {idle ? `Selected: ${durationMin} minutes.` : "Finish or reset the session to change its length."}
            </p>
          </Panel>

          <section className="grid grid-cols-2 gap-3">
            <StatTile icon={<PixelIcon name="clock" size={16} />} label="Today" value={`${todayMin}m`} />
            <StatTile icon={<PixelIcon name="leaf" size={16} />} label="All-time" value={`${Math.floor(totalMin / 60)}h ${totalMin % 60}m`} />
          </section>

          <Panel>
            <PanelTitle
              icon={<PixelIcon name="shield" size={14} />}
              action={
                <Link to="/distractions" className="font-pixel text-[8px] uppercase text-gold hover:underline">
                  Edit
                </Link>
              }
            >
              Distractions
            </PanelTitle>
            {distractions.length === 0 ? (
              <p className="text-muted-foreground">No distractions listed. Add the apps and sites that pull you away.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {distractions.map((d) => (
                  <span key={d.id} className="pixel-chip bg-panel-inset px-2 py-1 text-sm">{d.name}</span>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelTitle icon={<PixelIcon name="leaf" size={14} />}>Today's sessions</PanelTitle>
        {todaySessions.length === 0 ? (
          <EmptyState art={<Sprite sprite={growthSprite("sprout", currentTree)} size={48} />} title="No sessions yet today">
            Complete a session to earn XP, acorns and growth for your tree.
          </EmptyState>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {todaySessions.map((s) => (
              <li key={s.id} className="pixel-inset flex items-center gap-3 px-3 py-2">
                <PixelIcon name="clock" size={16} />
                <span className="font-pixel text-[10px]">{s.minutes}m</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{s.intention || "Focus session"}</span>
                <span className="text-sm text-muted-foreground">{format(s.endedAt, "HH:mm")}</span>
                <span className="font-pixel text-[8px] text-gold">+{s.xp}XP</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
