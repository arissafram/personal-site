import type { PlacedMagnet } from "magnetic-poem";

// The "Knicks" arrangement: the quote in reading order (the package's own
// packed layout, so those tiles aren't listed) with the ten filler tiles
// scattered across the bottom of the board. Fractions of the board's width and
// height, in stacking order (later tiles sit on top).
export const KNICKS_MAGNETS: PlacedMagnet[] = [
  { id: "to-1", x: 0.1383, y: 0.6863 },
  { id: "of-1", x: 0.1061, y: 0.7708 },
  { id: "in-2", x: 0.2939, y: 0.6829 },
  { id: "my-1", x: 0.3548, y: 0.7928 },
  { id: "and-2", x: 0.4704, y: 0.7037 },
  { id: "is-1", x: 0.5278, y: 0.7546 },
  { id: "you-1", x: 0.633, y: 0.7986 },
  { id: "a-1", x: 0.6826, y: 0.7604 },
  { id: "I-1", x: 0.7365, y: 0.6227 },
  { id: "the-3", x: 0.7043, y: 0.6794 },
];
