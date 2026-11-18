import { createFileRoute } from "@tanstack/react-router";
import { Globe, Plus, Smartphone, Trash2, Wind } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel, PanelTitle } from "@/components/pixel/Panel";
import { PixelIcon, Sprite } from "@/components/pixel/Sprite";
import { DECOR_SPRITES } from "@/components/pixel/sprites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getBlockingAdapter } from "@/lib/blocking";
import { dayKey } from "@/lib/progress";
import type { Distraction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useUiStore } from "@/store/ui-store";

export const Route = createFileRoute("/distractions")({
  head: () => ({
    meta: [
      { title: "Distractions · FocusRoot" },
      { name: "description", content: "List the apps and websites that distract you, set focus intentions and take calming breathing breaks." },
      { property: "og:title", content: "Distractions · FocusRoot" },
      { property: "og:description", content: "List the apps and websites that distract you, set focus intentions and take calming breathing breaks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DistractionsPage,
});

const SUGGESTIONS: { name: string; kind: Distraction["kind"] }[] = [
  { name: "Instagram", kind: "app" },
  { name: "YouTube", kind: "website" },
  { name: "TikTok", kind: "app" },
  { name: "WhatsApp", kind: "app" },
  { name: "Reddit", kind: "website" },
  { name: "X / Twitter", kind: "website" },
];

function DistractionsPage() {
  const distractions = useAppStore((s) => s.distractions);
  const add = useAppStore((s) => s.addDistraction);
  const remove = useAppStore((s) => s.removeDistraction);
  const reminder = useAppStore((s) => s.settings.reminderBeforeSession);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const intention = useAppStore((s) => s.intention);
  const setIntention = useAppStore((s) => s.setIntention);
  const openBreathing = useUiStore((s) => s.openBreathing);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Distraction["kind"]>("app");
  const today = dayKey(Date.now());
  const [intent, setIntent] = useState(intention.date === today ? intention.text : "");
  const adapter = getBlockingAdapter();

  const submit = () => {
    if (!name.trim()) return;
    if (distractions.some((d) => d.name.toLowerCase() === name.trim().toLowerCase())) {
      toast.error("Already on your list");
      return;
    }
    add(name, kind);
    setName("");
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Guard your attention" title="Distractions" />

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-5 lg:col-span-3">
          <Panel>
            <PanelTitle icon={<PixelIcon name="shield" size={14} />}>Your distraction list</PanelTitle>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="App or website name" maxLength={60} aria-label="Distraction name" />
              <div className="flex gap-2">
                <Button type="button" variant={kind === "app" ? "default" : "outline"} size="icon" onClick={() => setKind("app")} aria-label="App" aria-pressed={kind === "app"}>
                  <Smartphone />
                </Button>
                <Button type="button" variant={kind === "website" ? "default" : "outline"} size="icon" onClick={() => setKind("website")} aria-label="Website" aria-pressed={kind === "website"}>
                  <Globe />
                </Button>
                <Button type="submit" disabled={!name.trim()}>
                  <Plus /> Add
                </Button>
              </div>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.filter((s) => !distractions.some((d) => d.name === s.name)).map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => add(s.name, s.kind)}
                  className="pixel-chip bg-panel-inset px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  + {s.name}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {distractions.length === 0 ? (
                <EmptyState art={<Sprite sprite={DECOR_SPRITES.fox} size={52} />} title="List is empty">
                  Add the apps and sites that tend to pull you away. You'll see them before each focus session.
                </EmptyState>
              ) : (
                <ul className="flex flex-col gap-2">
                  {distractions.map((d) => (
                    <li key={d.id} className="pixel-inset flex items-center gap-3 px-3 py-2">
                      {d.kind === "app" ? <Smartphone className="size-4 text-gold" /> : <Globe className="size-4 text-sky" />}
                      <span className="flex-1">{d.name}</span>
                      <span className="font-pixel text-[7px] uppercase text-muted-foreground">Reminder only</span>
                      <Button size="icon-sm" variant="destructive" onClick={() => remove(d.id)} aria-label={`Remove ${d.name}`}>
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelTitle icon={<PixelIcon name="leaf" size={14} />}>Focus intention</PanelTitle>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                setIntention(intent.trim());
                toast.success("Intention saved for today");
              }}
            >
              <Input value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="Today I will focus on…" maxLength={140} />
              <Button type="submit" variant="secondary" disabled={!intent.trim()}>Save</Button>
            </form>
            <p className="mt-2 text-sm text-muted-foreground">Your intention is shown when you start a session and during breathing breaks.</p>
          </Panel>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <Panel>
            <PanelTitle>Session reminder</PanelTitle>
            <label className="flex items-center justify-between gap-3">
              <span>Show my list before each focus session</span>
              <Switch checked={reminder} onCheckedChange={(v) => updateSettings({ reminderBeforeSession: v })} />
            </label>
          </Panel>

          <Panel>
            <PanelTitle>Breathing break</PanelTitle>
            <p className="mb-3 text-muted-foreground">A calm 10-second pause to reset when you feel the pull.</p>
            <Button variant="secondary" className="w-full" onClick={() => openBreathing("distracted")}>
              <Wind /> Breathe now
            </Button>
          </Panel>

          <Panel className="border-dashed">
            <PanelTitle>App blocking</PanelTitle>
            <p className="text-muted-foreground">
              A website can't see or block other apps on your phone, so FocusRoot doesn't pretend to. Your list works as a
              personal reminder.
            </p>
            <div className={cn("mt-3 flex items-center justify-between gap-3 pixel-inset px-3 py-2 opacity-70")}>
              <span className="text-sm">Block apps automatically</span>
              <span className="font-pixel text-[7px] uppercase text-gold">
                {adapter.canBlockApps ? "Available" : "Android app · future"}
              </span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
