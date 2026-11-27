import { useEffect, useRef } from "react";
import type { MikesGame } from "mikes";

import { useSlideSettle } from "../../hooks/use-slide-settle";

import "./styles.css";

// The real game, running in the slide. It plays only while the carousel is at
// rest on its slide: while slides are changing, or another slide is showing,
// it's frozen and ignores keys and taps, so Space and ↑ (and taps elsewhere on
// the page) never reach it. Clicks and taps on the board play.
const MikesDemo = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<MikesGame | null>(null);
  const here = useSlideSettle(boardRef) === "here";
  const hereRef = useRef(here);
  hereRef.current = here;

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    let cancelled = false;
    // Phaser is big, so the game loads in its own chunk after the page.
    import("mikes").then(({ mount }) => {
      if (cancelled) return;
      gameRef.current = mount(board, { active: hereRef.current, captureKeys: true, storageKey: "mikes-hi" });
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
    <div className="mikes-demo">
      <div className="mikes-board" ref={boardRef} role="img" aria-label="Mike's, a running game. Tap or press Space to jump." />
      <p className="mikes-hint" aria-hidden="true">
        Space or tap to start. Double space or double tap to boost your jump.
      </p>
    </div>
  );
};

export default MikesDemo;
