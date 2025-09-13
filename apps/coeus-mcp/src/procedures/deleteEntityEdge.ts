import { createDeleteEntityEdgeProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { zepClient } from "../clients/zep-client.js";
import { publicProcedure } from "../trpc.js";

export const deleteEntityEdgeProcedure = publicProcedure.concat(createDeleteEntityEdgeProcedure(zepClient))
    .output(z.any())
    .mutation(({ ctx: { result } }) => {
        return result;
    });
