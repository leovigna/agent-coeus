import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { getEpisodes, getEpisodesMetadata } from "../sdk/getEpisodes.js";
import { ZepClientProvider } from "../ZepClientProvider.js";

export function createGetEpisodesProcedure(provider: ZepClientProvider, tags = ["tools", "zep"]) {
    // partial application to add provider to getEpisodes
    const getEpisodesWithProvider = partial(getEpisodes, provider);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "GET",
            path: `/${getEpisodesMetadata.name}`,
            tags,
            summary: getEpisodesMetadata.config.title,
            description: getEpisodesMetadata.config.description,
        },
    }).input(z.object(getEpisodesMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await getEpisodesWithProvider(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
