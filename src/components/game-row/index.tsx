import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type RefObject,
} from "react";

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
  /** The slide this copy of the row sits over: sets its colors and underline. */
  shown: number;
  /** The carousel's current slide, for the arrows and keeping it in view. */
  current: number;
  flash: Flash;
  /** `jump` is true for picking an item, false for the arrows. */
  onSelect: (index: number, jump: boolean) => void;
}

type Flash = "prev" | "next" | null;

const GameRow = ({ items, shown, current, flash, onSelect }: GameRowProps) => {
  const itemsRef = useRef<HTMLDivElement>(null);

  // A mouse click or tap shouldn't leave the button focused: the next Space
  // (e.g. starting Mike's) would press it again and draw a focus ring around
  // it. Keyboard presses (detail 0) keep focus, so Tab users stay in place.
  const select =
    (i: number, jump = false) =>
    (e: MouseEvent<HTMLButtonElement>) => {
      onSelect(i, jump);
      if (e.detail > 0) e.currentTarget.blur();
    };

  // Whether the row has more items off screen to the left / right (phones).
  const [more, setMore] = useState({ left: false, right: false });
  const checkMore = () => {
    const row = itemsRef.current;
    if (!row) return;
    const left = row.scrollLeft > 1;
    const right = row.scrollLeft < row.scrollWidth - row.clientWidth - 1;
    setMore((m) => (m.left === left && m.right === right ? m : { left, right }));
  };

  useEffect(() => {
    const row = itemsRef.current;
    if (!row) return;
    checkMore();
    const observer = new ResizeObserver(checkMore);
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  // When the row is wider than the screen (phones), keep the current item in
  // view and clear of the "more" arrows (30px + 8px) that sit over the row.
  useEffect(() => {
    const row = itemsRef.current;
    const item = row?.children[current] as HTMLElement | undefined;
    if (!row || !item) return;
    const left = item.offsetLeft - row.offsetLeft;
    const clear = 38;
    if (left - clear < row.scrollLeft) row.scrollLeft = left - clear;
    else if (left + item.offsetWidth + clear > row.scrollLeft + row.clientWidth)
      row.scrollLeft = left + item.offsetWidth + clear - row.clientWidth;
  }, [current]);

  // All copies of the row scroll together, so the wipe lines up on phones.
  const onScroll = () => {
    checkMore();
    const row = itemsRef.current;
    // Only the copy on screen leads; hidden copies writing back would cancel
    // its smooth scroll.
    if (!row || row.closest("[inert]")) return;
    document.querySelectorAll<HTMLElement>(".game-row-items").forEach((other) => {
      if (other !== row && other.scrollLeft !== row.scrollLeft) other.scrollLeft = row.scrollLeft;
    });
  };

  // The "more" arrows scroll the row by most of its width; the slide stays put.
  const scrollRow = (dir: 1 | -1) => (e: MouseEvent<HTMLButtonElement>) => {
    const row = itemsRef.current;
    if (!row) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollBy({
      left: dir * (row.clientWidth - 76),
      behavior: reduce ? "auto" : "smooth",
    });
    if (e.detail > 0) e.currentTarget.blur();
  };

  return (
    <nav
      className="game-row"
      aria-label="Home and games"
      style={
        {
          "--row-ink": items[shown]?.ink,
          "--row-bg": items[shown]?.color,
        } as CSSProperties
      }
    >
      <div className="game-row-inner">
        <div className="game-row-scroller">
          <div className="game-row-items" ref={itemsRef} onScroll={onScroll}>
            {items.map((item, i) => (
              <button
                key={item.slug}
                type="button"
                className="game-row-item"
                aria-current={i === shown ? "true" : undefined}
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
          {more.left && (
            <button
              type="button"
              className="game-row-more game-row-more-left"
              aria-label="Show earlier games"
              onClick={scrollRow(-1)}
            >
              <span aria-hidden="true">←</span>
            </button>
          )}
          {more.right && (
            <button
              type="button"
              className="game-row-more game-row-more-right"
              aria-label="Show more games"
              onClick={scrollRow(1)}
            >
              <span aria-hidden="true">→</span>
            </button>
          )}
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

interface GameRowsProps {
  items: GameRowItem[];
  current: number;
  onSelect: (index: number) => void;
  trackRef: RefObject<HTMLElement | null>;
}

/**
 * One copy of the row per slide, each cut to where its slide is on screen.
 * While swiping, the edge between two slides wipes across the row, so its
 * colors and underline change exactly at the slide's edge instead of all at
 * once. Only the current slide's copy can be focused or read out.
 */
const GameRows = ({ items, current, onSelect, trackRef }: GameRowsProps) => {
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  // The arrow for the last one-step move (arrow, key or swipe) fills briefly.
  const [flash, setFlash] = useState<Flash>(null);
  const prevCurrent = useRef(current);
  const jumped = useRef(false);

  const select = (i: number, jump: boolean) => {
    jumped.current = jump;
    onSelect(i);
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

  // Clip each copy to its slide on every scroll frame.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const clip = () => {
      const width = track.clientWidth;
      layers.current.forEach((layer, i) => {
        if (!layer) return;
        const left = Math.min(Math.max(i * width - track.scrollLeft, 0), width);
        const right = Math.min(Math.max(track.scrollLeft - i * width, 0), width);
        layer.style.clipPath = `inset(0 ${right}px 0 ${left}px)`;
      });
    };
    clip();
    track.addEventListener("scroll", clip, { passive: true });
    window.addEventListener("resize", clip);
    return () => {
      track.removeEventListener("scroll", clip);
      window.removeEventListener("resize", clip);
    };
  }, [trackRef, items.length]);

  return (
    <>
      {items.map((item, i) => (
        <div
          key={item.slug}
          className="game-row-layer"
          ref={(el) => {
            layers.current[i] = el;
          }}
          inert={i !== current}
          aria-hidden={i !== current ? true : undefined}
        >
          <GameRow items={items} shown={i} current={current} flash={flash} onSelect={select} />
        </div>
      ))}
    </>
  );
};

export default GameRows;
