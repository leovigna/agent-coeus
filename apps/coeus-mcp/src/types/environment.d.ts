declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test";
            ZEP_API_KEY?: string;
            OIDC_CLIENT_ID?: string;
            OIDC_BASE_URL?: string;
            LOGTO_TENANT_ID?: string;
            LOGTO_M2M_CLIENT_ID?: string;
            LOGTO_M2M_CLIENT_SECRET?: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { };
