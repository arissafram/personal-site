import { useEffect, useRef } from "react";
import type { MikesGame } from "mikes";

import "./styles.css";

// The real game, running in the slide. It plays only while it's on screen:
// off screen it's frozen and ignores keys and taps, so Space and ↑ (and taps
// elsewhere on the page) never reach it. Clicks and taps on the board play.
const MikesDemo = () => {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    let game: MikesGame | null = null;
    let onScreen = false;
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) game?.resume();
        else game?.pause();
      },
      { threshold: 0.6 }
    );
    observer.observe(board);
    // Phaser is big, so the game loads in its own chunk after the page.
    import("mikes").then(({ mount }) => {
      if (cancelled) return;
      game = mount(board, { active: onScreen, captureKeys: true, storageKey: "mikes-hi" });
    });
    return () => {
      cancelled = true;
      observer.disconnect();
      game?.destroy();
    };
  }, []);

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
