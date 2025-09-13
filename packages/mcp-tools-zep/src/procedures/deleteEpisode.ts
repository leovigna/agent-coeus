import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { deleteEpisode, deleteEpisodeMetadata } from "../sdk/deleteEpisode.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function createDeleteEpisodeProcedure(provider: ZepClientProvider, tags = ["tools", "zep"]) {
    // partial application to add provider to deleteEpisode
    const deleteEpisodeWithProvider = partial(deleteEpisode, provider);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "POST",
            path: `/${deleteEpisodeMetadata.name}`,
            tags,
            summary: deleteEpisodeMetadata.config.title,
            description: deleteEpisodeMetadata.config.description,
        },
    }).input(z.object(deleteEpisodeMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await deleteEpisodeWithProvider(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
