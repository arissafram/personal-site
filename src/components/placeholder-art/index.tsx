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
};

export type ArtName = keyof typeof ART;

const PlaceholderArt = ({ name }: { name?: string }) =>
  name && name in ART ? ART[name as ArtName] : null;

export default PlaceholderArt;
