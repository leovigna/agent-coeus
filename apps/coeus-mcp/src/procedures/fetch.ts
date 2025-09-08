import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { Notification, Request } from "@modelcontextprotocol/sdk/types.js";
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
    // TODO: Add flexible schema for result
    .output(z.any())
    .mutation(async ({ input }) => {
        // TODO: Add middleware for this?
        const extra = {} as unknown as RequestHandlerExtra<Request, Notification>;
        // const result = await fetchTool.cb(input, extra);
        const authInfo = { sub: "test-user" };
        const result = { authInfo };
        return result;
    });
