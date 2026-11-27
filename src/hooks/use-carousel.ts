import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { setSettledSlide } from "./use-slide-settle";

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

  // The arrows, keys, hash and game row glide the track with our own short
  // ease-out instead of scrollTo's smooth behavior: Chrome's takes ~870ms for
  // one slide (1.5s to loop back to Home) and barely moves for the first
  // 150ms, which felt like the page lagging behind the click.
  const glide = useRef<{ frame: number; stop: () => void } | null>(null);

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
      glide.current?.stop();
      const to = target * track.clientWidth;
      const from = track.scrollLeft;
      if (!smooth || Math.abs(to - from) < 1) {
        track.scrollLeft = to;
        return;
      }

      const slides = Math.abs(to - from) / track.clientWidth;
      const duration = Math.min(420 + 90 * (slides - 1), 700);
      const start = performance.now();
      // Snapping would pull each step back to a slide edge.
      track.style.scrollSnapType = "none";
      const stop = () => {
        cancelAnimationFrame(state.frame);
        track.style.scrollSnapType = "";
        ["wheel", "touchstart", "pointerdown"].forEach((e) => track.removeEventListener(e, stop));
        if (glide.current === state) glide.current = null;
      };
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - t) ** 3;
        track.scrollLeft = from + (to - from) * eased;
        if (t < 1) state.frame = requestAnimationFrame(step);
        else {
          stop();
          setSettledSlide(target);
        }
      };
      const state = { frame: requestAnimationFrame(step), stop };
      glide.current = state;
      // A swipe, wheel or click on the track takes over from the glide.
      ["wheel", "touchstart", "pointerdown"].forEach((e) =>
        track.addEventListener(e, stop, { passive: true })
      );
    },
    [slugs.length, releaseTargetSoon]
  );

  // Open on the slide named in the hash, before the first paint, with every
  // slide (and the window) scrolled to the top. Browsers put scroll positions
  // back on reload and on back/forward, and Chrome does it for the slides' own
  // scroll boxes too, sometimes after load, so this runs again then.
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const toTop = () => {
      window.scrollTo(0, 0);
      trackRef.current?.querySelectorAll<HTMLElement>(".slide-scroll").forEach((el) => {
        el.scrollTop = 0;
      });
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) toTop();
    };
    const track = trackRef.current;
    if (track) track.scrollLeft = currentRef.current * track.clientWidth;
    setSettledSlide(currentRef.current);
    toTop();
    if (document.readyState !== "complete") window.addEventListener("load", toTop, { once: true });
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("load", toTop);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  // Follow the scroll position to know which slide is on screen, and tell the
  // games when the track is moving and which slide it came to rest on.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    let settleTimer = 0;
    const settle = () => {
      window.clearTimeout(settleTimer);
      if (glide.current) return;
      const w = track.clientWidth;
      const i = Math.round(track.scrollLeft / w);
      // A finger held still between two slides isn't at rest on either.
      if (Math.abs(track.scrollLeft - i * w) < 2) setSettledSlide(i);
    };
    const onScroll = () => {
      // Landing exactly on a slide (the last step of a glide, or a resize)
      // isn't moving.
      const w = track.clientWidth;
      if (Math.abs(track.scrollLeft - Math.round(track.scrollLeft / w) * w) >= 1) setSettledSlide(null);
      window.clearTimeout(settleTimer);
      // scrollend isn't in every browser yet; a quiet moment counts too.
      settleTimer = window.setTimeout(settle, 150);
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
    track.addEventListener("scrollend", settle);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(targetTimer.current);
      window.clearTimeout(settleTimer);
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("scrollend", settle);
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
