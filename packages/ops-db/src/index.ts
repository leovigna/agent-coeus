import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema.js";

export function createDb(url: string, authToken?: string) {
    const client = createClient({ url, authToken });
    return drizzle(client, { schema });
}
