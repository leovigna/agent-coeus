import { config } from "dotenv";

config();

export const LOGTO_TENANT_ID = process.env.LOGTO_TENANT_ID;
export const LOGTO_M2M_CLIENT_ID = process.env.LOGTO_M2M_CLIENT_ID;
export const LOGTO_M2M_CLIENT_SECRET = process.env.LOGTO_M2M_CLIENT_SECRET;
export const LOGTO_API_INDICATOR_BASE_URL = process.env.LOGTO_API_INDICATOR_BASE_URL;
