import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResultSchema, Notification, Request } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { clearGraphTool } from "../tools/clearGraph.js";
import { publicProcedure } from "../trpc.js";

export const clearGraphProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: `/${clearGraphTool.name}`,
            tags: ["tools"],
            summary: clearGraphTool.config.title,
            description: clearGraphTool.config.description,
        },
    })
    .input(z.object(clearGraphTool.config.inputSchema))
    .output(CallToolResultSchema)
    .mutation(async ({ input, ctx }) => {
        const authInfo = ctx.authInfo;
        const extra = { authInfo } as unknown as RequestHandlerExtra<Request, Notification>;
        const result = await clearGraphTool.cb(input, extra);
        return result;
    });
