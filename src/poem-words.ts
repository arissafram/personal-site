// The magnetic poem's words, shared by the slide (components/magnetic-poem-demo),
// the dev server's /api/poem (vite.config.ts) and the save Lambda
// (amplify/functions/poem). The server only accepts saves that use these
// words, so all three must get the same list and the same addFillers.
//
// From: "Neighbors invited neighbors over. Strangers high fived one another in
// the street. Subway conductors sang their announcements and bus drivers
// danced behind the wheel."
//
// Type-only import: the Lambda bundles this file and shouldn't pull in React.
import type { WordInput } from "magnetic-poem/server";

// Listed word by word in reading order, so the poem starts as the quote,
// with the filler tiles (addFillers) after it. Repeated words get ids
// neighbors-1, neighbors-2, the-1, the-2.
export const knicksWords: WordInput[] = [
  "neighbors",
  "invited",
  "neighbors",
  "over",
  "strangers",
  "high",
  "fived",
  "one",
  "another",
  "in",
  "the",
  "street",
  "subway",
  "conductors",
  "sang",
  "their",
  "announcements",
  "and",
  "bus",
  "drivers",
  "danced",
  "behind",
  "the",
  "wheel",
];

/** Adds the package's ten extra filler tiles (the a I and you is of to in my). */
export const addFillers = true;
