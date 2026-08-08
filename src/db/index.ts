import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

const rawDbUrl = process.env.DATABASE_URL || "";
// Explicitly use sslmode=verify-full to comply with modern pg-connection-string v3 semantics
const connectionString = rawDbUrl.includes("sslmode=require")
	? rawDbUrl.replace("sslmode=require", "sslmode=verify-full")
	: rawDbUrl;

export const db = drizzle(connectionString);
