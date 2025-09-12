import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResultSchema, Notification, Request } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { getEpisodesTool } from "../tools/index.js";
import { publicProcedure } from "../trpc.js";

export const getEpisodesProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: `/${getEpisodesTool.name}`,
            tags: ["tools"],
            summary: getEpisodesTool.config.title,
            description: getEpisodesTool.config.description,
        },
    })
    .input(z.object(getEpisodesTool.config.inputSchema))
    .output(CallToolResultSchema)
    .mutation(async ({ input, ctx }) => {
        const authInfo = ctx.authInfo;
        const extra = { authInfo } as unknown as RequestHandlerExtra<Request, Notification>;
        const result = await getEpisodesTool.cb(input, extra);
        return result;
    });
