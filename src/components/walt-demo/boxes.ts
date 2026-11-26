// The box designs from the Walt extension (walt-extension/boxes.js), copied
// into public/games/walt/ at 360px wide. `ratio` is height / width.
export const BOXES = [
  { id: "walt-original", name: "Original", ratio: 618 / 900 },
  { id: "walt-dexter", name: "Dexter", ratio: 528 / 900 },
  { id: "walt-ramy", name: "Ramy", ratio: 588 / 900 },
  { id: "walt-sandra", name: "Sandra", ratio: 446 / 900 },
  { id: "walt-jones", name: "Jones", ratio: 605 / 900 },
  { id: "walt-arnold", name: "Arnold", ratio: 543 / 900 },
];

export type Box = (typeof BOXES)[number];

export const boxSrc = (box: Box) => `/games/walt/${box.id}.png`;
