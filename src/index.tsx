import type { CSSProperties } from "react";

import GameRow, { type GameRowItem } from "./components/game-row";
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

  return (
    <>
      <main className="track" ref={trackRef} aria-label="Arissa Fram, home and games">
        <section className="slide slide-home" id="home" aria-label="Home">
          <Home />
        </section>
        {GAMES.map((game) => (
          <section
            key={game.slug}
            className="slide"
            id={game.slug}
            aria-label={game.name}
            style={{ "--slide-bg": game.color, "--slide-ink": game.ink } as CSSProperties}
          >
            {/* Game slide content (image, name, link) comes in step 2. */}
          </section>
        ))}
      </main>
      <GameRow items={ITEMS} current={current} onSelect={go} />
    </>
  );
};

export default App;
