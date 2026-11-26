import { useEffect, useRef, useState } from "react";
import { Puzzle } from "react-jigsaw";
import "react-jigsaw/styles";

import "./styles.css";

// The photo puzzle from react-jigsaw, drawn in the slide's own colors: the
// board is the slide color, and the lines, timer and ↻ are its ink (see
// styles.css). Lines and the timer use `currentColor`, which is the slide ink.
const OPTIONS = {
  board: {
    className: "jigsaw-board",
    columns: 3,
    height: 450,
    outlineStrokeColor: "currentColor",
    rows: 3,
    scatterArea: 50,
    showBoardSlotOutlines: true,
    snapThreshold: 20,
    width: 400,
  },
  puzzle: {
    className: "jigsaw-puzzle",
    responsive: true,
    timer: { className: "jigsaw-timer", enabled: true },
    refreshButton: { className: "jigsaw-refresh", enabled: true },
  },
  puzzlePiece: {
    strokeColor: "currentColor",
    strokeEnabled: true,
  },
};

const JigsawDemo = () => {
  const ref = useRef<HTMLDivElement>(null);
  // The timer starts when the puzzle mounts, so wait until the slide is on
  // screen. Until then an empty box of the same size holds the space.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown(true);
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown]);

  // Clicking a piece shouldn't leave it focused, or ← → would nudge the piece
  // instead of moving the carousel. Keyboard players still Tab to pieces.
  const blurAfterPointer = () => {
    const active = document.activeElement;
    if (active instanceof SVGElement && ref.current?.contains(active)) active.blur();
  };

  return (
    <div className="jigsaw-demo" ref={ref} onPointerUp={blurAfterPointer}>
      {shown ? (
        <Puzzle image="/puzzle.jpg" options={OPTIONS} />
      ) : (
        <div className="jigsaw-demo-placeholder" aria-hidden="true" />
      )}
    </div>
  );
};

export default JigsawDemo;
