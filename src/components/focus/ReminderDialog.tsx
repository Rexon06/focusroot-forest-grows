import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PixelIcon } from "@/components/pixel/Sprite";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStartFocus } from "@/hooks/use-start-focus";
import { dayKey } from "@/lib/progress";
import { formatClock, minutesToMs } from "@/lib/timer";
import { useAppStore } from "@/store/app-store";
import { useUiStore } from "@/store/ui-store";

export function ReminderDialog() {
  const open = useUiStore((s) => s.reminderOpen);
  const pending = useUiStore((s) => s.pendingMinutes);
  const close = useUiStore((s) => s.closeReminder);
  const distractions = useAppStore((s) => s.distractions);
  const timer = useAppStore((s) => s.timer);
  const daily = useAppStore((s) => s.intention);
  const setTimerIntention = useAppStore((s) => s.setTimerIntention);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const { beginNow } = useStartFocus();
  const [intention, setIntention] = useState("");
  const [skipNext, setSkipNext] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setIntention(timer.intention || (daily.date === dayKey(Date.now()) ? daily.text : ""));
      setChecked({});
      setSkipNext(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const minutes = pending ?? Math.round(timer.durationMs / 60_000);

  const begin = () => {
    setTimerIntention(intention.trim());
    if (skipNext) updateSettings({ reminderBeforeSession: false });
    close();
    beginNow(pending ?? undefined);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PixelIcon name="shield" size={16} className="text-gold" /> Before you begin
          </DialogTitle>
          <DialogDescription>A {formatClock(minutesToMs(minutes))} session. Clear the path first.</DialogDescription>
        </DialogHeader>

        <label className="flex flex-col gap-2">
          <span className="font-pixel text-[9px] uppercase text-gold">Focus intention</span>
          <Input
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="e.g. Finish chapter 3 summary"
            maxLength={120}
            autoFocus
          />
        </label>

        <div>
          <p className="mb-2 font-pixel text-[9px] uppercase text-gold">Put these away</p>
          {distractions.length === 0 ? (
            <p className="text-muted-foreground">
              No distractions listed yet.{" "}
              <Link to="/distractions" onClick={close} className="text-gold underline">
                Add some
              </Link>
              .
            </p>
          ) : (
            <ul className="flex max-h-40 flex-col gap-1.5 overflow-y-auto scrollbar-pixel">
              {distractions.map((d) => (
                <li key={d.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 pixel-inset px-3 py-2">
                    <Checkbox
                      checked={!!checked[d.id]}
                      onCheckedChange={(v) => setChecked((c) => ({ ...c, [d.id]: !!v }))}
                    />
                    <span className={checked[d.id] ? "text-muted-foreground line-through" : ""}>{d.name}</span>
                    <span className="ml-auto font-pixel text-[7px] uppercase text-muted-foreground">{d.kind}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            FocusRoot can't block other apps from a browser — this is your personal checklist.
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={skipNext} onCheckedChange={(v) => setSkipNext(!!v)} />
          Don't show this reminder again
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button onClick={begin}>Begin focus</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
