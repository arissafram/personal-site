import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from "react";

import {
  WALT_BOXES,
  WALT_PREVIEW,
  WALT_SIZE,
  WALT_SPEED,
  waltBoxUrl,
  waltPreviewWidth,
  waltStep,
  type WaltBody,
} from "walt-extension";

import { GLYPHS } from "./glyphs";

import "./styles.css";

// A small fake browser with Walt in its extension row. Clicking Walt opens a
// copy of the extension's popup (walt-extension/popup.html); turning it On
// makes the chosen box bounce over the fake page, like the real one does on
// every tab. The boxes, their images and the bounce come from the extension's
// own code (the walt-extension package); the popup here is the site's own.

type Mode = "on" | "off" | "detect";

const PILL: Record<Mode, string> = { on: "Enabled", off: "Disabled", detect: "Sleep mode" };
const DELAYS = [
  { value: 15, label: "15 sec" },
  { value: 30, label: "30 sec" },
  { value: 60, label: "1 min" },
  { value: 120, label: "2 min" },
  { value: 300, label: "5 min" },
  { value: 600, label: "10 min" },
  { value: 900, label: "15 min" },
];
// Published to public/walt/ by the walt-extension repo, with version.json.
const DOWNLOAD_HREF = "/walt/walt.zip";
const { min: SIZE_MIN, max: SIZE_MAX } = WALT_SIZE;
// The demo starts on Ramy at 305px (the extension starts on Original at 182px).
const START_BOX_ID = "walt-ramy";
const START_SIZE = 305;
// The real box is sized in pixels of a whole browser window. The fake page
// counts as a window this wide, so sizes and speeds scale down with it.
const WINDOW_W = 1024;
// Room kept free under the popup preview's box for its hint text.
const HINT_SPACE = 22;
// Height / width of a box image before it has loaded.
const FALLBACK_RATIO = 0.69;

const ratioOf = (img: HTMLImageElement) =>
  img.naturalWidth ? img.naturalHeight / img.naturalWidth : FALLBACK_RATIO;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  );

// A bouncing box's position and velocity (px/s). `w`/`h` are its last drawn
// size, so a resize can keep it centered where it was.
interface Body extends WaltBody {
  w: number;
  h: number;
  placed: boolean;
}

const newBody = (speed: { x: number; y: number }): Body => ({
  x: 0,
  y: 0,
  vx: speed.x,
  vy: speed.y,
  w: 0,
  h: 0,
  placed: false,
});

// Advance one frame with the extension's own bounce (waltStep). `speed`
// scales its velocity. When `moving` is false the box sits still at (cx, cy).
const stepBody = (
  b: Body,
  dt: number,
  W: number,
  H: number,
  w: number,
  h: number,
  speed: number,
  moving: boolean,
  cx: number,
  cy: number
) => {
  if (b.placed && (b.w !== w || b.h !== h)) {
    b.x += (b.w - w) / 2;
    b.y += (b.h - h) / 2;
  }
  b.w = w;
  b.h = h;
  if (!moving || !b.placed) {
    b.x = cx;
    b.y = cy;
    b.placed = true;
    if (!moving) return;
  }
  waltStep(b, dt, W, H, w, h, speed);
};

const WaltDemo = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("on");
  const [boxIndex, setBoxIndex] = useState(() =>
    Math.max(0, WALT_BOXES.findIndex((b) => b.id === START_BOX_ID))
  );
  const [size, setSize] = useState(START_SIZE);
  // The real default is 30 sec; 15 is the shortest choice, so a visitor can
  // see Sleep mode work without waiting long.
  const [delay, setDelay] = useState(15);
  const [idle, setIdle] = useState(false);
  const [version, setVersion] = useState<string | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  const box = WALT_BOXES[boxIndex];
  const boxUrl = waltBoxUrl(box.id);
  const onPage = mode === "on" || (mode === "detect" && idle);
  const delayLabel = DELAYS.find((d) => d.value === delay)?.label ?? "15 sec";
  const hint = mode === "off" ? "Hidden" : mode === "detect" ? `Shows after ${delayLabel} idle` : "";

  const rootRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const pageBoxRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const miniRef = useRef<HTMLImageElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const waltButtonRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // What the animation loop reads each frame, without restarting it.
  const live = useRef({ mode, onPage, reduceMotion, size });
  useEffect(() => {
    live.current = { mode, onPage, reduceMotion, size };
  });

  // One loop moves both boxes: the one on the fake page and the small preview
  // in the popup. It only runs while the demo is on screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const page = newBody(WALT_SPEED);
    const mini = newBody(WALT_PREVIEW.speed);
    let frame = 0;
    let last: number | null = null;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      const { mode, onPage, reduceMotion, size } = live.current;

      const pageEl = pageRef.current;
      const pageBox = pageBoxRef.current;
      if (pageEl && pageBox) {
        const W = pageEl.clientWidth;
        const H = pageEl.clientHeight;
        const scale = W / WINDOW_W;
        const w = Math.min(Math.round(size * scale), W);
        const h = Math.min(Math.round(w * ratioOf(pageBox)), H);
        stepBody(page, dt, W, H, w, h, scale, onPage && !reduceMotion, (W - w) / 2, (H - h) / 2);
        pageBox.style.width = `${w}px`;
        pageBox.style.height = `${h}px`;
        pageBox.style.transform = `translate(${Math.round(page.x)}px, ${Math.round(page.y)}px)`;
      }

      const stage = stageRef.current;
      const miniBox = miniRef.current;
      if (stage && miniBox) {
        const W = stage.clientWidth;
        const H = stage.clientHeight;
        // Same mapping and speed as the real popup's preview.
        const w = waltPreviewWidth(size);
        const h = Math.round(w * ratioOf(miniBox));
        const cy = Math.max(6, (H - HINT_SPACE - h) / 2 + 2);
        stepBody(mini, dt, W, H, w, h, 1, mode === "on" && !reduceMotion, (W - w) / 2, cy);
        miniBox.style.width = `${w}px`;
        miniBox.style.height = `${h}px`;
        miniBox.style.transform = `translate(${Math.round(mini.x)}px, ${Math.round(mini.y)}px)`;
      } else {
        mini.placed = false;
      }
    };

    const start = () => {
      if (frame) return;
      last = null;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    observer.observe(root);
    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  // The walt-extension repo publishes version.json next to walt.zip.
  useEffect(() => {
    let cancelled = false;
    fetch(new URL("version.json", new URL(DOWNLOAD_HREF, window.location.href)), { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.version === "string") setVersion(data.version);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Sleep mode: the box shows once the visitor has done nothing for `delay`
  // seconds, and hides again on any activity, like chrome.idle in the real one.
  useEffect(() => {
    if (mode !== "detect") return;
    let timer = 0;
    const reset = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), delay * 1000);
    };
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    reset();
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [mode, delay]);

  // Close the popup on a click outside it or on Escape, like Chrome does.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (popupRef.current?.contains(target) || waltButtonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      waltButtonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Keep the chosen thumbnail in view in the strip.
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[boxIndex] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const left = thumb.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft) strip.scrollLeft = left - 4;
    else if (left + thumb.offsetWidth > strip.scrollLeft + strip.clientWidth)
      strip.scrollLeft = left + thumb.offsetWidth - strip.clientWidth + 4;
  }, [boxIndex, open]);

  const stepBox = (delta: number, focus: boolean) => {
    const next = (boxIndex + delta + WALT_BOXES.length) % WALT_BOXES.length;
    setBoxIndex(next);
    if (focus) (stripRef.current?.children[next] as HTMLElement | undefined)?.focus({ preventScroll: true });
  };

  const onStripKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      stepBox(1, true);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      stepBox(-1, true);
    }
  };

  const sizeFill = `${((size - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100}%`;

  return (
    <div className="walt-demo" ref={rootRef}>
      <div className="walt-browser">
        <div className="walt-toolbar">
          <div className="walt-address">arissafram.com/walt</div>
          <span className="walt-ext-label" aria-hidden="true">
            Extensions →
          </span>
          <div className="walt-ext-row" role="toolbar" aria-label="Extensions">
            <button
              ref={waltButtonRef}
              type="button"
              className="walt-ext walt-ext-walt"
              aria-label="Walt"
              aria-expanded={open}
              aria-haspopup="dialog"
              onClick={() => setOpen((o) => !o)}
            >
              <img src="/games/walt/icon32.png" alt="" width={16} height={16} />
            </button>
            {/* The other extensions are just pictures: only Walt does anything. */}
            {GLYPHS.map((g) => (
              <span key={g.name} className="walt-ext walt-ext-static" aria-hidden="true">
                {g.icon}
              </span>
            ))}
          </div>
        </div>

        <div className="walt-page" ref={pageRef}>
          {/* The fake tab is where you get Walt: a download button and the steps. */}
          <div className="walt-page-copy">
            <h3 className="walt-page-title">Install Walt Chrome Extension</h3>
            <div className="walt-download">
              <a className="walt-download-button" href={DOWNLOAD_HREF} download>
                Download Walt
              </a>
              <span className="walt-download-version">{version ? `Version ${version} · ` : ""}for Chrome</span>
            </div>
            <p>Then:</p>
            <ol>
              <li>Unzip it. Save the unzipped folder to Applications.</li>
              <li>
                Open <code>chrome://extensions</code> and turn on &ldquo;Developer mode&rdquo;.
              </li>
              <li>Click &ldquo;Load unpacked&rdquo; and choose your Walt Extension folder.</li>
              <li>Go to your Chrome Extension Manager and pin Walt.</li>
              <li>Click the extension to change its settings. Try it here: click Walt in the toolbar above.</li>
            </ol>
          </div>
          <img
            ref={pageBoxRef}
            className={`walt-page-box${onPage ? " is-on" : ""}`}
            src={boxUrl}
            alt={onPage ? `${box.name} box` : ""}
            draggable={false}
          />

          {open && (
            <div className="walt-popup" ref={popupRef} role="dialog" aria-label="Walt">
              <header className="walt-popup-head">
                <div className="walt-popup-brand">
                  <img src="/games/walt/icon32.png" alt="" width={18} height={18} />
                  <h3>Walt</h3>
                </div>
                <span className="walt-pill" data-mode={mode} aria-live="polite">
                  {PILL[mode]}
                </span>
              </header>

              <section className="walt-picker" aria-label="Box design">
                <div className="walt-picker-head">
                  <span>
                    Box <span className="walt-box-name">{box.name}</span>
                  </span>
                  <span className="walt-nav">
                    <button type="button" aria-label="Previous box" onClick={() => stepBox(-1, false)}>
                      <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true">
                        <path d="M6 1L1.5 6 6 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button type="button" aria-label="Next box" onClick={() => stepBox(1, false)}>
                      <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true">
                        <path d="M2 1l4.5 5L2 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </span>
                </div>
                <div className="walt-strip" ref={stripRef} role="radiogroup" aria-label="Box design" onKeyDown={onStripKey}>
                  {WALT_BOXES.map((b, i) => (
                    <button
                      key={b.id}
                      type="button"
                      className="walt-thumb"
                      role="radio"
                      aria-label={b.name}
                      aria-checked={i === boxIndex}
                      tabIndex={i === boxIndex ? 0 : -1}
                      onClick={() => setBoxIndex(i)}
                    >
                      <img src={waltBoxUrl(b.id)} alt="" />
                    </button>
                  ))}
                </div>
              </section>

              <div className="walt-stage" ref={stageRef} data-mode={mode} aria-hidden="true">
                <img ref={miniRef} src={boxUrl} alt="" />
                <span className="walt-hint">{hint}</span>
              </div>

              <fieldset className="walt-seg" aria-label="Mode">
                {(["on", "off", "detect"] as const).map((m) => (
                  <label key={m}>
                    <input type="radio" name="walt-mode" value={m} checked={mode === m} onChange={() => setMode(m)} />
                    <span>{m === "on" ? "On" : m === "off" ? "Off" : "Sleep"}</span>
                  </label>
                ))}
              </fieldset>

              <div className={`walt-delay${mode === "detect" ? "" : " is-disabled"}`}>
                <label htmlFor="walt-delay">Show after</label>
                <select
                  id="walt-delay"
                  value={delay}
                  disabled={mode !== "detect"}
                  onChange={(e) => setDelay(Number(e.target.value))}
                >
                  {DELAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="walt-size-row">
                <label htmlFor="walt-size">Size</label>
                <output htmlFor="walt-size">{size}px</output>
              </div>
              <input
                id="walt-size"
                type="range"
                min={SIZE_MIN}
                max={SIZE_MAX}
                step={1}
                value={size}
                style={{ "--fill": sizeFill } as CSSProperties}
                onChange={(e) => setSize(Number(e.target.value))}
              />

              <a className="walt-popup-get" href={DOWNLOAD_HREF} download>
                Download Walt
              </a>
            </div>
          )}
        </div>
      </div>
      <p className="walt-note">Desktop only. Walt isn't available on the Chrome Web Store due to copyright restrictions and must be installed locally.</p>
    </div>
  );
};

export default WaltDemo;
