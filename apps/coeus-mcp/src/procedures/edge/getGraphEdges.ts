import { createGetGraphEdgesProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { logToClient, zepClient } from "../../clients/index.js";
import { publicProcedure } from "../../trpc.js";

export const getGraphEdgesProcedure = publicProcedure
    .concat(
        createGetGraphEdgesProcedure({
            logToClient,
            zepClientProvider: zepClient,
        }),
    )
    .output(z.any())
    .query(({ ctx: { result } }) => {
        return result;
    });
