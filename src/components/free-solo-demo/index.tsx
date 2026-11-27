import { useEffect, useRef, type KeyboardEvent } from "react";
import type { FreeSoloGame } from "free-solo";

import { useSlideSettle } from "../../hooks/use-slide-settle";

import "./styles.css";

// Phaser is bundled into free-solo (~1.2 MB), so it loads in its own chunk,
// and only once the slide comes on screen. The promise is kept, so coming
// back to the slide doesn't fetch it again.
let loading: Promise<typeof import("free-solo")> | null = null;
const load = () => (loading ??= import("free-solo"));

// Free Solo, running in the slide.
//
// The package has no pause(). The game mounts once the carousel has come to
// rest on its slide (mounting Phaser during a slide change made every frame of
// it late), and is torn down only once the carousel has come to rest on
// another slide (the run ends; the best height stays in localStorage). While
// the track moves (a drag, a peek, a swipe that snaps back) the run carries on.
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

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    if (settle === "here" && !gameRef.current) {
      load().then(({ mount }) => {
        if (settleRef.current === "here" && !gameRef.current)
          gameRef.current = mount(board, { keys: "focus", storageKey: "free-solo-best" });
      });
    } else if (settle === "elsewhere") {
      gameRef.current?.destroy();
      gameRef.current = null;
    }
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
