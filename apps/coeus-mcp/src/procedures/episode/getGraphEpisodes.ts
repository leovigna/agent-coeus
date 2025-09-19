import { createGetGraphEpisodesProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { logToClient, zepClient } from "../../clients/index.js";
import { publicProcedure } from "../../trpc.js";

export const getGraphEpisodesProcedure = publicProcedure
    .concat(
        createGetGraphEpisodesProcedure({
            logToClient,
            zepClientProvider: zepClient,
        }),
    )
    .output(z.any())
    .query(({ ctx: { result } }) => {
        return result;
    });
