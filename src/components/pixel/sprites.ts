import type { AvatarName, DecorType, TreeType } from "@/lib/types";
import type { GrowthStage } from "@/lib/progress";

export interface SpriteDef {
  rows: string[];
  palette: Record<string, string>;
}

const v = (name: string) => `var(--px-${name})`;
const OUT = { O: v("black") };

const ROUND_TREE = [
  "................",
  ".....OOOOOO.....",
  "...OOHHHLLLOO...",
  "..OHHHLLLLLLDO..",
  ".OHHLLLLLLLLLDO.",
  ".OHLLLLLHLLLLDO.",
  "OLLLLLLLLLLLLLDO",
  "OLLHLLLLLLLLLDDO",
  "OLLLLLLLLLLLDDDO",
  ".OLLLLLLLLLDDDO.",
  ".ODLLLLLLLDDDDO.",
  "..OODDDDDDDDOO..",
  "......OTtO......",
  "......OTtO......",
  "......OTtO......",
  ".....OTTttO.....",
];

const PINE_TREE = [
  ".......OO.......",
  "......OppO......",
  ".....OpPPqO.....",
  "....OpPPPPqO....",
  ".....OOPPOO.....",
  "....OpPPPPqqO...",
  "...OpPPPPPPqqO..",
  "....OOPPPPqOO...",
  "...OpPPPPPPqqO..",
  "..OpPPPPPPPPqqO.",
  ".OpPPPPPPPPPPqqO",
  "..OOOOOOOOOOOO..",
  "......OTtO......",
  "......OTtO......",
  "......OTtO......",
  ".....OTTttO.....",
];

const YOUNG_TREE = [
  "................",
  "................",
  "................",
  "................",
  "......OOOO......",
  ".....OHLLLO.....",
  "....OHLLLLDO....",
  "....OLLLLLDO....",
  "....OLLLLDDO....",
  ".....OLDDDO.....",
  "......OOOO......",
  ".......OTO......",
  ".......OTO......",
  ".......OTO......",
  "......OTTtO.....",
  "................",
];

const SAPLING = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "......OO.OO.....",
  ".....OLLOLLO....",
  "......OLOLO.....",
  ".......OTO......",
  ".......OTO......",
  ".......OTO......",
  "......OTTtO.....",
  "................",
];

const SPROUT = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "......OO.OO.....",
  ".....OLLOLLO....",
  "......OOTOO.....",
  ".......OTO......",
  "....OSSSSSSO....",
  "....OOOOOOOO....",
];

const SEED = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  ".......OO.......",
  "......OBBO......",
  "....OSSSSSSO....",
  "....OOOOOOOO....",
];

const TREE_PALETTES: Record<TreeType, Record<string, string>> = {
  oak: { L: v("leaf"), H: v("leaf-light"), D: v("leaf-dark"), T: v("trunk"), t: v("trunk-dark") },
  pine: { P: v("pine"), p: v("pine-light"), q: v("pine-dark"), T: v("trunk"), t: v("trunk-dark") },
  birch: { L: v("leaf-light"), H: v("yellow"), D: v("leaf"), T: v("birch"), t: v("birch-dark") },
  cherry: { L: v("pink"), H: v("pink-light"), D: v("pink-dark"), T: v("trunk"), t: v("trunk-dark") },
  maple: { L: v("orange"), H: v("orange-light"), D: v("orange-dark"), T: v("trunk-dark"), t: v("soil-dark") },
  spirit: { L: v("teal"), H: v("teal-light"), D: v("teal-dark"), T: v("birch"), t: v("stone") },
};

export function treeSprite(type: TreeType): SpriteDef {
  return {
    rows: type === "pine" ? PINE_TREE : ROUND_TREE,
    palette: { ...OUT, ...TREE_PALETTES[type] },
  };
}

export function growthSprite(stage: GrowthStage, type: TreeType): SpriteDef {
  const base = TREE_PALETTES[type];
  const leafy = type === "pine"
    ? { L: v("pine"), H: v("pine-light"), D: v("pine-dark"), T: v("trunk"), t: v("trunk-dark") }
    : base;
  const pal = { ...OUT, ...leafy, S: v("soil"), B: v("trunk") };
  switch (stage) {
    case "seed":
      return { rows: SEED, palette: pal };
    case "sprout":
      return { rows: SPROUT, palette: { ...pal, L: v("leaf-light"), T: v("leaf") } };
    case "sapling":
      return { rows: SAPLING, palette: pal };
    case "young":
      return { rows: YOUNG_TREE, palette: pal };
    default:
      return treeSprite(type);
  }
}

const FLOWER = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "......OOO.......",
  ".....ORRRO......",
  "....ORRYRRO.....",
  ".....ORRRO......",
  "......OGO.......",
  "...OO.OGO.......",
  "...OGOOGO.......",
  "....OGGGO.......",
  "......OGO.......",
  "......OGO.......",
];

const MUSHROOM = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  ".....OOOOOO.....",
  "...OORRWRRROO...",
  "..ORRRRRRWRRRO..",
  ".ORWRRRRRRRRWRO.",
  ".ORRRRRWRRRRRRO.",
  ".OOOOOOOOOOOOOO.",
  ".....OCCCCO.....",
  ".....OCCCCO.....",
  "....OOOOOOOO....",
];

const ROCK = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "......OOOO......",
  "....OOSSSSOO....",
  "...OSSMSSSsSO...",
  "..OSMMSSSSssSO..",
  "..OSSSSSSsssSO..",
  "...OOOOOOOOOO...",
];

const BUSH = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  ".....OOOOOO.....",
  "...OOLLHLLLOO...",
  "..OLLRLLLLRLLO..",
  ".OLLLLLLRLLLLDO.",
  ".OLRLLLLLLLLDDO.",
  ".OLLLLLRLLLDDDO.",
  "..ODDDDDDDDDDO..",
  "...OOOOOOOOOO...",
];

const LANTERN = [
  "................",
  "................",
  ".......OO.......",
  "......OTTO......",
  ".....OOOOOO.....",
  ".....OYGGYO.....",
  ".....OGGGYO.....",
  ".....OYGGYO.....",
  ".....OOOOOO.....",
  ".......OTO......",
  ".......OTO......",
  ".......OTO......",
  ".......OTO......",
  ".......OTO......",
  "......OTTtO.....",
  ".....OOOOOOO....",
];

const POND = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "....OOOOOOOO....",
  "..OOWWwWWWWWOO..",
  ".OWWWWWLLWWwWWO.",
  ".OWwWWWLLWWWWWO.",
  "..OOWWWWWWwWOO..",
  "....OOOOOOOO....",
];

const FOX = [
  "................",
  "................",
  "................",
  "................",
  "...OO....OO.....",
  "...OFO..OFO.....",
  "...OFFOOFFO.....",
  "...OFFFFFFO.....",
  "...OFKFFKFO.....",
  "...OCFFFFCO.....",
  "....OCCKCO......",
  "...OFFCCFFO..OO.",
  "...OFFCCFFO.OFFO",
  "...OFFCCFFOOFCO.",
  "...OFFFFFFFFO...",
  "...OOOOOOOOO....",
];

const OWL = [
  "................",
  "................",
  "...OO......OO...",
  "...OBOOOOOOBO...",
  "...OBBBBBBBBO...",
  "..OBWWBBBBWWBO..",
  "..OBWKBBBBKWBO..",
  "..OBWWBYYBWWBO..",
  "..OBBBBYYBBBBO..",
  "..OBCCCCCCCCBO..",
  "..OBCBCCBCCCBO..",
  "..OBCCCBCCBCBO..",
  "...OBCCCCCCBO...",
  "....OBBBBBBO....",
  "....OYO..OYO....",
  "................",
];

export const DECOR_SPRITES: Record<DecorType, SpriteDef> = {
  flower: { rows: FLOWER, palette: { ...OUT, R: v("red"), Y: v("yellow"), G: v("leaf") } },
  bluebell: { rows: FLOWER, palette: { ...OUT, R: v("blue"), Y: v("cream"), G: v("leaf") } },
  mushroom: { rows: MUSHROOM, palette: { ...OUT, R: v("red"), W: v("cream"), C: v("cream") } },
  rock: { rows: ROCK, palette: { ...OUT, S: v("stone"), s: v("stone-dark"), M: v("leaf") } },
  bush: { rows: BUSH, palette: { ...OUT, L: v("leaf"), H: v("leaf-light"), D: v("leaf-dark"), R: v("red") } },
  lantern: { rows: LANTERN, palette: { ...OUT, T: v("trunk"), t: v("trunk-dark"), Y: v("gold"), G: v("glow") } },
  pond: { rows: POND, palette: { ...OUT, W: v("water"), w: v("water-light"), L: v("leaf-light") } },
  fox: { rows: FOX, palette: { ...OUT, F: v("fox"), C: v("cream"), K: v("black") } },
};

export const AVATAR_SPRITES: Record<AvatarName, SpriteDef> = {
  sprout: growthSprite("sapling", "oak"),
  mushroom: DECOR_SPRITES.mushroom,
  fox: DECOR_SPRITES.fox,
  owl: { rows: OWL, palette: { ...OUT, B: v("trunk"), W: v("cream"), K: v("black"), Y: v("gold"), C: v("birch") } },
};

/* ---- Icons ---- */
const CUR = { X: "currentColor" };

export const ICONS = {
  home: {
    rows: [
      ".....XX.....",
      "....XXXX....",
      "...XXXXXX...",
      "..XXXXXXXX..",
      ".XXXXXXXXXX.",
      "XXXXXXXXXXXX",
      "..XXXXXXXX..",
      "..XXX..XXX..",
      "..XXX..XXX..",
      "..XXX..XXX..",
      "..XXX..XXX..",
      "............",
    ],
    palette: CUR,
  },
  focus: {
    rows: [
      "XXXXXXXXXXXX",
      ".X........X.",
      ".XXXXXXXXXX.",
      "..XXXXXXXX..",
      "...XXXXXX...",
      "....XXXX....",
      "....X..X....",
      "...X....X...",
      "..X..XX..X..",
      ".X.XXXXXX.X.",
      ".XXXXXXXXXX.",
      "XXXXXXXXXXXX",
    ],
    palette: CUR,
  },
  notes: {
    rows: [
      "XXXXX..XXXXX",
      "X...XXXX...X",
      "X.XX.XX.XX.X",
      "X...X..X...X",
      "X.XX.XX.XX.X",
      "X...X..X...X",
      "X.XX.XX.XX.X",
      "X...X..X...X",
      "X...X..X...X",
      "XXXXXXXXXXXX",
      ".....XX.....",
      "............",
    ],
    palette: CUR,
  },
  garden: {
    rows: [
      "....XXXX....",
      "..XXXXXXXX..",
      ".XXXXXXXXXX.",
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
      ".XXXXXXXXXX.",
      "..XXXXXXXX..",
      ".....XX.....",
      ".....XX.....",
      ".....XX.....",
      "...XXXXXX...",
      "............",
    ],
    palette: CUR,
  },
  settings: {
    rows: [
      ".....XX.....",
      "..XX.XX.XX..",
      "..XXXXXXXX..",
      ".XXXX..XXXX.",
      "XXXX....XXXX",
      "XXX......XXX",
      "XXX......XXX",
      "XXXX....XXXX",
      ".XXXX..XXXX.",
      "..XXXXXXXX..",
      "..XX.XX.XX..",
      ".....XX.....",
    ],
    palette: CUR,
  },
  shield: {
    rows: [
      "XXXXXXXXXXXX",
      "X..........X",
      "X.XXXXXXXX.X",
      "X.X......X.X",
      "X.X.XXXX.X.X",
      "X.X.XXXX.X.X",
      ".X.X....X.X.",
      ".X..XXXX..X.",
      "..X......X..",
      "...X....X...",
      "....XXXX....",
      "............",
    ],
    palette: CUR,
  },
  acorn: {
    rows: [
      "....OO....",
      "..OOttOO..",
      ".OttttttO.",
      ".OOOOOOOO.",
      ".OTTTTTHO.",
      ".OTTTTTHO.",
      "..OTTTTO..",
      "...OTTO...",
      "....OO....",
    ],
    palette: { ...OUT, T: v("trunk"), t: v("trunk-dark"), H: v("cream") },
  },
  flame: {
    rows: [
      "....O.....",
      "...ORO....",
      "...ORRO...",
      "..ORRRROO.",
      ".ORRYRRRO.",
      ".ORYYYRRO.",
      ".ORYWYYRO.",
      ".ORYYYYRO.",
      "..ORRRRO..",
      "...OOOO...",
    ],
    palette: { ...OUT, R: v("orange"), Y: v("yellow"), W: v("cream") },
  },
  star: {
    rows: [
      "....OO....",
      "...OYYO...",
      "OOOOYYOOOO",
      "OYYYYYYYYO",
      ".OYYYYYYO.",
      "..OYYYYO..",
      ".OYYOOYYO.",
      ".OYO..OYO.",
      ".OO....OO.",
    ],
    palette: { ...OUT, Y: v("gold") },
  },
  clock: {
    rows: [
      "...OOOO...",
      ".OOCCCCOO.",
      ".OCCCKCCO.",
      "OCCCCKCCCO",
      "OCCCCKCCCO",
      "OCCCCKKKCO",
      "OCCCCCCCCO",
      ".OCCCCCCO.",
      ".OOCCCCOO.",
      "...OOOO...",
    ],
    palette: { ...OUT, C: v("cream"), K: v("black") },
  },
  leaf: {
    rows: [
      "......OOO.",
      "....OOLLO.",
      "...OLLLHO.",
      "..OLLLHLO.",
      ".OLLLHLLO.",
      ".OLLHLLO..",
      ".OLHLLO...",
      ".OHOOO....",
      "O.........",
    ],
    palette: { ...OUT, L: v("leaf"), H: v("leaf-light") },
  },
} satisfies Record<string, SpriteDef>;

export type IconName = keyof typeof ICONS;
