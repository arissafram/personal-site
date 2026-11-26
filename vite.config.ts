import fs from "node:fs";
import path from "node:path";

import { defineConfig, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

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

export default defineConfig({
  plugins: [react(), publicIndexPages()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    port: 3000,
  },
});
