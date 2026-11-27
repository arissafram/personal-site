import { useEffect, useRef, type KeyboardEvent } from "react";
import type { FreeSoloGame } from "free-solo";

import { useAfterLoad } from "../../hooks/use-after-load";
import { useSlideSettle } from "../../hooks/use-slide-settle";

import "./styles.css";

// Phaser is bundled into free-solo (~1.2 MB), so it loads in its own chunk
// after the page. The promise is kept, so it's only fetched once.
let loading: Promise<typeof import("free-solo")> | null = null;
const load = () => (loading ??= import("free-solo"));

// Free Solo, running in the slide.
//
// It mounts in the background once the page has loaded (or as soon as the
// carousel rests on its slide, if that comes first), paused: the wall is drawn
// but nothing runs. It plays once the carousel comes to rest on its slide, and
// pauses again only once the carousel has come to rest on another one, so a
// drag or a swipe that snaps back never interrupts a climb.
//
// Keys: `keys: "focus"`, so ← → move the carousel until someone clicks or taps
// the wall. Then the arrow keys climb (the game cancels them, so the carousel
// leaves them alone) until focus leaves the wall: Escape, Tab, a click
// anywhere else, or the game row. Swipes on the wall climb; the package makes
// it touch-action: none, so they never scroll the carousel.
const FreeSoloDemo = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<FreeSoloGame | null>(null);
  const settle = useSlideSettle(boardRef);
  const settleRef = useRef(settle);
  settleRef.current = settle;
  const afterLoad = useAfterLoad();
  const wanted = settle === "here" || afterLoad;

  useEffect(() => {
    const board = boardRef.current;
    if (!board || !wanted || gameRef.current) return;
    let cancelled = false;
    load().then(({ mount }) => {
      if (cancelled || gameRef.current) return;
      gameRef.current = mount(board, {
        active: settleRef.current === "here",
        keys: "focus",
        storageKey: "free-solo-best",
      });
    });
    return () => {
      cancelled = true;
    };
  }, [wanted]);

  useEffect(() => {
    if (settle === "here") gameRef.current?.resume();
    else if (settle === "elsewhere") gameRef.current?.pause();
  }, [settle]);

  useEffect(
    () => () => {
      gameRef.current?.destroy();
      gameRef.current = null;
    },
    []
  );

  // Escape lets go of the wall, so ← → move the carousel again.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") e.currentTarget.blur();
  };

  return (
    <div className="free-solo-demo">
      <div
        className="free-solo-board"
        ref={boardRef}
        onKeyDown={onKeyDown}
        role="application"
        aria-label="Free Solo, an endless climbing game. Click the wall, then use the arrow keys to climb. Escape to leave."
      />
      <p className="free-solo-hint" aria-hidden="true">
        Use the left and right arrow keys to start, or tap the holds.
      </p>
    </div>
  );
};

export default FreeSoloDemo;
