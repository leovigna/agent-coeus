import { createClearGraphProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { zepClient } from "../clients/zep-client.js";
import { publicProcedure } from "../trpc.js";

export const clearGraphProcedure = publicProcedure
    .concat(createClearGraphProcedure(zepClient))
    .output(z.any())
    .mutation(({ ctx: { result } }) => {
        return result;
    });
