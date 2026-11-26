import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

import PlaceholderArt from "../placeholder-art";

import "./styles.css";

export interface GameRowItem {
  slug: string;
  name: string;
  /** Used instead of `name` in the row when set. */
  shortName?: string;
  color: string;
  ink: string;
  image?: string;
  /** Placeholder drawing name, used when there is no image. */
  art?: string;
  /** Text shown in the square when there is no image (Home uses "AF."). */
  mark?: string;
}

interface GameRowProps {
  items: GameRowItem[];
  current: number;
  onSelect: (index: number) => void;
}

const GameRow = ({ items, current, onSelect }: GameRowProps) => {
  const itemsRef = useRef<HTMLDivElement>(null);
  // The arrow for the last one-step move (arrow, key or swipe) fills briefly.
  const [flash, setFlash] = useState<"prev" | "next" | null>(null);
  const prevCurrent = useRef(current);
  const jumped = useRef(false);

  // A mouse click or tap shouldn't leave the button focused: the next Space
  // (e.g. starting Mike's) would press it again and draw a focus ring around
  // it. Keyboard presses (detail 0) keep focus, so Tab users stay in place.
  const select = (i: number, jump = false) => (e: MouseEvent<HTMLButtonElement>) => {
    jumped.current = jump;
    onSelect(i);
    if (e.detail > 0) e.currentTarget.blur();
  };

  // Work out which way the carousel stepped (it loops, so last → Home is
  // "next"). Picking an item in the row is a jump, not a step.
  useEffect(() => {
    const n = items.length;
    const step = (current - prevCurrent.current + n) % n;
    prevCurrent.current = current;
    const wasJump = jumped.current;
    jumped.current = false;
    if (wasJump || step === 0 || (step !== 1 && step !== n - 1)) return;
    setFlash(step === 1 ? "next" : "prev");
    const t = window.setTimeout(() => setFlash(null), 250);
    return () => window.clearTimeout(t);
  }, [current, items.length]);

  // When the row is wider than the screen (phones), keep the current item in view.
  useEffect(() => {
    const row = itemsRef.current;
    const item = row?.children[current] as HTMLElement | undefined;
    if (!row || !item) return;
    const left = item.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft) row.scrollLeft = left;
    else if (left + item.offsetWidth > row.scrollLeft + row.clientWidth)
      row.scrollLeft = left + item.offsetWidth - row.clientWidth;
  }, [current]);

  return (
    <nav
      className="game-row"
      aria-label="Home and games"
      style={
        {
          "--row-ink": items[current]?.ink,
          "--row-bg": items[current]?.color,
        } as CSSProperties
      }
    >
      <div className="game-row-inner">
        <div className="game-row-items" ref={itemsRef}>
          {items.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              className="game-row-item"
              aria-current={i === current ? "true" : undefined}
              onClick={select(i, true)}
            >
              <span
                className="game-row-square"
                style={{ background: item.color, color: item.ink }}
              >
                {item.image ? (
                  <img src={item.image} alt="" />
                ) : item.art ? (
                  <PlaceholderArt name={item.art} />
                ) : item.mark ? (
                  <span className="game-row-mark">{item.mark}</span>
                ) : null}
              </span>
              <span className="game-row-name">{item.shortName ?? item.name}</span>
            </button>
          ))}
        </div>
        <div className="game-row-arrows">
          <button
            type="button"
            aria-label="Previous"
            className={flash === "prev" ? "is-flashing" : undefined}
            onClick={select(current - 1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Next"
            className={flash === "next" ? "is-flashing" : undefined}
            onClick={select(current + 1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default GameRow;
