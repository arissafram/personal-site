import type { Game } from "../../games";

import "./styles.css";

// One game's slide content: a large square image on the left, the name and one
// link on the right. Colors come from the slide's `ink` (set on the section).
const GameSlide = ({ game }: { game: Game }) => {
  return (
    <div className="game-slide">
      <div className="game-slide-image">
        {game.image ? (
          <img src={game.image} alt={game.name} />
        ) : (
          <span className="game-slide-tag">mockup</span>
        )}
      </div>
      <div className="game-slide-text">
        <h2 className="game-slide-name">{game.name}</h2>
        <a className="game-slide-link" href={game.link.href}>
          {game.link.label} →
        </a>
      </div>
    </div>
  );
};

export default GameSlide;
