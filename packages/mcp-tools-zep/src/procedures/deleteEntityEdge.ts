/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthInfo } from "@coeus-agent/mcp-tools-base";
// @ts-expect-error required for inference
import { Zep } from "@getzep/zep-cloud";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { deleteEntityEdge, deleteEntityEdgeMetadata } from "../sdk/deleteEntityEdge.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function createDeleteEntityEdgeProcedure(provider: ZepClientProvider, tags = ["tools", "zep"]) {
    // partial application to add provider to deleteEntityEdge
    const deleteEntityEdgeWithProvider = partial(deleteEntityEdge, provider);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "POST",
            path: `/${deleteEntityEdgeMetadata.name}`,
            tags,
            summary: deleteEntityEdgeMetadata.config.title,
            description: deleteEntityEdgeMetadata.config.description,
        },
    }).input(z.object(deleteEntityEdgeMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await deleteEntityEdgeWithProvider(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
