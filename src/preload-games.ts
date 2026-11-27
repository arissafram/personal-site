// Fetch the puzzle photo and Free Solo's code shortly after the page loads,
// one at a time while the browser is idle. The games still start only once the
// carousel comes to rest on their slide, but by then there's nothing left to
// download, so they appear right away instead of after a wait. (Dogs and
// Score Four load themselves in the background; see their components.)

const idle = () =>
  new Promise<void>((resolve) => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 2000 });
    else setTimeout(resolve, 200);
  });

const loadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.src = src;
    img.decode().then(resolve, resolve);
  });

const STEPS: (() => Promise<unknown>)[] = [
  () => loadImage("/puzzle.jpg"),
  () => import("free-solo"),
];

export const preloadGames = () => {
  const run = async () => {
    for (const step of STEPS) {
      await idle();
      // A failed preload is fine: the slide loads it again when it's needed.
      await step().catch(() => {});
    }
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", () => run(), { once: true });
};
