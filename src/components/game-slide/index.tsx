import { memo, type ComponentType } from "react";

import type { Game } from "../../games";

import FreeSoloDemo from "../free-solo-demo";
import JigsawDemo from "../jigsaw-demo";
import MagneticPoemDemo from "../magnetic-poem-demo";
import HotDogRunDemo from "../hot-dog-run-demo";
import PlaceholderArt from "../placeholder-art";
import ScoreFourDemo from "../score-four-demo";
import WaltDemo from "../walt-demo";

import "./styles.css";

// Games whose JSON sets `"demo": "<name>"` show this component instead of
// their image.
const DEMOS: Record<string, ComponentType> = {
  walt: WaltDemo,
  "hot-dog-run": HotDogRunDemo,
  jigsaw: JigsawDemo,
  "score-four": ScoreFourDemo,
  "free-solo": FreeSoloDemo,
  "magnetic-poem": MagneticPoemDemo,
};

const isExternal = (href: string) => /^https?:/.test(href);
const externalProps = (href: string) =>
  isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

// Turns `[text](url)` in a description into links and `*text*` into italics;
// the rest stays plain text.
const renderDescription = (text: string) =>
  text.split(/(\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link)
      return (
        <a key={i} href={link[2]} {...externalProps(link[2])}>
          {link[1]}
        </a>
      );
    const em = part.match(/^\*([^*]+)\*$/);
    return em ? <em key={i}>{em[1]}</em> : part;
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

// The slides don't change when the current slide does, so they skip the
// re-render the carousel does on every slide change.
export default memo(GameSlide);
