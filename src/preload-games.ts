// Fetch the puzzle photo shortly after the page loads, while the browser is
// idle, so the photo shown before the puzzle mounts is ready. (The games
// themselves mount in the background; see their components.)

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
