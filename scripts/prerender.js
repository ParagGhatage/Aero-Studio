/**
 * Prerender Script for Aero Studio
 *
 * Runs AFTER `vite build`. It spins up a local static server on the dist/
 * folder, visits each SEO-critical route with Puppeteer, waits for React
 * to render, then saves the fully-rendered HTML back to dist/.
 *
 * This gives Googlebot real content on first load — no JS execution needed.
 *
 * Usage:  node scripts/prerender.js
 */

import { launch } from "puppeteer";
import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import handler from "serve-handler";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");
const PORT = 4173;

// Routes to prerender — marketing pages + SEO-valuable tool pages
const ROUTES = [
  "/",
  "/features",
  "/about",
  "/privacy",
  "/docs",
  "/images",
  "/images/compress",
  "/images/crop",
  "/images/gallery",
];

async function startServer() {
  const server = createServer((req, res) => {
    return handler(req, res, {
      public: DIST_DIR,
      rewrites: [{ source: "**", destination: "/index.html" }],
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`  📦 Static server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function prerender() {
  console.log("\n🚀 Prerendering SEO pages...\n");

  const server = await startServer();

  const browser = await launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let successCount = 0;

  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();

      // Block unnecessary resources for faster rendering
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const type = req.resourceType();
        if (["image", "media", "font"].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      const url = `http://localhost:${PORT}${route}`;
      await page.goto(url, { waitUntil: "networkidle0", timeout: 15000 });

      // Wait a bit for React Helmet to update <head>
      await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

      // Get the fully rendered HTML
      let html = await page.content();

      // Remove the service worker registration script from prerendered pages
      // (it will be re-added by the browser when JS loads)
      html = html.replace(
        /<script id="vite-plugin-pwa:register-sw"[^>]*><\/script>/g,
        ""
      );

      // --- Clean up duplicate <head> tags ---
      // React Helmet injects page-specific tags, but the original hardcoded ones
      // from index.html remain. We need to deduplicate so Google sees only one.

      // For <title>: Helmet prepends its tag, so keep only the FIRST <title>
      const titleMatches = html.match(/<title>[^<]*<\/title>/g);
      if (titleMatches && titleMatches.length > 1) {
        // Remove all but the first title tag
        let firstSkipped = false;
        html = html.replace(/<title>[^<]*<\/title>/g, (match) => {
          if (!firstSkipped) {
            firstSkipped = true;
            return match; // keep the first (Helmet-injected) one
          }
          return ""; // remove subsequent duplicates
        });
      }

      // For <meta name="description">: keep only the LAST one (Helmet appends)
      const descMatches = html.match(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/g
      );
      if (descMatches && descMatches.length > 1) {
        let count = 0;
        const total = descMatches.length;
        html = html.replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/g,
          (match) => {
            count++;
            return count === total ? match : ""; // keep only the last one
          }
        );
      }

      // For OG/Twitter image tags: keep only the LAST of each (Helmet-injected)
      for (const attr of [
        'property="og:image"',
        'name="twitter:image"',
        'property="og:image:alt"',
      ]) {
        const pattern = new RegExp(
          `<meta\\s+${attr.replace(/"/g, '"')}\\s+content="[^"]*"\\s*/?>`,
          "g"
        );
        const matches = html.match(pattern);
        if (matches && matches.length > 1) {
          let count = 0;
          const total = matches.length;
          html = html.replace(pattern, (match) => {
            count++;
            return count === total ? match : "";
          });
        }
      }

      // Determine output path
      const outputDir =
        route === "/"
          ? DIST_DIR
          : join(DIST_DIR, ...route.split("/").filter(Boolean));

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      const outputFile = join(outputDir, "index.html");
      writeFileSync(outputFile, html, "utf-8");

      console.log(`  ✅ ${route} → ${outputFile.replace(DIST_DIR, "dist")}`);
      successCount++;

      await page.close();
    } catch (err) {
      console.error(`  ❌ ${route} — ${err.message}`);
    }
  }

  await browser.close();
  server.close();

  console.log(
    `\n🎉 Prerendered ${successCount}/${ROUTES.length} pages successfully.\n`
  );
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
