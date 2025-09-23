import type { ZepClient } from "@getzep/zep-cloud";

export type ZepClientProvider =
    | ZepClient
    | ((clientId: string) => ZepClient)
    | ((clientId: string) => Promise<ZepClient>);

export async function resolveZepClient(
    provider: ZepClientProvider,
    clientId: string,
): Promise<ZepClient> {
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
