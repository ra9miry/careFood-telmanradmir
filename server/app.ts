import { Hono } from "hono";
import { auth, enabledProviders } from "./auth.js";

export const app = new Hono();

app.get("/api/providers", (c) => c.json(enabledProviders));

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
