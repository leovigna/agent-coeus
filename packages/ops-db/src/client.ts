import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { DB_FILE_NAME } from "./envvars.js";

const client = createClient({ url: DB_FILE_NAME });
export const db = drizzle(client);
