/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthInfo } from "./AuthInfo.js";
import { checkRequiredScopes } from "./AuthInfo.js";

export function withScopeCheck<
    T extends (
        ctx: any,
        params: any,
        extra: { authInfo: AuthInfo },
        ...args: any[]
    ) => any,
>(fn: T, requiredScopes: string[]): T {
    // @ts-expect-error skip type inference of params
    return (
        ctx: any,
        params: any,
        extra: { authInfo: AuthInfo },
        ...args: any[]
    ) => {
        checkRequiredScopes(extra.authInfo.scopes, requiredScopes);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return fn(ctx, params, extra, ...args);
    };
}
