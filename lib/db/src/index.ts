import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { getDatabaseUrl } from "./connection-url";
import * as schema from "./schema";

const { Pool } = pg;
const databaseUrl = getDatabaseUrl();

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

export * from "./schema";
