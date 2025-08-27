import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const requestLogs = sqliteTable("request_logs", {
    id: text("id").primaryKey(),
    timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
    method: text("method").notNull(),
    resource: text("resource"),
    tool: text("tool"),
    requestData: text("request_data"),
    responseData: text("response_data"),
    durationMs: integer("duration_ms"),
    status: text("status"),
});

export const serverState = sqliteTable("server_state", {
    key: text("key").primaryKey(),
    value: text("value"),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
