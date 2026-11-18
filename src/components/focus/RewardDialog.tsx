import { useNavigate } from "@tanstack/react-router";

import { PixelIcon, Sprite } from "@/components/pixel/Sprite";
import { growthSprite, treeSprite } from "@/components/pixel/sprites";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { growthStage } from "@/lib/progress";
import { useAppStore } from "@/store/app-store";

export function RewardDialog() {
  const reward = useAppStore((s) => s.lastReward);
  const garden = useAppStore((s) => s.garden);
  const dismiss = useAppStore((s) => s.dismissReward);
  const navigate = useNavigate();

  const sprite = reward?.treeCompleted
    ? treeSprite(reward.treeCompleted)
    : growthSprite(growthStage(garden.growth), garden.currentTree);

  return (
    <Dialog open={!!reward} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-center text-gold">Session complete!</DialogTitle>
          <DialogDescription className="text-center">
            You focused for {reward?.minutes} minutes. Your forest grows.
          </DialogDescription>
        </DialogHeader>
        <div className="relative mx-auto my-2 grid place-items-center pixel-inset px-10 py-6">
          <span className="absolute left-4 top-3 animate-sparkle"><PixelIcon name="star" size={14} /></span>
          <span className="absolute right-5 top-8 animate-sparkle [animation-delay:500ms]"><PixelIcon name="star" size={12} /></span>
          <div className="animate-grow">
            <Sprite sprite={sprite} size={112} />
          </div>
        </div>
        {reward?.treeCompleted && (
          <p className="font-pixel text-[10px] uppercase leading-relaxed text-primary">A new {reward.treeCompleted} tree was planted!</p>
        )}
        {reward?.leveledUpTo && (
          <p className="font-pixel text-[10px] uppercase leading-relaxed text-gold animate-blink">Forest level up! LV {reward.leveledUpTo}</p>
        )}
        <div className="grid grid-cols-3 gap-2">
          <div className="pixel-inset p-2 animate-rise">
            <PixelIcon name="star" size={18} className="mx-auto" />
            <div className="mt-1 font-pixel text-xs text-gold">+{reward?.xp}</div>
            <div className="text-sm text-muted-foreground">XP</div>
          </div>
          <div className="pixel-inset p-2 animate-rise [animation-delay:120ms]">
            <PixelIcon name="acorn" size={18} className="mx-auto" />
            <div className="mt-1 font-pixel text-xs text-foreground">+{reward?.acorns}</div>
            <div className="text-sm text-muted-foreground">Acorns</div>
          </div>
          <div className="pixel-inset p-2 animate-rise [animation-delay:240ms]">
            <PixelIcon name="leaf" size={18} className="mx-auto" />
            <div className="mt-1 font-pixel text-xs text-primary">+{reward?.growth}</div>
            <div className="text-sm text-muted-foreground">Growth</div>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={dismiss}>Keep going</Button>
          <Button
            onClick={() => {
              dismiss();
              void navigate({ to: "/garden" });
            }}
          >
            Visit garden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
