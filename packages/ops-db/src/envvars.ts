import { config } from "dotenv";
config();

export const DB_FILE_NAME = process.env.DB_FILE_NAME ?? "file:local.db";
