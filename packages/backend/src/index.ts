import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello from bartools backend"));
app.get("/health", (c) => c.json({ ok: true }));

export default {
  port: 3000,
  fetch: app.fetch,
};
