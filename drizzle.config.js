import { defineConfig } from 'drizzle-kit';
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
    throw new Error("DATABASE_URL is not set");
export default defineConfig({
    schema: './src/lib/db/schema.ts',
    dbCredentials: {
        url: databaseUrl,
    },
    verbose: true,
    strict: true,
    dialect: 'postgresql'
});
