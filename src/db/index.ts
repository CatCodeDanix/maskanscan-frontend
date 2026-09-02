import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || "";

declare global {
	var __pg_pool: Pool | undefined;
}

const pool =
	globalThis.__pg_pool ??
	new Pool({
		connectionString,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 15000,
	});

if (process.env.NODE_ENV !== "production") {
	globalThis.__pg_pool = pool;
}

export const db = drizzle(pool);
