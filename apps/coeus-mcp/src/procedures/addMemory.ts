import { createAddMemoryProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { zepClient } from "../clients/zep-client.js";
import { publicProcedure } from "../trpc.js";

export const addMemoryProcedure = publicProcedure.concat(createAddMemoryProcedure(zepClient))
    .output(z.any())
    .mutation(({ ctx: { episode } }) => {
        return episode;
    });

/*
export const addMemoryProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: `/${addMemoryTool.name}`,
            tags: ["tools"],
            summary: addMemoryTool.config.title,
            description: addMemoryTool.config.description,
        },
    })
    .input(z.object(addMemoryTool.config.inputSchema))
    .output(CallToolResultSchema)
    .mutation(async ({ input, ctx }) => {
        const authInfo = ctx.authInfo;
        const extra = { authInfo } as unknown as RequestHandlerExtra<Request, Notification>;
        const result = await addMemoryTool.cb(input, extra);
        return result;
    });
*/
