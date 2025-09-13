import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { searchMemoryFacts, searchMemoryFactsMetadata } from "../sdk/searchMemoryFacts.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function createSearchMemoryFactsProcedure(provider: ZepClientProvider, tags = ["tools", "zep"]) {
    // partial application to add provider to searchMemoryFacts
    const searchMemoryFactsWithProvider = partial(searchMemoryFacts, provider);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "GET",
            path: `/${searchMemoryFactsMetadata.name}`,
            tags,
            summary: searchMemoryFactsMetadata.config.title,
            description: searchMemoryFactsMetadata.config.description,
        },
    }).input(z.object(searchMemoryFactsMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await searchMemoryFactsWithProvider(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
