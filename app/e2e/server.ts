// Serves the production build under /ebbline2/, the way a GitHub Pages project site would.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../build/site/", import.meta.url));
const port = Number(process.env["PORT"] ?? 4391);
const prefix = "/ebbline2/";
const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

createServer((request, response) => {
  const path = new URL(request.url ?? "/", "http://localhost").pathname;
  if (!path.startsWith(prefix)) {
    response.writeHead(404).end();
    return;
  }
  const relative = normalize(path.slice(prefix.length) || "index.html");
  if (relative.startsWith("..")) {
    response.writeHead(403).end();
    return;
  }
  readFile(join(root, relative)).then(
    (body) => {
      response.writeHead(200, { "content-type": types[extname(relative)] ?? "application/octet-stream" });
      response.end(body);
    },
    () => {
      response.writeHead(404).end();
    },
  );
}).listen(port);
