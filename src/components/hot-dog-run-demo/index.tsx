import { useEffect, useRef } from "react";
import type { HotDogRunGame } from "hot-dog-run";

import { useSlideSettle } from "../../hooks/use-slide-settle";

import "./styles.css";

// The real game, running in the slide. It starts playing once the carousel has
// come to rest on its slide, and pauses only once the carousel has come to rest
// on another one. While the track moves (a drag, a peek, a swipe that snaps
// back) it carries on as it was, so a run is never cut short by touching the
// screen. While paused it ignores keys and taps, so Space and ↑ (and taps
// elsewhere on the page) never reach it. Clicks and taps on the board play.
const HotDogRunDemo = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<HotDogRunGame | null>(null);
  const settle = useSlideSettle(boardRef);
  const hereRef = useRef(settle === "here");
  hereRef.current = settle === "here";

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    let cancelled = false;
    // Phaser is big, so the game loads in its own chunk after the page.
    import("hot-dog-run").then(({ mount }) => {
      if (cancelled) return;
      gameRef.current = mount(board, { active: hereRef.current, captureKeys: true, storageKey: "hot-dog-run-hi" });
    });
    return () => {
      cancelled = true;
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (settle === "here") gameRef.current?.resume();
    else if (settle === "elsewhere") gameRef.current?.pause();
  }, [settle]);

  return (
    <div className="hot-dog-run-demo">
      <div className="hot-dog-run-board" ref={boardRef} role="img" aria-label="Dogs, a running game. Tap or press Space to jump." />
      <p className="hot-dog-run-hint" aria-hidden="true">
        Space or tap to start. Double space or double tap to boost your jump.
      </p>
    </div>
  );
};

export default HotDogRunDemo;
