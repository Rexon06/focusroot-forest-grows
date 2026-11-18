import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { PixelIcon, Sprite } from "@/components/pixel/Sprite";
import { growthSprite } from "@/components/pixel/sprites";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { levelFromXp } from "@/lib/progress";
import { MiniTimer } from "./MiniTimer";
import { NAV_ITEMS } from "./nav-items";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="FocusRoot home">
      <Sprite sprite={growthSprite("sapling", "oak")} size={30} />
      <span className="font-pixel text-[11px] leading-none text-foreground">
        Focus<span className="text-primary">Root</span>
      </span>
    </Link>
  );
}

function SidebarStats() {
  const xp = useAppStore((s) => s.xp);
  const acorns = useAppStore((s) => s.acorns);
  return (
    <div className="flex items-center justify-between gap-2 font-pixel text-[9px]">
      <span className="flex items-center gap-1.5 text-gold">
        <PixelIcon name="star" size={14} /> LV {levelFromXp(xp)}
      </span>
      <span className="flex items-center gap-1.5 text-foreground">
        <PixelIcon name="acorn" size={14} /> {acorns}
      </span>
    </div>
  );
}

export function AppShell({ children, ready }: { children: ReactNode; ready: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-5 border-r-[3px] border-outline bg-panel-inset p-4 md:flex">
        <Logo />
        {ready && <SidebarStats />}
        <nav className="flex flex-col gap-2" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="pixel-chip flex items-center gap-3 bg-panel px-3 py-3 font-pixel text-[10px] uppercase text-muted-foreground hover:text-foreground"
              activeProps={{ className: "!bg-primary !text-primary-foreground" }}
            >
              <PixelIcon name={item.icon} size={18} />
              {item.label}
            </Link>
          ))}
          <Link
            to="/distractions"
            className="mt-2 flex items-center gap-3 px-3 py-2 font-pixel text-[9px] uppercase text-muted-foreground hover:text-foreground"
            activeProps={{ className: "!text-gold" }}
          >
            <PixelIcon name="shield" size={16} />
            Distractions
          </Link>
        </nav>
        <div className="mt-auto">{ready && <MiniTimer variant="sidebar" />}</div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-[3px] border-outline bg-panel-inset px-4 py-3 md:hidden">
        <Logo />
        {ready && (
          <div className="w-32">
            <SidebarStats />
          </div>
        )}
      </header>

      <main className="min-w-0 flex-1 px-4 pb-32 pt-5 sm:px-6 md:pb-12 md:pt-8 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>

      {/* Mobile floating timer */}
      {ready && pathname !== "/focus" && (
        <div className="fixed inset-x-3 bottom-[84px] z-30 md:hidden">
          <MiniTimer variant="floating" />
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t-[3px] border-outline bg-panel-inset pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Main"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className={cn("flex flex-col items-center gap-1.5 py-2.5 font-pixel text-[7px] uppercase text-muted-foreground")}
            activeProps={{ className: "!text-primary bg-panel" }}
          >
            <PixelIcon name={item.icon} size={20} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function LoadingForest() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status">
      <div className="animate-bob">
        <Sprite sprite={growthSprite("sprout", "oak")} size={64} />
      </div>
      <p className="font-pixel text-[10px] uppercase text-muted-foreground animate-blink">Loading your forest…</p>
    </div>
  );
}
