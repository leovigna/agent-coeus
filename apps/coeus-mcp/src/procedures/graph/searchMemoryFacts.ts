import { createSearchMemoryFactsProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { zepClient } from "../../clients/zep-client.js";
import { publicProcedure } from "../../trpc.js";

export const searchMemoryFactsProcedure = publicProcedure
    .concat(createSearchMemoryFactsProcedure(zepClient))
    .output(z.any())
    .query(({ ctx: { result } }) => {
        return result;
    });
