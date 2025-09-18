import { createSearchMemoryNodesProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { zepClient } from "../clients/zep-client.js";
import { publicProcedure } from "../trpc.js";

export const searchMemoryNodesProcedure = publicProcedure
    .concat(createSearchMemoryNodesProcedure(zepClient))
    .output(z.any())
    .query(({ ctx: { result } }) => {
        return result;
    });
