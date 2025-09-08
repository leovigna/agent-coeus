import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResultSchema, Notification, Request } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { addMemoryTool } from "../tools/addMemory.js";
import { publicProcedure } from "../trpc.js";

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
