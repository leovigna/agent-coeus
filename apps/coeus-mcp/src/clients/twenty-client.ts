import {
    createTwentyCoreClient,
    createTwentyMetadataClient,
    type TwentyCoreClientProvider,
    type TwentyMetadataClientProvider,
} from "@coeus-agent/mcp-tools-twenty";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";

import { BASE_URL } from "../envvars.js";

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

// TODO: Make envvar
/**
 * Get Twenty Webhook URL for organization
 * @param orgId
 * @returns
 */
export const twentyWebhookUrlProvider = (orgId: string) => {
    const webhookPath = `/webhooks/organizations/${orgId}/twenty`;

    return new URL(webhookPath, BASE_URL).toString();
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

        const twentyMetadataApiUrl = new URL(
            "/metadata",
            twentyApiUrl,
        ).toString();

        return createTwentyMetadataClient({
            baseUrl: twentyMetadataApiUrl,
            headers: {
                Authorization: `Bearer ${twentyApiKey}`,
            },
        });
    };
