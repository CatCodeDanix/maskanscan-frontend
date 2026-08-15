import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const rawDbUrl = process.env.DATABASE_URL || "";
// Explicitly use sslmode=verify-full to comply with modern pg-connection-string v3 semantics
const connectionString = rawDbUrl.includes("sslmode=require")
	? rawDbUrl.replace("sslmode=require", "sslmode=verify-full")
	: rawDbUrl;

declare global {
	var __pg_pool: Pool | undefined;
}

const pool =
	globalThis.__pg_pool ??
	new Pool({
		connectionString,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 5000,
	});

if (process.env.NODE_ENV !== "production") {
	globalThis.__pg_pool = pool;
}

export const db = drizzle(pool);
