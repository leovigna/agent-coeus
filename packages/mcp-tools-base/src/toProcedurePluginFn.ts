/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { ZodTypeAny } from "zod";
import { z } from "zod";

import type { AuthInfo } from "./AuthInfo.js";
/**
 * Converts a function that returns a Promise into a function that returns a trpc plugin.
 * @param fn
 * @returns A function that takes the same parameters as `fn` and returns a trpc plugin.
 */

export function toProcedurePluginFn<
    InputSchema extends z.ZodRawShape,
    T extends (
        client: any,
        params: z.objectOutputType<InputSchema, ZodTypeAny>,
        extra: { authInfo: AuthInfo },
    ) => Promise<any>,
>(inputSchema: InputSchema, fn: T, meta: OpenApiMeta) {
    return function (provider: Parameters<T>[0]) {
        // partial application to add provider to addMemory
        const fnWithProvider = partial(fn, provider);
        const t = initTRPC
            .context<{ authInfo: AuthInfo }>()
            .meta<OpenApiMeta>()
            .create();

        return t.procedure
            .meta(meta)
            .input(z.object(inputSchema))
            .use(async ({ input, ctx, next }) => {
                const authInfo = ctx.authInfo;
                const extra = { authInfo };

                const result = (await fnWithProvider(
                    input as unknown as any,
                    extra,
                )) as Awaited<ReturnType<T>>;
                return next({
                    ctx: {
                        result,
                    },
                });
            });
    };
}
