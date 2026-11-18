import { createFileRoute } from "@tanstack/react-router";
import { Download, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader, Panel, PanelTitle } from "@/components/pixel/Panel";
import { Sprite } from "@/components/pixel/Sprite";
import { AVATAR_SPRITES } from "@/components/pixel/sprites";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { notificationPermission, requestNotificationPermission, sendNotification } from "@/lib/notify";
import { playSound } from "@/lib/sound";
import { PRESET_MINUTES } from "@/lib/timer";
import type { AvatarName, ThemeName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · FocusRoot" },
      { name: "description", content: "Set your daily focus goal, default session length, sounds, notifications, theme and profile." },
      { property: "og:title", content: "Settings · FocusRoot" },
      { property: "og:description", content: "Set your daily focus goal, default session length, sounds, notifications, theme and profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const THEMES: { id: ThemeName; name: string; swatch: string }[] = [
  { id: "emerald", name: "Emerald Forest", swatch: "bg-[oklch(0.27_0.055_157)]" },
  { id: "autumn", name: "Autumn Grove", swatch: "bg-[oklch(0.29_0.05_52)]" },
  { id: "midnight", name: "Midnight Pine", swatch: "bg-[oklch(0.25_0.05_225)]" },
];

const AVATARS: AvatarName[] = ["sprout", "mushroom", "fox", "owl"];

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b-2 border-dashed border-outline py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-foreground">{label}</p>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.settings);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const timerStatus = useAppStore((s) => s.timer.status);
  const [name, setName] = useState(profile.name);
  const [customDefault, setCustomDefault] = useState(String(settings.defaultDurationMinutes));
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => setPerm(notificationPermission()), []);

  const toggleNotifications = async (on: boolean) => {
    if (!on) {
      updateSettings({ notificationsEnabled: false });
      return;
    }
    const p = await requestNotificationPermission();
    setPerm(p);
    if (p === "granted") {
      updateSettings({ notificationsEnabled: true });
      sendNotification("FocusRoot", "Notifications are on. We'll ping you when a session ends.");
    } else {
      toast.error(p === "unsupported" ? "This browser doesn't support notifications." : "Notifications are blocked in your browser settings.");
    }
  };

  const exportData = () => {
    const raw = localStorage.getItem("focusroot-v1") ?? "{}";
    const blob = new Blob([raw], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `focusroot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Camp settings" title="Settings" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Profile</PanelTitle>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile({ name: name.trim().slice(0, 24) });
              toast.success("Profile saved");
            }}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={24} aria-label="Your name" />
            <Button type="submit" variant="secondary">Save</Button>
          </form>
          <p className="mb-2 mt-4 font-pixel text-[8px] uppercase text-gold">Avatar</p>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => updateProfile({ avatar: a })}
                className={cn("pixel-btn p-2", profile.avatar === a ? "bg-gold" : "bg-panel-inset")}
                aria-pressed={profile.avatar === a}
                aria-label={`${a} avatar`}
              >
                <Sprite sprite={AVATAR_SPRITES[a]} size={44} />
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Focus</PanelTitle>
          <Row label={`Daily goal: ${settings.dailyGoalMinutes} min`} hint="How much focus time you aim for each day">
            <div className="w-full sm:w-48">
              <Slider
                min={15}
                max={480}
                step={15}
                value={[settings.dailyGoalMinutes]}
                onValueChange={([v]) => updateSettings({ dailyGoalMinutes: v })}
                aria-label="Daily goal minutes"
              />
            </div>
          </Row>
          <Row label="Default session length" hint={timerStatus !== "idle" ? "Applies after the current session" : undefined}>
            <div className="flex flex-wrap gap-2">
              {PRESET_MINUTES.map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={settings.defaultDurationMinutes === m ? "default" : "outline"}
                  onClick={() => {
                    updateSettings({ defaultDurationMinutes: m });
                    setCustomDefault(String(m));
                  }}
                >
                  {m}
                </Button>
              ))}
              <Input
                type="number"
                min={1}
                max={180}
                value={customDefault}
                onChange={(e) => setCustomDefault(e.target.value)}
                onBlur={() => {
                  const n = Number(customDefault);
                  if (n > 0) updateSettings({ defaultDurationMinutes: n });
                }}
                className="h-9 w-20"
                aria-label="Custom default minutes"
              />
            </div>
          </Row>
          <Row label="Distraction reminder" hint="Show your list before each session">
            <Switch checked={settings.reminderBeforeSession} onCheckedChange={(v) => updateSettings({ reminderBeforeSession: v })} />
          </Row>
        </Panel>

        <Panel>
          <PanelTitle>Sound & notifications</PanelTitle>
          <Row label="Sound effects" hint="Retro chimes for starts, rewards and quizzes">
            <Switch checked={settings.soundEnabled} onCheckedChange={(v) => updateSettings({ soundEnabled: v })} />
          </Row>
          <Row label={`Volume: ${Math.round(settings.soundVolume * 100)}%`}>
            <div className="flex w-full items-center gap-3 sm:w-56">
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[settings.soundVolume]}
                onValueChange={([v]) => updateSettings({ soundVolume: v })}
                disabled={!settings.soundEnabled}
                aria-label="Volume"
              />
              <Button size="icon-sm" variant="outline" onClick={() => playSound("complete", settings.soundVolume)} disabled={!settings.soundEnabled} aria-label="Test sound">
                <Volume2 />
              </Button>
            </div>
          </Row>
          <Row
            label="Session-end notifications"
            hint={
              perm === "unsupported"
                ? "Not supported in this browser"
                : perm === "denied"
                  ? "Blocked — allow notifications in your browser settings"
                  : "Get a ping when a session finishes, even in another tab"
            }
          >
            <Switch
              checked={settings.notificationsEnabled && perm === "granted"}
              onCheckedChange={(v) => void toggleNotifications(v)}
              disabled={perm === "unsupported"}
            />
          </Row>
        </Panel>

        <Panel>
          <PanelTitle>Theme</PanelTitle>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => updateSettings({ theme: t.id })}
                className={cn("pixel-btn flex flex-col items-center gap-2 p-2", settings.theme === t.id ? "bg-gold text-gold-foreground" : "bg-panel-inset")}
                aria-pressed={settings.theme === t.id}
              >
                <span className={cn("h-8 w-full border-[3px] border-outline", t.swatch)} />
                <span className="text-sm leading-tight">{t.name}</span>
              </button>
            ))}
          </div>
          <Row label="Reduce motion" hint="Turn off swaying trees and bouncy animations">
            <Switch checked={settings.reduceMotion} onCheckedChange={(v) => updateSettings({ reduceMotion: v })} />
          </Row>
        </Panel>
      </div>

      <Panel>
        <PanelTitle>Your data</PanelTitle>
        <p className="mb-3 text-muted-foreground">Everything is saved on this device only. Clearing your browser data will erase it.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download /> Export backup
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reset progress</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes your focus history, XP, acorns, garden, notes, flashcards and distraction list. Your name
                  and settings stay. This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={buttonVariants({ variant: "destructive" })}
                  onClick={() => {
                    resetProgress();
                    toast.success("Progress reset. A fresh seed awaits.");
                  }}
                >
                  Yes, reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Panel>
    </div>
  );
}
