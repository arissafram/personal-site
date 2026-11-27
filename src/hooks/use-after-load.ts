import { useEffect, useState } from "react";

/**
 * False until the page has loaded and the browser has had an idle moment,
 * then true. Games use it to mount in the background, so they're already
 * there when someone arrives at their slide.
 */
export const useAfterLoad = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const wait = () => {
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(() => setReady(true), { timeout: 3000 });
      else timeoutId = setTimeout(() => setReady(true), 500);
    };
    if (document.readyState === "complete") wait();
    else window.addEventListener("load", wait, { once: true });
    return () => {
      window.removeEventListener("load", wait);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);
  return ready;
};
