/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthInfo } from "./AuthInfo.js";
import { checkRequiredScopes } from "./AuthInfo.js";

export function withScopeCheck<
    T extends (
        p0: any,
        p1: any,
        p2: { authInfo: AuthInfo },
        ...params: any[]
    ) => any,
>(fn: T, requiredScopes: string[]): T {
    // @ts-expect-error skip type inference of params
    return (p0: any, p1: any, p2: { authInfo: AuthInfo }, ...params: any[]) => {
        checkRequiredScopes(p2.authInfo.scopes, requiredScopes);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return fn(p0, p1, p2, ...params);
    };
}
