import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { clearGraph, clearGraphMetadata } from "../sdk/clearGraph.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function createClearGraphProcedure(provider: ZepClientProvider, tags = ["tools", "zep"]) {
    // partial application to add provider to clearGraph
    const clearGraphWithProvider = partial(clearGraph, provider);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "POST",
            path: `/${clearGraphMetadata.name}`,
            tags,
            summary: clearGraphMetadata.config.title,
            description: clearGraphMetadata.config.description,
        },
    }).input(z.object(clearGraphMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await clearGraphWithProvider(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
