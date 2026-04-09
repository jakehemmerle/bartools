import { Hono } from "hono";
import { greet } from "@bartools/ui";

const app = new Hono();

app.get("/", (c) => c.text(greet("bartools")));
app.get("/health", (c) => c.json({ ok: true }));

export default {
  port: 3000,
  fetch: app.fetch,
};
