import { defineConfig } from "drizzle-kit";
import path from "path";
import { getDatabaseUrl } from "./src/connection-url";

const databaseUrl = getDatabaseUrl();

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
