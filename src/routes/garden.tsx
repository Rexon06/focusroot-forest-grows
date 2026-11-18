import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Lock, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Panel, PanelTitle, PixelProgress, StatTile } from "@/components/pixel/Panel";
import { PixelIcon, Sprite } from "@/components/pixel/Sprite";
import { DECOR_SPRITES, growthSprite, treeSprite } from "@/components/pixel/sprites";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { GROWTH_PER_TREE, TREE_UNLOCKS, growthStage, isTreeUnlocked, levelProgress } from "@/lib/progress";
import type { DecorType, GardenTile, TreeType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DECOR_SHOP, GARDEN_COLS, GARDEN_MIN_ROWS, useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/garden")({
  head: () => ({
    meta: [
      { title: "Your Garden · FocusRoot" },
      { name: "description", content: "Watch your pixel forest grow with every focus session. Unlock trees, flowers and forest friends." },
      { property: "og:title", content: "Your Garden · FocusRoot" },
      { property: "og:description", content: "Watch your pixel forest grow with every focus session. Unlock trees, flowers and forest friends." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GardenPage,
});

const STAGE_LABEL = { seed: "Seed", sprout: "Sprout", sapling: "Sapling", young: "Young tree", grown: "Grown tree" } as const;

function GardenPage() {
  const garden = useAppStore((s) => s.garden);
  const xp = useAppStore((s) => s.xp);
  const acorns = useAppStore((s) => s.acorns);
  const chooseNextTree = useAppStore((s) => s.chooseNextTree);
  const buyDecor = useAppStore((s) => s.buyDecor);
  const placeDecor = useAppStore((s) => s.placeDecor);
  const pickUpDecor = useAppStore((s) => s.pickUpDecor);
  const sfx = useSfx();
  const [placing, setPlacing] = useState<DecorType | null>(null);

  const lvl = levelProgress(xp);
  const stage = growthStage(garden.growth);
  const maxY = garden.tiles.reduce((m, t) => Math.max(m, t.y), -1);
  const rows = Math.max(GARDEN_MIN_ROWS, maxY + 2);
  const byPos = new Map(garden.tiles.map((t) => [`${t.x},${t.y}`, t]));
  const bag = (Object.entries(garden.inventory) as [DecorType, number][]).filter(([, n]) => n > 0);

  const onTile = (x: number, y: number, tile?: GardenTile) => {
    if (placing) {
      if (tile) {
        toast.error("That spot is taken — pick an empty tile.");
        sfx("error");
        return;
      }
      if (placeDecor(placing, x, y)) {
        sfx("click");
        if ((garden.inventory[placing] ?? 0) <= 1) setPlacing(null);
      }
      return;
    }
    if (!tile) return;
    if (tile.kind === "decor") {
      pickUpDecor(tile.id);
      sfx("click");
      toast(`Moved ${DECOR_SHOP.find((d) => d.type === tile.type)?.name ?? "item"} back to your bag`);
    } else {
      const name = TREE_UNLOCKS.find((t) => t.type === tile.type)?.name ?? "Tree";
      toast(`${name}`, { description: `Grown on ${format(tile.plantedAt, "d MMM yyyy")}` });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="font-pixel text-[9px] uppercase text-primary">Your forest</p>
        <h1 className="mt-2 text-base sm:text-xl">The Garden</h1>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<PixelIcon name="star" size={16} />} label="Forest LV" value={lvl.level} sub={`${lvl.into}/${lvl.needed} XP`} />
        <StatTile icon={<PixelIcon name="garden" size={16} className="text-primary" />} label="Trees grown" value={garden.treesGrown} />
        <StatTile icon={<PixelIcon name="acorn" size={16} />} label="Acorns" value={acorns} sub="Spend in the shop" />
        <StatTile icon={<PixelIcon name="leaf" size={16} />} label="Growth" value={`${garden.growth}/${GROWTH_PER_TREE}`} sub="1 per focus minute" />
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel className="flex flex-col items-center gap-4 text-center">
          <PanelTitle className="w-full">Growing now</PanelTitle>
          <div className="pixel-inset grid h-40 w-40 place-items-end justify-center bg-grass-dark pb-2">
            <div key={stage} className="animate-grow">
              <div className="animate-sway">
                <Sprite sprite={growthSprite(stage, garden.currentTree)} size={120} title={STAGE_LABEL[stage]} />
              </div>
            </div>
          </div>
          <p className="font-pixel text-[10px] uppercase">{STAGE_LABEL[stage]}</p>
          <PixelProgress value={garden.growth / GROWTH_PER_TREE} label="Tree growth" />
          <p className="text-muted-foreground">
            {GROWTH_PER_TREE - garden.growth} more focus minutes until this {garden.currentTree} joins your forest.
          </p>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelTitle
            action={
              placing && (
                <Button size="sm" variant="outline" onClick={() => setPlacing(null)}>
                  <X /> Cancel
                </Button>
              )
            }
          >
            {placing ? `Tap an empty tile to place` : "Forest"}
          </PanelTitle>
          <div
            className="pixel-inset grid gap-0 overflow-hidden p-0"
            style={{ gridTemplateColumns: `repeat(${GARDEN_COLS}, minmax(0, 1fr))` }}
            role="grid"
            aria-label="Garden tiles"
          >
            {Array.from({ length: rows * GARDEN_COLS }, (_, i) => {
              const x = i % GARDEN_COLS;
              const y = Math.floor(i / GARDEN_COLS);
              const tile = byPos.get(`${x},${y}`);
              const checker = (x + y) % 2 === 0;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onTile(x, y, tile)}
                  className={cn(
                    "relative grid aspect-square place-items-end justify-center",
                    checker ? "bg-grass" : "bg-grass-light",
                    placing && !tile && "hover:outline hover:outline-[3px] hover:-outline-offset-[3px] hover:outline-gold",
                    !tile && !placing && "cursor-default",
                  )}
                  aria-label={tile ? `${tile.type} at ${x + 1},${y + 1}` : `Empty tile ${x + 1},${y + 1}`}
                >
                  {tile && (
                    <Sprite
                      sprite={tile.kind === "tree" ? treeSprite(tile.type as TreeType) : DECOR_SPRITES[tile.type as DecorType]}
                      size={64}
                      className={cn("h-auto w-[92%] animate-grow", tile.kind === "tree" && "animate-sway")}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {garden.treesGrown === 0
              ? "Your forest is an open meadow. Complete focus sessions to plant your first tree."
              : "Tap a decoration to put it back in your bag. Tap a tree to see when it grew."}
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelTitle icon={<PixelIcon name="acorn" size={14} />}>Your bag</PanelTitle>
          {bag.length === 0 ? (
            <p className="text-muted-foreground">Empty. Buy decorations in the shop with acorns.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {bag.map(([type, n]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPlacing(placing === type ? null : type)}
                  className={cn("pixel-btn relative flex flex-col items-center gap-1 bg-panel-inset p-2", placing === type && "bg-gold")}
                  aria-pressed={placing === type}
                  aria-label={`Place ${type}`}
                >
                  <Sprite sprite={DECOR_SPRITES[type]} size={40} />
                  <span className={cn("font-pixel text-[8px]", placing === type ? "text-gold-foreground" : "text-foreground")}>x{n}</span>
                </button>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <PanelTitle icon={<PixelIcon name="star" size={14} />}>Shop</PanelTitle>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DECOR_SHOP.map((item) => {
              const locked = lvl.level < item.level;
              const affordable = acorns >= item.price;
              return (
                <li key={item.type} className="pixel-inset flex flex-col items-center gap-1.5 p-2 text-center">
                  <Sprite sprite={DECOR_SPRITES[item.type]} size={40} className={locked ? "opacity-40 grayscale" : undefined} />
                  <span className="text-sm leading-tight">{item.name}</span>
                  <Button
                    size="sm"
                    variant={affordable && !locked ? "gold" : "outline"}
                    disabled={locked || !affordable}
                    className="w-full px-1"
                    onClick={() => {
                      if (buyDecor(item.type)) {
                        sfx("click");
                        toast.success(`${item.name} added to your bag`);
                      }
                    }}
                  >
                    {locked ? (
                      <>
                        <Lock /> LV{item.level}
                      </>
                    ) : (
                      <>
                        <PixelIcon name="acorn" size={12} /> {item.price}
                      </>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel>
        <PanelTitle icon={<PixelIcon name="garden" size={14} />}>Tree species</PanelTitle>
        <p className="mb-3 text-muted-foreground">Choose what your next seed grows into. New species unlock as your forest levels up.</p>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {TREE_UNLOCKS.map((t) => {
            const unlocked = isTreeUnlocked(t.type, lvl.level);
            const selected = garden.currentTree === t.type;
            return (
              <li key={t.type}>
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => {
                    chooseNextTree(t.type);
                    sfx("click");
                  }}
                  className={cn(
                    "pixel-btn flex w-full flex-col items-center gap-1 p-2 disabled:cursor-not-allowed",
                    selected ? "bg-primary text-primary-foreground" : "bg-panel-inset text-foreground",
                  )}
                  aria-pressed={selected}
                >
                  <Sprite sprite={treeSprite(t.type)} size={44} className={!unlocked ? "opacity-30 grayscale" : undefined} />
                  <span className="text-sm leading-tight">{t.name}</span>
                  <span className="font-pixel text-[7px] uppercase">{unlocked ? (selected ? "Growing" : "Pick") : `LV ${t.level}`}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
