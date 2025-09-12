/* eslint-disable @stylistic/indent */
import { AuthInfo } from "@coeus-agent/mcp-tools-zep";
import { initTRPC } from "@trpc/server";

export interface RequestMiddlewareCtxOut {
    auth: AuthInfo;
}
/**
 * Parse out request body, headers, set relevant context fields
 */
export const requestMiddleware = initTRPC
    .context<{
        readonly req: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            body: Record<string, any>;
            headers: Record<string, string>;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [k: string]: any;
        };
    }>()
    .create()
    .procedure.use(({ ctx, next }) => {
        const { req } = ctx;
        const result = {
            authInfo: req.auth as AuthInfo,
        };

        return next({
            // Remove undefined variables to avoid overriding context
            ctx: result,
        });
    });
