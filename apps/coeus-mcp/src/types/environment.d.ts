declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test";
            ZEP_API_KEY?: string;
            LOGTO_APP_ID?: string;
            LOGTO_ISSUER_URL?: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { };
