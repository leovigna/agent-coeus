import { createListGraphsProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { logToClient, zepClient } from "../../clients/index.js";
import { publicProcedure } from "../../trpc.js";

export const listGraphsProcedure = publicProcedure
    .concat(
        createListGraphsProcedure({
            logToClient,
            zepClientProvider: zepClient,
        }),
    )
    .output(z.any())
    .mutation(({ ctx: { result } }) => {
        return result;
    });
