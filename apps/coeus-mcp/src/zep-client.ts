import { ZepClient } from "@getzep/zep-cloud";

import { ZEP_API_KEY } from "./envvars.js";

if (!ZEP_API_KEY) {
    throw new Error("ZEP_API_KEY is not set");
}

export const zepClient = new ZepClient({
    apiKey: ZEP_API_KEY,
});
