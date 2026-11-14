// Local dev server: serves the static site and the /api/storyboard function.
// Usage: ANTHROPIC_API_KEY=... npm run dev   (works without a key; the movie uses the built-in storyboard)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };
const port = Number(process.env.PORT) || 3000;

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/storyboard") {
    let raw = ""; for await (const c of req) raw += c;
    try { req.body = JSON.parse(raw || "{}"); } catch { req.body = null; }
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); return res; };
    const { default: handler } = await import(path.join(root, "api/storyboard.js"));
    return handler(req, res);
  }
  let p = path.join(root, decodeURIComponent(url.pathname));
  if (!p.startsWith(root)) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  fs.readFile(p, (err, data) => {
    if (err) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", types[path.extname(p)] || "application/octet-stream");
    res.end(data);
  });
}).listen(port, () => console.log(`Doodle Words on http://localhost:${port}`));
