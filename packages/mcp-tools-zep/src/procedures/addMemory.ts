import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { Zep } from "@getzep/zep-cloud";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { addMemory, addMemoryMetadata } from "../sdk/addMemory.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function createAddMemoryProcedure(provider: ZepClientProvider, tags = ["tools", "zep"]) {
    // partial application to add provider to addMemory
    const addMemoryWithProvider = partial(addMemory, provider);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "POST",
            path: `/${addMemoryMetadata.name}`,
            tags,
            summary: addMemoryMetadata.config.title,
            description: addMemoryMetadata.config.description,
        },
    }).input(z.object(addMemoryMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const episode = await addMemoryWithProvider(input, extra);
            return next({
                ctx: {
                    episode,
                } as { episode: Zep.Episode },
            });
        });
}
