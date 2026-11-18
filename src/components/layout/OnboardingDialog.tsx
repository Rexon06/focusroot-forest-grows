import { useState } from "react";

import { Sprite } from "@/components/pixel/Sprite";
import { growthSprite } from "@/components/pixel/sprites";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";

export function OnboardingDialog() {
  const onboarded = useAppStore((s) => s.onboarded);
  const complete = useAppStore((s) => s.completeOnboarding);
  const [name, setName] = useState("");

  return (
    <Dialog open={!onboarded} onOpenChange={(o) => !o && complete(name)}>
      <DialogContent className="max-w-md text-center">
        <div className="mx-auto animate-bob">
          <Sprite sprite={growthSprite("seed", "oak")} size={88} />
        </div>
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to FocusRoot</DialogTitle>
          <DialogDescription className="text-center">
            Every focus session helps your seed grow into a forest. What should the forest call you?
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            complete(name);
          }}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={24} autoFocus />
          <Button type="submit" size="lg">Plant my seed</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
