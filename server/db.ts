import { LibsqlDialect } from "@libsql/kysely-libsql";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { env } from "./env.js";

if (env.databaseUrl.startsWith("file:")) {
  mkdirSync(dirname(env.databaseUrl.slice("file:".length)), { recursive: true });
}

export const dialect = new LibsqlDialect({
  url: env.databaseUrl,
  authToken: env.databaseAuthToken,
});
