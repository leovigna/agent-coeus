import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "./user.js";

export const integrationTwentyCRM = sqliteTable("integration_twenty_crm", {
    id: text("id").primaryKey(),
    owner: text("owner").notNull().references(() => users.id),
    apiUrl: text("api_url").notNull(),
    apiKey: text("api_key").notNull(),
});
