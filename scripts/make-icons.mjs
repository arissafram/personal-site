// Draws the favicons and the Open Graph share image from the game row's own
// squares: Home's "AF." and each game's color and line drawing.
//
//   npm run icons
//
// Rerun it after changing a game's color, ink or art. It writes:
//   public/favicon.svg, public/favicon.ico (16 + 32 + 48),
//   public/apple-touch-icon.png (180), public/og-image.png (1200×630).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { transformWithEsbuild } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = (file) => path.join(root, "public", file);

const INK = "#111111";

// --- The games, in game-row order ------------------------------------------

const gamesDir = path.join(root, "src/games");
const games = fs
  .readdirSync(gamesDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(gamesDir, f), "utf8")))
  .sort((a, b) => a.order - b.order);

// --- The line drawings, from the site's own PlaceholderArt component --------

const artSource = path.join(root, "src/components/placeholder-art/index.tsx");
const { code } = await transformWithEsbuild(fs.readFileSync(artSource, "utf8"), artSource, {
  jsx: "automatic",
  format: "esm",
});
// Written inside node_modules so its `react/jsx-runtime` import resolves.
const artModule = path.join(root, "node_modules/.cache/make-icons/placeholder-art.mjs");
fs.mkdirSync(path.dirname(artModule), { recursive: true });
fs.writeFileSync(artModule, code);
const { default: PlaceholderArt } = await import(pathToFileURL(artModule).href);

/** The game's drawing as SVG markup, placed at (x, y) and `size` px square. */
const art = (name, ink, x, y, size) =>
  renderToStaticMarkup(createElement(PlaceholderArt, { name }))
    .replace(/currentColor/g, ink)
    .replace("<svg ", `<svg x="${x}" y="${y}" width="${size}" height="${size}" `);

// --- "AF." as shapes, so it never depends on a font being installed --------
// Drawn on Helvetica Bold's proportions: cap height 100, stems about 20.

const MARK_WIDTH = 203;
const MARK_HEIGHT = 100;
const MARK_PATH = [
  // A, with its counter cut out (evenodd)
  "M0 100L36 0H64L100 100H79L71.8 80H28.2L21 100Z",
  "M50 19.4L65.3 62H34.7Z",
  // F
  "M106 0H176V17H126V42H168V58H126V100H106Z",
  // .
  "M183 80H203V100H183Z",
].join("");

/** "AF." `width` px wide, centered on (cx, cy). */
const mark = (cx, cy, width, fill = INK) => {
  const s = width / MARK_WIDTH;
  const x = cx - width / 2;
  const y = cy - (MARK_HEIGHT * s) / 2;
  return `<path transform="translate(${+x.toFixed(2)} ${+y.toFixed(2)}) scale(${+s.toFixed(4)})" fill="${fill}" fill-rule="evenodd" d="${MARK_PATH}"/>`;
};

// --- Favicon: the Home square ----------------------------------------------

// How wide "AF." is in the square, with and without the border.
const BORDERED = 0.72;
const PLAIN = 0.9;

/** A white square with a black border and "AF.". */
const homeSquare = (size, { border = true } = {}) => {
  const b = border ? Math.max(1, size / 16) : 0;
  const markWidth = size * (border ? BORDERED : PLAIN);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  ${border ? `<rect x="${b / 2}" y="${b / 2}" width="${size - b}" height="${size - b}" fill="none" stroke="${INK}" stroke-width="${b}"/>` : ""}
  ${mark(size / 2, size / 2, markWidth)}
</svg>
`;
};

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: 72 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** An .ico holding PNG images (supported by every current browser). */
const ico = (images) => {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4); // color planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((img) => img.data)]);
};

// The SVG is drawn on a 32 grid, so its 2px border lands on whole pixels in
// a retina tab. At 16px the border crowds the letters, so a media query (which
// in an SVG image tests the size it is drawn at) swaps in plain, larger "AF.".
fs.writeFileSync(
  pub("favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <style>.small{display:none}@media (max-width:24px){.big{display:none}.small{display:inline}}</style>
  <rect width="32" height="32" fill="#ffffff"/>
  <g class="big">
    <rect x="1" y="1" width="30" height="30" fill="none" stroke="${INK}" stroke-width="2"/>
    ${mark(16, 16, 32 * BORDERED)}
  </g>
  <g class="small">${mark(16, 16, 32 * PLAIN)}</g>
</svg>
`
);

// At 16px the border crowds the letters, so the smallest .ico image is plain.
const icoImages = [
  { size: 16, data: await png(homeSquare(16 * 8, { border: false }), 16) },
  { size: 32, data: await png(homeSquare(32), 32) },
  { size: 48, data: await png(homeSquare(48), 48) },
];
fs.writeFileSync(pub("favicon.ico"), ico(icoImages));

// iOS rounds the corners itself, so no border on the touch icon.
await sharp(Buffer.from(homeSquare(180, { border: false })))
  .png({ compressionLevel: 9 })
  .toFile(pub("apple-touch-icon.png"));

// --- Open Graph image: the six squares, edge to edge ------------------------

const W = 1200;
const H = 630;
const COLS = 3;
const ROWS = 2;
const tileW = W / COLS;
const tileH = H / ROWS;
const artSize = tileH * 0.62;
const RULE = 2;

const tiles = [{ color: "#ffffff", ink: INK, mark: true }, ...games];

const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
${tiles
  .map((t, i) => {
    const x = (i % COLS) * tileW;
    const y = Math.floor(i / COLS) * tileH;
    const cx = x + tileW / 2;
    const cy = y + tileH / 2;
    return [
      `<rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" fill="${t.color}"/>`,
      t.mark
        ? mark(cx, cy, artSize * 0.95, t.ink)
        : art(t.art, t.ink, cx - artSize / 2, cy - artSize / 2, artSize),
    ].join("\n");
  })
  .join("\n")}
<path fill="none" stroke="${INK}" stroke-width="${RULE}" d="${[
  ...Array.from({ length: COLS - 1 }, (_, c) => `M${(c + 1) * tileW} 0V${H}`),
  ...Array.from({ length: ROWS - 1 }, (_, r) => `M0 ${(r + 1) * tileH}H${W}`),
].join("")}"/>
</svg>
`;

await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(pub("og-image.png"));

console.log("Wrote favicon.svg, favicon.ico, apple-touch-icon.png and og-image.png in public/");
