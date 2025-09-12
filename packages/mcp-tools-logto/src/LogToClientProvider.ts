import { createManagementApi } from "@logto/api/management";

import { AuthInfo } from "./AuthInfo.js";

type ManagementApiReturnType = ReturnType<typeof createManagementApi>;

export type LogToClientProvider =
    | ManagementApiReturnType
    | ((authInfo: AuthInfo) => ManagementApiReturnType)
    | ((authInfo: AuthInfo) => Promise<ManagementApiReturnType>);

export async function resolveLogToClient(
    provider: LogToClientProvider,
    authInfo: AuthInfo,
): Promise<ManagementApiReturnType> {
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
