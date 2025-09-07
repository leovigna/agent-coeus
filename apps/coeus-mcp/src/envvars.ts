import { config } from "dotenv";
config();

export const ZEP_API_KEY = process.env.ZEP_API_KEY;
export const LOGTO_APP_ID = process.env.LOGTO_APP_ID;
export const LOGTO_ISSUER_URL = process.env.LOGTO_ISSUER_URL;
