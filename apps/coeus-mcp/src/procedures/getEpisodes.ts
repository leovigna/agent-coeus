import { createGetEpisodesProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { zepClient } from "../clients/zep-client.js";
import { publicProcedure } from "../trpc.js";

export const getEpisodesProcedure = publicProcedure
    .concat(createGetEpisodesProcedure(zepClient))
    .output(z.any())
    .query(({ ctx: { result } }) => {
        return result;
    });
