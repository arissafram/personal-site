import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

// Which slide the carousel has come to rest on, or null while it's moving.
// useCarousel writes it; the games read it so they start, mount and load only
// once their slide has stopped moving, and never during a slide change.

let settled: number | null = null;
const listeners = new Set<() => void>();

export const setSettledSlide = (i: number | null) => {
  if (i === settled) return;
  settled = i;
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSettled = () => settled;

/** The index of the `.slide` that contains `el` (its place in the track). */
const slideIndexOf = (el: Element | null) => {
  const slide = el?.closest(".slide");
  return slide?.parentElement ? Array.from(slide.parentElement.children).indexOf(slide) : -1;
};

export type SlideSettle = "here" | "elsewhere" | "moving";

/**
 * Where the carousel is, seen from the slide that holds `ref`: at rest on it
 * ("here"), at rest on another slide ("elsewhere"), or moving.
 */
export const useSlideSettle = (ref: RefObject<Element | null>): SlideSettle => {
  const [index, setIndex] = useState(-1);
  useEffect(() => setIndex(slideIndexOf(ref.current)), [ref]);
  const current = useSyncExternalStore(subscribe, getSettled, getSettled);
  if (current === null || index < 0) return "moving";
  return current === index ? "here" : "elsewhere";
};
