import { lazy, Suspense, useEffect, useRef, useState, type SyntheticEvent } from "react";

import { useAfterLoad } from "../../hooks/use-after-load";
import { useSlideSettle } from "../../hooks/use-slide-settle";

import "./styles.css";

// Three.js is ~500 kB, so the board loads in its own chunk, and only once the
// slide has come on screen.
const Board = lazy(() => import("./board"));

// Score Four against the computer, in the slide's blue.
//
// The package has no pause(), and its render loop runs every frame while it's
// mounted. But while the slide is off screen the 3D view is hidden: the
// package then sizes its canvas to 1×1, so each frame draws next to nothing.
// That makes it cheap to keep around, so the board mounts in the background
// once the page has loaded and the browser is idle, and is already there when
// someone arrives. (Coming to rest on the slide before then mounts it at
// once.) The game, score and camera stay as they were between visits.
const ScoreFourDemo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useSlideSettle(ref);
  const afterLoad = useAfterLoad();
  const [shown, setShown] = useState(false);
  if ((settle === "here" || afterLoad) && !shown) setShown(true);
  const [onScreen, setOnScreen] = useState(false);


  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A sideways trackpad swipe over the board should move the carousel, not
  // reach the 3D view (which takes every wheel event to zoom). Caught on the
  // way down, before the canvas sees it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation();
    };
    el.addEventListener("wheel", onWheel, { capture: true });
    return () => el.removeEventListener("wheel", onWheel, { capture: true });
  }, []);

  // After choosing an option or clicking a button, let go of focus so ← →
  // move the carousel instead of changing the option.
  // (A select is let go on change, not on pointerup, which would shut it.)
  const blurAfterPointer = (e: SyntheticEvent) => {
    const target = e.target;
    const done = e.type === "change" ? target instanceof HTMLSelectElement : target instanceof Element && !!target.closest("button");
    if (!done) return;
    setTimeout(() => {
      const active = document.activeElement;
      if (active instanceof HTMLElement && ref.current?.contains(active)) active.blur();
    }, 0);
  };

  return (
    <div
      className={`score-four-demo${onScreen ? "" : " score-four-demo-off"}`}
      ref={ref}
      onChange={blurAfterPointer}
      onPointerUp={blurAfterPointer}
    >
      {/* Until the board is in, an empty box holds its space (on a phone the
          panel's height comes from its contents, so it would collapse). */}
      {shown ? (
        <Suspense fallback={<div className="score-four-demo-placeholder" aria-hidden="true" />}>
          <Board />
        </Suspense>
      ) : (
        <div className="score-four-demo-placeholder" aria-hidden="true" />
      )}
    </div>
  );
};

export default ScoreFourDemo;
