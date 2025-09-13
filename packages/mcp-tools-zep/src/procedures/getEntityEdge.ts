import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { getEntityEdge, getEntityEdgeMetadata } from "../sdk/getEntityEdge.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function createGetEntityEdgeProcedure(provider: ZepClientProvider, tags = ["tools", "zep"]) {
    // partial application to add provider to getEntityEdge
    const getEntityEdgeWithProvider = partial(getEntityEdge, provider);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "GET", // Changed to GET as it's a retrieval operation
            path: `/${getEntityEdgeMetadata.name}/{uuid}`, // Added uuid to path
            tags,
            summary: getEntityEdgeMetadata.config.title,
            description: getEntityEdgeMetadata.config.description,
        },
    }).input(z.object(getEntityEdgeMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await getEntityEdgeWithProvider(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
