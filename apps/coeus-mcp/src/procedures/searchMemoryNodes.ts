import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResultSchema, Notification, Request } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { searchMemoryNodesTool } from "../tools/index.js";
import { publicProcedure } from "../trpc.js";

export const searchMemoryNodesProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: `/${searchMemoryNodesTool.name}`,
            tags: ["tools"],
            summary: searchMemoryNodesTool.config.title,
            description: searchMemoryNodesTool.config.description,
        },
    })
    .input(z.object(searchMemoryNodesTool.config.inputSchema))
    .output(CallToolResultSchema)
    .mutation(async ({ input, ctx }) => {
        const authInfo = ctx.authInfo;
        const extra = { authInfo } as unknown as RequestHandlerExtra<Request, Notification>;
        const result = await searchMemoryNodesTool.cb(input, extra);
        return result;
    });
