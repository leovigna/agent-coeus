import type { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";

/**
 * Parse out request body, headers, set relevant context fields
 */
export const requestAuthInfoMiddleware = initTRPC
    .context<{
        readonly req: {
            auth: AuthInfo;
        };
    }>()
    .create()
    .procedure.use(({ ctx, next }) => {
        const { req } = ctx;
        const result = {
            authInfo: req.auth,
        };

        return next({
            ctx: result,
        });
    });

export const requestRawBodyMiddleware = initTRPC
    .context<{
        readonly req: {
            rawBody: Buffer;
        };
    }>()
    .create()
    .procedure.use(({ ctx, next }) => {
        const { req } = ctx;
        const result = {
            rawBody: req.rawBody,
        };

        return next({
            ctx: result,
        });
    });

export const requestHeadersMiddleware = initTRPC
    .context<{
        readonly req: {
            headers: Record<string, string>;
        };
    }>()
    .create()
    .procedure.use(({ ctx, next }) => {
        const { req } = ctx;
        const result = {
            headers: req.headers,
        };

        return next({
            ctx: result,
        });
    });
