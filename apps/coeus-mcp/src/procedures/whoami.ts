import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { publicProcedure } from "../trpc.js";

export const whoamiProcedure = publicProcedure
    .meta({
        openapi: {
            method: "POST",
            path: "/whoami",
            tags: ["tools"],
            summary: "Get current auth info",
        },
    })
    .input(z.void())
    .output(CallToolResultSchema)
    .mutation(({ ctx }) => {
        const authInfo = ctx.authInfo;
        return {
            content: [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                { type: "text", text: JSON.stringify((authInfo as any)?.claims ?? { error: "Not authenticated" }) },
            ],
        };
    });
