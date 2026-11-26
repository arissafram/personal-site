import type { ComponentType } from "react";

import type { Game } from "../../games";

import JigsawDemo from "../jigsaw-demo";
import MikesDemo from "../mikes-demo";
import PlaceholderArt from "../placeholder-art";
import WaltDemo from "../walt-demo";

import "./styles.css";

// Games whose JSON sets `"demo": "<name>"` show this component instead of
// their image.
const DEMOS: Record<string, ComponentType> = {
  walt: WaltDemo,
  mikes: MikesDemo,
  jigsaw: JigsawDemo,
};

const isExternal = (href: string) => /^https?:/.test(href);
const externalProps = (href: string) =>
  isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

// Turns `[text](url)` in a description into links; the rest stays plain text.
const renderDescription = (text: string) =>
  text.split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return m ? (
      <a key={i} href={m[2]} {...externalProps(m[2])}>
        {m[1]}
      </a>
    ) : (
      part
    );
  });

// One game's slide content: a large square image on the left, the name and one
// link on the right. Colors come from the slide's `ink` (set on the section).
const GameSlide = ({ game }: { game: Game }) => {
  const Demo = game.demo ? DEMOS[game.demo] : undefined;

  return (
    <div className={`game-slide${Demo ? ` game-slide-has-demo game-slide-demo-${game.demo}` : ""}`}>
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
        {game.description && (
          <p className="game-slide-description">{renderDescription(game.description)}</p>
        )}
        <div className="game-slide-links">
          {[game.link, ...(game.links ?? [])].map((link) => (
            <a key={link.href} className="game-slide-link" href={link.href} {...externalProps(link.href)}>
              {link.label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSlide;
