// One JSON file per game lives in this folder (e.g. walt.json). Adding a file
// adds a slide and a game-row item; they are sorted by `order`.

export interface Game {
  slug: string;
  name: string;
  order: number;
  /** Slide background. */
  color: string;
  /** Text color on the slide: "#111111" or "#ffffff". */
  ink: string;
  /** Square image for the slide and the game row. Leave out until it exists. */
  image?: string;
  /** Placeholder drawing (see components/placeholder-art) shown while there is no image. */
  art?: string;
  link: { label: string; href: string };
  /** Kept in the data; nothing on the page shows it. */
  status: string;
}

const modules = import.meta.glob<Game>("./*.json", {
  eager: true,
  import: "default",
});

export const GAMES: Game[] = Object.values(modules).sort(
  (a, b) => a.order - b.order
);
