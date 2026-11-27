import { useEffect, useRef } from "react";
import type { HotDogRunGame } from "hot-dog-run";

import { useSlideSettle } from "../../hooks/use-slide-settle";

import "./styles.css";

// The real game, running in the slide. It plays only while the carousel is at
// rest on its slide: while slides are changing, or another slide is showing,
// it's frozen and ignores keys and taps, so Space and ↑ (and taps elsewhere on
// the page) never reach it. Clicks and taps on the board play.
const HotDogRunDemo = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<HotDogRunGame | null>(null);
  const here = useSlideSettle(boardRef) === "here";
  const hereRef = useRef(here);
  hereRef.current = here;

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
    if (here) gameRef.current?.resume();
    else gameRef.current?.pause();
  }, [here]);

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
