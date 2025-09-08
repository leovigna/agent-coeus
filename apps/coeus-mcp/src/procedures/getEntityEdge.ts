import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResultSchema, Notification, Request } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { getEntityEdgeTool } from "../tools/getEntityEdge.js";
import { publicProcedure } from "../trpc.js";

export const getEntityEdgeProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: `/${getEntityEdgeTool.name}`,
            tags: ["tools"],
            summary: getEntityEdgeTool.config.title,
            description: getEntityEdgeTool.config.description,
        },
    })
    .input(z.object(getEntityEdgeTool.config.inputSchema))
    .output(CallToolResultSchema)
    .mutation(async ({ input, ctx }) => {
        const authInfo = ctx.authInfo;
        const extra = { authInfo } as unknown as RequestHandlerExtra<Request, Notification>;
        const result = await getEntityEdgeTool.cb(input, extra);
        return result;
    });
