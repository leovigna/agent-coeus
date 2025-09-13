import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { searchMemoryNodes, searchMemoryNodesMetadata } from "../sdk/searchMemoryNodes.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function createSearchMemoryNodesProcedure(provider: ZepClientProvider, tags = ["tools", "zep"]) {
    // partial application to add provider to searchMemoryNodes
    const searchMemoryNodesWithProvider = partial(searchMemoryNodes, provider);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "GET",
            path: `/${searchMemoryNodesMetadata.name}`,
            tags,
            summary: searchMemoryNodesMetadata.config.title,
            description: searchMemoryNodesMetadata.config.description,
        },
    }).input(z.object(searchMemoryNodesMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await searchMemoryNodesWithProvider(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
