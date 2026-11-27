import { useRef, useState } from "react";
import { Puzzle } from "react-jigsaw";
import "react-jigsaw/styles";

import { useSlideSettle } from "../../hooks/use-slide-settle";

import "./styles.css";

// Pieces start scattered up to this far past the board's edges (board units,
// board is 400 wide). Stacked on a phone the board fills the column, so they
// start on the board instead, or they'd be cut off at the screen edge.
const SCATTER = 50;
const STACKED = "(max-width: 760px)";

// Piece outlines. Everything else on the slide stays in its ink.
const PIECE_LINE = "#4169e1";

// Square grids on the 8:9 photo. On a phone the board is ~340px wide, so
// Hard's pieces are still ~57×64px, comfortably big enough to drag.
const LEVELS = [
  { id: "easy", label: "Easy", size: 3 },
  { id: "medium", label: "Medium", size: 4 },
  { id: "hard", label: "Hard", size: 6 },
] as const;
type LevelId = (typeof LEVELS)[number]["id"];

const STORAGE_KEY = "arissafram.jigsaw-difficulty";

const readLevel = (): LevelId => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (LEVELS.some((l) => l.id === saved)) return saved as LevelId;
  } catch {
    // Storage blocked: start on Hard.
  }
  return "hard";
};

const saveLevel = (id: LevelId) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Not remembered; that's fine.
  }
};

// The photo puzzle from react-jigsaw, drawn in the slide's own colors: the
// board is the slide color, and the lines, timer and ↻ are its ink (see
// styles.css). Lines and the timer use `currentColor`, which is the slide ink.
const optionsFor = (size: number, stacked: boolean) => ({
  board: {
    className: "jigsaw-board",
    columns: size,
    height: 450,
    outlineStrokeColor: "currentColor",
    rows: size,
    scatterArea: stacked ? 0 : SCATTER,
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
    strokeColor: PIECE_LINE,
    strokeEnabled: true,
  },
});

const JigsawDemo = () => {
  const ref = useRef<HTMLDivElement>(null);
  // The timer starts when the puzzle mounts, so wait until the carousel has
  // come to rest on the slide (mounting it mid-slide change made the slide
  // stutter). Until then an empty box of the same size holds the space.
  const settle = useSlideSettle(ref);
  const [shown, setShown] = useState(false);
  if (settle === "here" && !shown) setShown(true);
  const [level, setLevel] = useState<LevelId>(readLevel);
  const size = LEVELS.find((l) => l.id === level)!.size;

  const choose = (id: LevelId) => {
    setLevel(id);
    saveLevel(id);
  };

  // Clicking a piece or a difficulty shouldn't leave it focused, or ← → would
  // nudge the piece or change the difficulty instead of moving the carousel.
  // The label's click focuses its radio after pointerup, hence the timeout.
  // Keyboard players still Tab to pieces and arrow through the options.
  const blurAfterPointer = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (!active || !ref.current?.contains(active)) return;
      if (active instanceof SVGElement || active instanceof HTMLInputElement) active.blur();
    }, 0);
  };

  return (
    <div className="jigsaw-demo" ref={ref} onPointerUp={blurAfterPointer}>
      {shown ? (
        <>
          <div className="jigsaw-difficulty" role="radiogroup" aria-label="Difficulty">
            {LEVELS.map((l) => (
              <label key={l.id}>
                <input
                  type="radio"
                  name="jigsaw-difficulty"
                  value={l.id}
                  checked={level === l.id}
                  onChange={() => choose(l.id)}
                />
                <span>{l.label}</span>
              </label>
            ))}
          </div>
          {/* rows/columns are read once on mount, so a new key remounts the
              puzzle: new grid, fresh shuffle, timer back to 0. */}
          <Puzzle
            key={level}
            image="/puzzle.jpg"
            options={optionsFor(size, window.matchMedia(STACKED).matches)}
          />
        </>
      ) : (
        <div className="jigsaw-demo-placeholder" aria-hidden="true" />
      )}
    </div>
  );
};

export default JigsawDemo;
