import { ZepClient } from "@getzep/zep-cloud";

import { AuthInfo } from "./AuthInfo.js";

export type ZepClientProvider =
    | ZepClient
    | ((authInfo: AuthInfo) => ZepClient)
    | ((authInfo: AuthInfo) => Promise<ZepClient>);

export async function resolveZepClient(
    provider: ZepClientProvider,
    authInfo: AuthInfo,
): Promise<ZepClient> {
    if (typeof provider === "function") {
        const result = provider(authInfo);
        // Check if the result is a promise
        if (result instanceof Promise) {
            return await result;
        }
        return result;
    }
    return provider;
}
