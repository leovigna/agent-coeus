import type { Client } from "openapi-fetch";
import createClient from "openapi-fetch";

import type { paths as twentyCorePaths } from "./schemas/core-api.js";
import type { paths as twentyMetadataPaths } from "./schemas/metadata-api.js";

export type TwentyCoreClient = Client<twentyCorePaths>;
export type TwentyCoreClientProvider =
    | TwentyCoreClient
    | ((clientId: string) => TwentyCoreClient)
    | ((clientId: string) => Promise<TwentyCoreClient>);
export const createTwentyCoreClient = createClient<twentyCorePaths>;
export async function resolveTwentyCoreClient(
    provider: TwentyCoreClientProvider,
    clientId: string,
): Promise<TwentyCoreClient> {
    if (typeof provider === "function") {
        const result = provider(clientId);
        // Check if the result is a promise
        if (result instanceof Promise) {
            return await result;
        }
        return result;
    }
    return provider;
}

export type TwentyMetadataClient = Client<twentyMetadataPaths>;
export type TwentyMetadataClientProvider =
    | TwentyMetadataClient
    | ((clientId: string) => TwentyMetadataClient)
    | ((clientId: string) => Promise<TwentyMetadataClient>);
export const createTwentyMetadataClient = createClient<twentyMetadataPaths>;
export async function resolveTwentyMetadataClient(
    provider: TwentyMetadataClientProvider,
    clientId: string,
): Promise<TwentyMetadataClient> {
    if (typeof provider === "function") {
        const result = provider(clientId);
        // Check if the result is a promise
        if (result instanceof Promise) {
            return await result;
        }
        return result;
    }
    return provider;
}
