import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Drives the horizontal slide track: tracks which slide is on screen, keeps the
 * URL hash in sync (with replaceState), and moves between slides from the
 * arrows, the ← → keys and hash changes. Arrows and keys loop at the ends.
 */
export const useCarousel = (slugs: string[]) => {
  const trackRef = useRef<HTMLElement>(null);
  const indexFromHash = useCallback(() => {
    const i = slugs.indexOf(window.location.hash.slice(1));
    return i < 0 ? 0 : i;
  }, [slugs]);

  const [current, setCurrent] = useState(indexFromHash);
  const currentRef = useRef(current);
  currentRef.current = current;
  // While an arrow/key/hash scroll is animating, the slides it passes over
  // shouldn't become current.
  const targetRef = useRef<number | null>(null);
  const targetTimer = useRef(0);
  const slugCount = useRef(slugs.length);
  slugCount.current = slugs.length;
  // Release the lock once scrolling has been quiet for a moment (also covers a
  // scroll the person interrupts), and trust wherever the track ended up.
  const releaseTargetSoon = useCallback(() => {
    window.clearTimeout(targetTimer.current);
    targetTimer.current = window.setTimeout(() => {
      targetRef.current = null;
      const track = trackRef.current;
      if (!track) return;
      const i = Math.round(track.scrollLeft / track.clientWidth);
      setCurrent(Math.min(Math.max(i, 0), slugCount.current - 1));
    }, 200);
  }, []);

  const go = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const n = slugs.length;
      const target = ((i % n) + n) % n;
      const smooth = !prefersReducedMotion();
      targetRef.current = smooth ? target : null;
      releaseTargetSoon();
      setCurrent(target);
      track.scrollTo({
        left: target * track.clientWidth,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [slugs.length, releaseTargetSoon]
  );

  // Open on the slide named in the hash, before the first paint.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = currentRef.current * track.clientWidth;
  }, []);

  // Follow the scroll position to know which slide is on screen.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        if (targetRef.current !== null) {
          releaseTargetSoon();
          if (i !== targetRef.current) return;
        }
        if (i !== currentRef.current && i >= 0 && i < slugs.length) setCurrent(i);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(targetTimer.current);
      track.removeEventListener("scroll", onScroll);
    };
  }, [slugs.length, releaseTargetSoon]);

  // Keep the hash in sync without filling up the back button.
  useEffect(() => {
    const slug = slugs[current];
    if (window.location.hash.slice(1) !== slug) {
      history.replaceState(null, "", `#${slug}`);
    }
  }, [current, slugs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target;
      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(currentRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(currentRef.current - 1);
      }
    };
    const onHashChange = () => go(indexFromHash());
    const onResize = () => {
      const track = trackRef.current;
      if (track) track.scrollLeft = currentRef.current * track.clientWidth;
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("resize", onResize);
    };
  }, [go, indexFromHash]);

  return { trackRef, current, go };
};
