import { defineConfig } from "drizzle-kit";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    out: "./drizzle",
    schema: "./src/schema",
    dialect: "sqlite",
    dbCredentials: {
        url: process.env.DB_FILE_NAME!,
    },
});
