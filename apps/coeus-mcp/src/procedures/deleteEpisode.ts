import { createDeleteEpisodeProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { zepClient } from "../clients/zep-client.js";
import { publicProcedure } from "../trpc.js";

export const deleteEpisodeProcedure = publicProcedure.concat(createDeleteEpisodeProcedure(zepClient))
    .output(z.any())
    .mutation(({ ctx: { result } }) => {
        return result;
    });
