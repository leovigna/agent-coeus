import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResultSchema, Notification, Request } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { fetchTool } from "../tools/fetch.js";
import { publicProcedure } from "../trpc.js";

export const fetchProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: "/fetch",
            tags: ["tools"],
            summary: fetchTool.config.title,
        },
    })
    .input(z.object(fetchTool.config.inputSchema))
    .output(CallToolResultSchema)
    .mutation(async ({ input, ctx }) => {
        const authInfo = ctx.authInfo;
        const extra = { authInfo } as unknown as RequestHandlerExtra<Request, Notification>;
        const result = await fetchTool.cb(input, extra);
        return result;
    });
