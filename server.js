import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 3000);

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".md", "text/markdown; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
]);

const REWRITES = [
  { source: "/gallery", destination: "/gallery.html" },
  { source: "/quotes", destination: "/quotes.html" },
  { source: "/companion", destination: "/companion.html" },
  { source: "/affinity", destination: "/affinity.html" },
];

const AI_DIR = path.join(__dirname, "assets", "gallery", "ai");
const AI_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

async function listAiImages() {
  try {
    const entries = await fs.readdir(AI_DIR, { withFileTypes: true });
    const images = entries
      .filter((e) => e.isFile() && AI_EXTS.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
      .map((name) => ({
        id: `ai-${name}`,
        // 标题/说明由前端合并 ai-gallery.js；此处只提供扫描到的路径
        title: name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
        caption: "",
        src: `./assets/gallery/ai/${name}`,
      }));
    return images;
  } catch {
    return [];
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const rawUrl = req.url || "/";
    const urlPath = decodeURIComponent(rawUrl.split("?")[0]);

    if (urlPath === "/api/ai-images") {
      const images = await listAiImages();
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify({ images }));
      return;
    }

    const rewrite = REWRITES.find((r) => r.source === urlPath);
    const requestPath =
      urlPath === "/"
        ? "/index.html"
        : rewrite
        ? rewrite.destination
        : urlPath;
    const safePath = path.normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, "");
    const filePath = path.join(__dirname, safePath);
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes.get(ext) || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`Amanogawa Saya site is running at http://localhost:${port}`);
});
