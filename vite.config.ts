import fs from "node:fs";
import path from "node:path";

import { defineConfig, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { handlePoemRequest, memoryStorage } from "magnetic-poem/server";
import sharp from "sharp";

import { addFillers, knicksWords } from "./src/poem-words";

// Walt's box PNGs come from the walt-extension package at 900px wide
// (0.5–1 MB each). The demo never draws them wider than about 220px, so the
// build shrinks them to 480px (enough for 2x screens), about 10x smaller.
// Dev serves the originals.
const WALT_BOX_WIDTH = 480;
const shrinkWaltBoxes = (): Plugin => ({
  name: "shrink-walt-boxes",
  apply: "build",
  async generateBundle(_options, bundle) {
    const isWaltBox = (name: string) => /walt-extension[\\/]boxes[\\/][^\\/]+\.png$/.test(name);
    for (const asset of Object.values(bundle)) {
      if (asset.type !== "asset" || !asset.originalFileNames.some(isWaltBox)) continue;
      asset.source = await sharp(asset.source)
        .resize({ width: WALT_BOX_WIDTH, withoutEnlargement: true })
        .png({ compressionLevel: 9, effort: 10 })
        .toBuffer();
    }
  },
});

// Serve folders in public/ that have their own index.html (like public/walt/,
// Walt's download page) the way the live host does. Without this, Vite's dev
// and preview servers answer /walt/ with the site's own index.html.
const publicIndexPages = (): Plugin => {
  const middleware =
    (publicDir: string): Connect.NextHandleFunction =>
    (req, res, next) => {
      const [pathname, query = ""] = (req.url ?? "").split("?");
      if (pathname === "/" || path.extname(pathname)) return next();
      const dir = pathname.replace(/\/$/, "");
      if (!fs.existsSync(path.join(publicDir, dir, "index.html"))) return next();
      if (!pathname.endsWith("/")) {
        // Keep relative links on that page (walt.zip, box.png) working.
        res.statusCode = 301;
        res.setHeader("Location", `${dir}/${query ? `?${query}` : ""}`);
        return res.end();
      }
      req.url = `${dir}/index.html${query ? `?${query}` : ""}`;
      next();
    };
  return {
    name: "public-index-pages",
    configureServer(server) {
      server.middlewares.use(middleware(server.config.publicDir));
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware(path.resolve(server.config.root, server.config.build.outDir)));
    },
  };
};

// The magnetic poem's save endpoint, for `npm run dev` and `npm run preview`.
// Live, the poem is saved by a Lambda (amplify/functions/poem) whose URL the
// slide reads from amplify_outputs.json; without that file it falls back to
// /api/poem, answered here with the same handler and words, kept in memory
// (so a restart clears the poem).
const poemApi = (): Plugin => {
  const storage = memoryStorage();
  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    const [pathname] = (req.url ?? "").split("?");
    if (pathname !== "/api/poem") return next();
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const hasBody = req.method !== "GET" && req.method !== "HEAD";
      const request = new Request(`http://${req.headers.host ?? "localhost"}${req.url}`, {
        method: req.method,
        headers: Object.entries(req.headers).flatMap(([k, v]) =>
          v === undefined ? [] : (Array.isArray(v) ? v : [v]).map((value): [string, string] => [k, value])
        ),
        body: hasBody ? Buffer.concat(chunks) : undefined,
      });
      const response = await handlePoemRequest(request, { words: knicksWords, addFillers, storage });
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      next(error);
    }
  };
  return {
    name: "poem-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
};

export default defineConfig({
  plugins: [react(), publicIndexPages(), shrinkWaltBoxes(), poemApi()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    port: 3000,
  },
  // walt-extension finds its box PNGs next to its own index.js
  // (new URL("./boxes/…", import.meta.url)). Pre-bundling would move that
  // file into .vite/deps and break those URLs in dev, so serve it as is.
  optimizeDeps: {
    exclude: ["walt-extension"],
  },
});
