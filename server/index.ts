import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync, readFileSync } from "node:fs";
import { app } from "./app.js";
import { env } from "./env.js";

const distDir = "./dist";
if (existsSync(distDir)) {
  const indexHtml = readFileSync(`${distDir}/index.html`, "utf8");
  app.use("/*", serveStatic({ root: distDir }));
  app.get("*", (c) => c.html(indexHtml));
}

serve({ fetch: app.fetch, port: env.port }, ({ port }) => {
  console.log(`API ready on http://localhost:${port}`);
});
