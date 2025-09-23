import type { ZepClientProvider } from "@coeus-agent/mcp-tools-zep";
import { ZepClient } from "@getzep/zep-cloud";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";

import { ZEP_API_KEY } from "../envvars.js";

import { logToClient } from "./logto-client.js";

if (!ZEP_API_KEY) {
    throw new Error("ZEP_API_KEY is not set");
}

export const zepClientDefault = new ZepClient({
    apiKey: ZEP_API_KEY,
});

export const zepClient: ZepClientProvider = async (clientId: string) => {
    // Get org custom data
    const orgResponse = await logToClient.GET("/api/organizations/{id}", {
        params: {
            path: {
                id: clientId,
            },
        },
    });
    if (!orgResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
    const org = orgResponse.data!;
    const zepApiKey = org.customData?.zepApiKey;

    if (!zepApiKey) return zepClientDefault;

    // TODO: Memoize
    return new ZepClient({
        apiKey: zepApiKey,
    });
};
