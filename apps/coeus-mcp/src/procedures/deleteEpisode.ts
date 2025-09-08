import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResultSchema, Notification, Request } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { deleteEpisodeTool } from "../tools/deleteEpisode.js";
import { publicProcedure } from "../trpc.js";

export const deleteEpisodeProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: `/${deleteEpisodeTool.name}`,
            tags: ["tools"],
            summary: deleteEpisodeTool.config.title,
            description: deleteEpisodeTool.config.description,
        },
    })
    .input(z.object(deleteEpisodeTool.config.inputSchema))
    .output(CallToolResultSchema)
    .mutation(async ({ input, ctx }) => {
        const authInfo = ctx.authInfo;
        const extra = { authInfo } as unknown as RequestHandlerExtra<Request, Notification>;
        const result = await deleteEpisodeTool.cb(input, extra);
        return result;
    });
