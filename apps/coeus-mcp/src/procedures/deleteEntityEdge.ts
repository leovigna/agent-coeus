import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResultSchema, Notification, Request } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { deleteEntityEdgeTool } from "../tools/index.js";
import { publicProcedure } from "../trpc.js";

export const deleteEntityEdgeProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: `/${deleteEntityEdgeTool.name}`,
            tags: ["tools"],
            summary: deleteEntityEdgeTool.config.title,
            description: deleteEntityEdgeTool.config.description,
        },
    })
    .input(z.object(deleteEntityEdgeTool.config.inputSchema))
    .output(CallToolResultSchema)
    .mutation(async ({ input, ctx }) => {
        const authInfo = ctx.authInfo;
        const extra = { authInfo } as unknown as RequestHandlerExtra<Request, Notification>;
        const result = await deleteEntityEdgeTool.cb(input, extra);
        return result;
    });
