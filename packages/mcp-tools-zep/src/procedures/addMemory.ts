/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthInfo } from "@coeus-agent/mcp-tools-base";
// @ts-expect-error required for inference
import { Zep } from "@getzep/zep-cloud";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z, ZodTypeAny } from "zod";

import { addMemory, addMemoryMetadata } from "../sdk/addMemory.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

/**
 * Converts a function that returns a Promise into a function that returns a trpc plugin.
 * @param fn
 * @returns A function that takes the same parameters as `fn` and returns a trpc plugin.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProcedurePluginFn<InputSchema extends z.ZodRawShape, T extends (client: any, params: z.objectOutputType<InputSchema, ZodTypeAny>, extra: { authInfo: AuthInfo }) => Promise<any>>(inputSchema: InputSchema, fn: T, meta: OpenApiMeta) {
    return function (provider: Parameters<T>[0]) {
        // partial application to add provider to addMemory
        const fnWithProvider = partial(fn, provider);
        const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

        return t.procedure.meta(meta).input(z.object(inputSchema))
            .use(async ({ input, ctx, next }) => {
                const authInfo = ctx.authInfo;
                const extra = { authInfo };
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
                const result = await fnWithProvider(input as unknown as any, extra) as Awaited<ReturnType<T>>;
                return next({
                    ctx: {
                        result,
                    },
                });
            });
    };
}

const createAddMemoryProcedureMeta = {
    openapi: {
        method: "POST",
        path: `/${addMemoryMetadata.name}`,
        tags: [],
        summary: addMemoryMetadata.config.title,
        description: addMemoryMetadata.config.description,
    },
} as OpenApiMeta;

export const createAddMemoryProcedure2 = toProcedurePluginFn(addMemoryMetadata.config.inputSchema, addMemory, createAddMemoryProcedureMeta);

export function createAddMemoryProcedure(provider: ZepClientProvider) {
    // partial application to add provider to addMemory
    const addMemoryWithProvider = partial(addMemory, provider);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta(createAddMemoryProcedureMeta).input(z.object(addMemoryMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const episode = await addMemoryWithProvider(input, extra);
            return next({
                ctx: {
                    episode,
                },
            });
        });
}
