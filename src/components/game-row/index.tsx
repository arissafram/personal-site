import { useEffect, useRef, type CSSProperties } from "react";

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
              onClick={() => onSelect(i)}
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
            onClick={() => onSelect(current - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => onSelect(current + 1)}
          >
            →
          </button>
        </div>
      </div>
    </nav>
  );
};

export default GameRow;
