import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pixel-panel p-4 sm:p-5", className)} {...props} />;
}

export function PanelTitle({ children, icon, action, className }: { children: ReactNode; icon?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="flex items-center gap-2 text-[10px] uppercase text-gold sm:text-[11px]">
        {icon}
        {children}
      </h2>
      {action}
    </div>
  );
}

export function PixelProgress({ value, className, tone = "primary", label }: { value: number; className?: string; tone?: "primary" | "gold" | "xp" | "sky"; label?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const toneClass = { primary: "bg-primary", gold: "bg-gold", xp: "bg-xp", sky: "bg-sky" }[tone];
  return (
    <div
      className={cn("pixel-inset h-5 w-full overflow-hidden p-0.5", className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <div className={cn("pixel-segments h-full transition-[width] duration-500", toneClass)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatTile({ icon, label, value, sub }: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="pixel-inset flex flex-col gap-1 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="font-pixel text-[8px] uppercase leading-relaxed">{label}</span>
      </div>
      <div className="font-pixel text-base text-foreground sm:text-lg">{value}</div>
      {sub && <div className="text-sm text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="font-pixel text-[9px] uppercase text-primary">{eyebrow}</p>}
        <h1 className="mt-2 text-base text-foreground sm:text-xl">{title}</h1>
      </div>
      {children}
    </header>
  );
}

export function EmptyState({ art, title, children, action }: { art?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="pixel-inset flex flex-col items-center gap-3 px-4 py-8 text-center">
      {art && <div className="animate-bob">{art}</div>}
      <p className="font-pixel text-[10px] uppercase leading-relaxed text-foreground">{title}</p>
      {children && <div className="max-w-sm text-muted-foreground">{children}</div>}
      {action}
    </div>
  );
}

export function Chip({ children, className, active, onClick }: { children: ReactNode; className?: string; active?: boolean; onClick?: () => void }) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "pixel-chip inline-flex items-center gap-1 px-2 py-1 font-pixel text-[8px] uppercase leading-none",
        active ? "bg-gold text-gold-foreground" : "bg-panel-inset text-muted-foreground",
        onClick && "cursor-pointer hover:text-foreground",
        className,
      )}
    >
      {children}
    </Comp>
  );
}
