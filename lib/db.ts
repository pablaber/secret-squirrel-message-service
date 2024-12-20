import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({ connectionString }),
  schema: { ...schema },
});
