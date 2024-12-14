import { defineConfig } from 'drizzle-kit';

const databaseUrl = Deno.env.get('DATABASE_URL');
if (!databaseUrl) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './lib/db/schema.ts',

	dbCredentials: {
		url: databaseUrl,
	},

	verbose: true,
	strict: true,
	dialect: 'postgresql'
});
