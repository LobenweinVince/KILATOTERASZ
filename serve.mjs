// Helyi előnézet:  node serve.mjs  ->  http://localhost:8080  (előtte: node build.mjs --allow-placeholders)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
const root = join(new URL(".", import.meta.url).pathname, "dist");
import { readFileSync } from "node:fs";
// A _headers fájl "/*" blokkját is alkalmazza, hogy a helyi előnézet a CSP-t is tesztelje.
let star = {}; try { const blk = readFileSync(join(root, "_headers"), "utf8").split(/\n(?=\S)/).find((b) => b.startsWith("/*")); for (const l of blk.split("\n").slice(1)) { const i = l.indexOf(":"); if (i > 0) star[l.slice(0, i).trim()] = l.slice(i + 1).trim(); } } catch {}
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".mp4": "video/mp4", ".webm": "video/webm", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain", ".webmanifest": "application/manifest+json" };
createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname); if (p.endsWith("/")) p += "index.html";
  try { const f = join(root, p); if (!f.startsWith(root)) throw 0; const data = await readFile(f); res.writeHead(200, { ...star, "Content-Type": types[extname(f)] || "application/octet-stream" }); res.end(data); }
  catch { res.writeHead(404, { ...star, "Content-Type": "text/html; charset=utf-8" }); res.end(await readFile(join(root, "404.html"))); }
}).listen(Number(process.env.PORT) || 8080, () => console.log("http://localhost:" + (process.env.PORT || 8080)));
