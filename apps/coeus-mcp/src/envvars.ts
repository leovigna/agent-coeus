import { config } from "dotenv";
config();

export const ZEP_API_KEY = process.env.ZEP_API_KEY;
export const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID;
export const OIDC_BASE_URL = process.env.OIDC_BASE_URL;
