import type { ComponentType } from "react";

import type { Game } from "../../games";

import PlaceholderArt from "../placeholder-art";
import WaltDemo from "../walt-demo";

import "./styles.css";

// Games whose JSON sets `"demo": "<name>"` show this component instead of
// their image.
const DEMOS: Record<string, ComponentType> = {
  walt: WaltDemo,
};

// One game's slide content: a large square image on the left, the name and one
// link on the right. Colors come from the slide's `ink` (set on the section).
const GameSlide = ({ game }: { game: Game }) => {
  const Demo = game.demo ? DEMOS[game.demo] : undefined;

  return (
    <div className={`game-slide${Demo ? " game-slide-has-demo" : ""}`}>
      {Demo ? (
        <Demo />
      ) : (
        <div className="game-slide-image">
          {game.image ? (
            <img src={game.image} alt={game.name} />
          ) : (
            <>
              <span className="game-slide-tag">mockup</span>
              <PlaceholderArt name={game.art} />
            </>
          )}
        </div>
      )}
      <div className="game-slide-text">
        <h2 className="game-slide-name">{game.name}</h2>
        <a
          className="game-slide-link"
          href={game.link.href}
          {...(/^https?:/.test(game.link.href) && { target: "_blank", rel: "noopener noreferrer" })}
        >
          {game.link.label} →
        </a>
      </div>
    </div>
  );
};

export default GameSlide;
