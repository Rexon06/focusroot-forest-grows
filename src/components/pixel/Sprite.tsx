import { memo } from "react";

import { cn } from "@/lib/utils";
import { ICONS, type IconName, type SpriteDef } from "./sprites";

interface SpriteProps {
  sprite: SpriteDef;
  /** Rendered width in CSS px; height keeps the sprite aspect ratio. */
  size?: number;
  className?: string;
  title?: string;
}

export const Sprite = memo(function Sprite({ sprite, size = 48, className, title }: SpriteProps) {
  const w = Math.max(...sprite.rows.map((r) => r.length));
  const h = sprite.rows.length;
  const rects: { x: number; y: number; w: number; fill: string }[] = [];
  sprite.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const fill = sprite.palette[ch];
      if (!fill) {
        x++;
        continue;
      }
      let run = 1;
      while (x + run < row.length && row[x + run] === ch) run++;
      rects.push({ x, y, w: run, fill });
      x += run;
    }
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      className={cn("pixelated shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      shapeRendering="crispEdges"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
});

export function PixelIcon({ name, size = 20, className, title }: { name: IconName; size?: number; className?: string; title?: string }) {
  return <Sprite sprite={ICONS[name]} size={size} className={className} title={title} />;
}
