// Simple line drawings shown until a game's real image exists. Each game's JSON
// can name one with `"art"`. They draw in currentColor, so they follow `ink`.
const ART = {
  box: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <rect x="34" y="40" width="32" height="32" />
      <path d="M20 90h60" />
      <path d="M50 30v-10M40 32l-6-8M60 32l6-8" strokeWidth="2" />
    </svg>
  ),
  dots: (
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <circle cx="30" cy="30" r="8" />
      <circle cx="70" cy="30" r="8" />
      <circle cx="50" cy="55" r="8" />
      <circle cx="30" cy="78" r="8" />
      <circle cx="70" cy="78" r="8" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <rect x="14" y="14" width="72" height="72" />
      <path d="M38 14v72M62 14v72M14 38h72M14 62h72" />
    </svg>
  ),
  // A 4×4 board of rings with two filled pieces on the lower diagonal.
  four: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      {[0, 1, 2, 3].flatMap((r) =>
        [0, 1, 2, 3].map((c) => (
          <circle
            key={`${r}-${c}`}
            cx={20 + c * 20}
            cy={20 + r * 20}
            r="6"
            fill={r > 1 && c === r - 1 ? "currentColor" : undefined}
          />
        ))
      )}
    </svg>
  ),
  wall: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M10 90 L34 40 L46 58 L62 18 L90 90 Z" />
      <circle cx="58" cy="44" r="3" fill="currentColor" />
    </svg>
  ),
  // Three word magnets, a little crooked.
  words: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <rect x="14" y="22" width="44" height="16" transform="rotate(-4 36 30)" />
      <rect x="40" y="44" width="46" height="16" transform="rotate(3 63 52)" />
      <rect x="20" y="66" width="34" height="16" transform="rotate(-2 37 74)" />
    </svg>
  ),
};

export type ArtName = keyof typeof ART;

const PlaceholderArt = ({ name }: { name?: string }) =>
  name && name in ART ? ART[name as ArtName] : null;

export default PlaceholderArt;
