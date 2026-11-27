import { useEffect, useRef, type KeyboardEvent } from "react";
import type { FreeSoloGame } from "free-solo";

import "./styles.css";

// Phaser is bundled into free-solo (~1.2 MB), so it loads in its own chunk,
// and only once the slide comes on screen. The promise is kept, so coming
// back to the slide doesn't fetch it again.
let loading: Promise<typeof import("free-solo")> | null = null;
const load = () => (loading ??= import("free-solo"));

// Free Solo, running in the slide.
//
// The package has no pause(), so the game runs only while the slide is on
// screen: it mounts when the slide comes into view and is torn down when it
// leaves (the run ends; the best height stays in localStorage).
//
// Keys: `keys: "focus"`, so ← → move the carousel until someone clicks or taps
// the wall. Then the arrow keys climb (the game cancels them, so the carousel
// leaves them alone) until focus leaves the wall: Escape, Tab, a click
// anywhere else, or the game row. Swipes on the wall climb; the package makes
// it touch-action: none, so they never scroll the carousel.
const FreeSoloDemo = () => {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    let game: FreeSoloGame | null = null;
    let onScreen = false;
    let unmounted = false;

    const start = () => {
      load().then(({ mount }) => {
        if (unmounted || !onScreen || game) return;
        game = mount(board, { keys: "focus", storageKey: "free-solo-best" });
      });
    };
    const stop = () => {
      game?.destroy();
      game = null;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else stop();
      },
      { threshold: 0.6 }
    );
    observer.observe(board);
    return () => {
      unmounted = true;
      observer.disconnect();
      stop();
    };
  }, []);

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
