import { useEffect, useRef, useState } from "react";
import { MagneticPoem, type MagneticPoemHandle, type MagneticPoemStatusInfo } from "magnetic-poem";
import "magnetic-poem/styles";

import { useAfterLoad } from "../../hooks/use-after-load";
import { useSlideSettle } from "../../hooks/use-slide-settle";
import { addFillers, knicksWords } from "../../poem-words";
import { POEM_ENDPOINT } from "./endpoint";

import "./styles.css";

// The shared word-magnet poem. The package draws only the words; the Save
// button, the messages beside it (saving, errors, conflicts) and the caption
// under the board are drawn here from onStatusChange.
//
// The poem is fetched when the component mounts, so it mounts in the
// background once the page has loaded (or as soon as the carousel rests on
// its slide, if that comes first), like the other games.
const MagneticPoemDemo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const poem = useRef<MagneticPoemHandle>(null);
  const settle = useSlideSettle(ref);
  const afterLoad = useAfterLoad();
  const [shown, setShown] = useState(false);
  if ((settle === "here" || afterLoad) && !shown) setShown(true);
  const [info, setInfo] = useState<MagneticPoemStatusInfo>({ status: "loading", dirty: false, canSave: false });

  // The package keeps pointer and touch events from reaching the carousel, so
  // dragging a word doesn't swipe the slide; that also hides them from React
  // here, hence a native listener. After a word is dragged or a button
  // clicked, let go of focus so ← → move the carousel instead of nudging the
  // word. Keyboard users still Tab to a word and nudge it with the arrows.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onPointerUp = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (active instanceof HTMLElement && el.contains(active)) active.blur();
      }, 0);
    };
    el.addEventListener("pointerup", onPointerUp, { capture: true });
    return () => el.removeEventListener("pointerup", onPointerUp, { capture: true });
  }, []);

  const { status } = info;

  return (
    <div className="magnetic-poem-demo" ref={ref}>
      <div className="magnetic-poem-demo-bar">
        <button
          type="button"
          className="magnetic-poem-demo-save"
          disabled={!info.canSave}
          onClick={() => poem.current?.save()}
        >
          Save
        </button>
        <p className="magnetic-poem-demo-status" role="status">
          {status === "saving" && "Saving…"}
          {status === "save-error" && "Couldn't save. Try again in a moment."}
          {status === "load-error" && (
            <>
              Couldn't load the poem.{" "}
              <button type="button" className="magnetic-poem-demo-link" onClick={() => poem.current?.reload()}>
                Try again
              </button>
            </>
          )}
          {status === "conflict" && (
            <>
              Someone saved a new poem.{" "}
              <button type="button" className="magnetic-poem-demo-link" onClick={() => poem.current?.loadLatest()}>
                Load latest
              </button>
            </>
          )}
        </p>
        {/* ↻: the same icon as the jigsaw's refresh. It loads the saved poem
            again, dropping unsaved moves and picking up anyone else's save. */}
        <button
          type="button"
          className="magnetic-poem-demo-refresh"
          title="Load the saved poem"
          aria-label="Load the saved poem"
          disabled={status === "loading" || status === "saving"}
          onClick={() => poem.current?.reload()}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>
      {shown ? (
        <MagneticPoem
          ref={poem}
          words={knicksWords}
          addFillers={addFillers}
          endpoint={POEM_ENDPOINT}
          onStatusChange={setInfo}
          magnetSize={1.28}
        />
      ) : (
        <div className="magnetic-poem-demo-placeholder" aria-hidden="true" />
      )}
      <p className="magnetic-poem-demo-caption">
        Drag and drop the magnets then click save.
      </p>
    </div>
  );
};

export default MagneticPoemDemo;
