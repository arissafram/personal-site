import { useEffect, type CSSProperties } from "react";

import GameRows, { type GameRowItem } from "./components/game-row";
import GameSlide from "./components/game-slide";
import Home from "./components/home";
import { GAMES } from "./games";
import { useCarousel } from "./hooks/use-carousel";

import "./index.css";

const HOME: GameRowItem = {
  slug: "home",
  name: "Home",
  color: "#ffffff",
  ink: "#111111",
  mark: "AF.",
};

const ITEMS: GameRowItem[] = [HOME, ...GAMES];
const SLUGS = ITEMS.map((item) => item.slug);

const App = () => {
  const { trackRef, current, go } = useCarousel(SLUGS);

  // In landscape, phones paint the strips beside the notch (and their toolbar
  // tint) from the page's own background and theme color, sampled when the
  // page loads. Keep both on the current slide's color so the edges follow it.
  useEffect(() => {
    const color = ITEMS[current]?.color ?? "#ffffff";
    document.documentElement.style.backgroundColor = color;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [current]);

  return (
    <>
      <main className="track" ref={trackRef} aria-label="Arissa Fram, home and games">
        <section className="slide slide-home" id="home" aria-label="Home">
          <div className="slide-scroll">
            <Home />
          </div>
        </section>
        {GAMES.map((game) => (
          <section
            key={game.slug}
            className="slide"
            id={game.slug}
            aria-label={game.name}
            style={{ "--slide-bg": game.color, "--slide-ink": game.ink } as CSSProperties}
          >
            <div className="slide-scroll">
              <GameSlide game={game} />
            </div>
          </section>
        ))}
      </main>
      <GameRows items={ITEMS} current={current} onSelect={go} trackRef={trackRef} />
    </>
  );
};

export default App;
