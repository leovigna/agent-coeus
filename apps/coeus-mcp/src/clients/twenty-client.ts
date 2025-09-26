import {
    createTwentyCoreClient,
    createTwentyMetadataClient,
    type TwentyCoreClientProvider,
    type TwentyMetadataClientProvider,
} from "@coeus-agent/mcp-tools-twenty";
import {
    BAD_REQUEST,
    createError,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
} from "http-errors-enhanced";

import { BASE_URL } from "../envvars.js";
import { createUrl } from "../utils/createUrl.js";

import { logToClient } from "./logto-client.js";

export const twentyCoreClientProvider: TwentyCoreClientProvider = async (
    clientId: string,
) => {
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
    const twentyApiUrl = (org.customData?.twentyApiUrl ??
        "https://api.twenty.com/rest") as string;
    const twentyApiKey = org.customData?.twentyApiKey as string | undefined;
    if (!twentyApiKey) {
        throw createError(
            INTERNAL_SERVER_ERROR,
            `Organization ${clientId} is missing Twenty API key`,
        ); // 500 missing Twenty API key
    }

    return createTwentyCoreClient({
        baseUrl: twentyApiUrl,
        headers: {
            Authorization: `Bearer ${twentyApiKey}`,
        },
    });
};

if (!BASE_URL) {
    throw new Error("BASE_URL envvar required for twentyWebhookUrlProvider");
}

/**
 * Get Twenty Webhook URL for organization
 * @param orgId
 * @returns
 */
export const twentyWebhookUrlProvider = (orgId: string) => {
    const webhookPath = `webhooks/organizations/${orgId}/twenty`;

    return createUrl(BASE_URL!, webhookPath).toString();
};

export const twentyMetadataClientProvider: TwentyMetadataClientProvider =
    async (clientId: string) => {
        // Get org custom data
        const orgResponse = await logToClient.GET("/api/organizations/{id}", {
            params: {
                path: {
                    id: clientId,
                },
            },
        });
        if (!orgResponse.response.ok)
            throw createError(NOT_FOUND, `organization ${clientId} not found`); // 404 LogTo API call failed
        const org = orgResponse.data!;
        const twentyApiUrl = (org.customData?.twentyApiUrl ??
            "https://api.twenty.com/rest") as string;
        const twentyApiKey = org.customData?.twentyApiKey as string | undefined;
        if (!twentyApiKey) {
            throw createError(
                BAD_REQUEST,
                `organization ${clientId} is missing Twenty API key`,
            ); // 400 missing Twenty API key
        }

        const twentyMetadataApiUrl = createUrl(
            twentyApiUrl,
            "metadata",
        ).toString();

        return createTwentyMetadataClient({
            baseUrl: twentyMetadataApiUrl,
            headers: {
                Authorization: `Bearer ${twentyApiKey}`,
            },
        });
    };
