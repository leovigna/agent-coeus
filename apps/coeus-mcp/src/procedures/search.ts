import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResultSchema, Notification, Request } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { searchTool } from "../tools/search.js";
import { publicProcedure } from "../trpc.js";

export const searchProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: `/${searchTool.name}`,
            tags: ["tools"],
            summary: searchTool.config.title,
        },
    })
    .input(z.object(searchTool.config.inputSchema))
    .output(CallToolResultSchema)
    .mutation(async ({ input, ctx }) => {
        const authInfo = ctx.authInfo;
        const extra = { authInfo } as unknown as RequestHandlerExtra<Request, Notification>;
        const result = await searchTool.cb(input, extra);
        return result;
    });
