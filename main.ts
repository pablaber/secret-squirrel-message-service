import '@std/dotenv/load';
import server from "./lib/server.ts";

Deno.serve(server.fetch);
