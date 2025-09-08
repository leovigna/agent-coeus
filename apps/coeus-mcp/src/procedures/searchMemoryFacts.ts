import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResultSchema, Notification, Request } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { searchMemoryFactsTool } from "../tools/searchMemoryFacts.js";
import { publicProcedure } from "../trpc.js";

export const searchMemoryFactsProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: `/${searchMemoryFactsTool.name}`,
            tags: ["tools"],
            summary: searchMemoryFactsTool.config.title,
            description: searchMemoryFactsTool.config.description,
        },
    })
    .input(z.object(searchMemoryFactsTool.config.inputSchema))
    .output(CallToolResultSchema)
    .mutation(async ({ input, ctx }) => {
        const authInfo = ctx.authInfo;
        const extra = { authInfo } as unknown as RequestHandlerExtra<Request, Notification>;
        const result = await searchMemoryFactsTool.cb(input, extra);
        return result;
    });
