import "dotenv/config";
import { serve } from "@hono/node-server";
import { app, injectWebSocket } from "./lib/server";

const port = process.env.PORT || 3000;

const server = serve({
  fetch: app.fetch,
  port: Number(port),
});
injectWebSocket(server);
