import { createAddDataProcedure } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { logToClient, zepClient } from "../../clients/index.js";
import { publicProcedure } from "../../trpc.js";

export const addDataProcedure = publicProcedure
    .concat(
        createAddDataProcedure({ logToClient, zepClientProvider: zepClient }),
    )
    .output(z.any())
    .mutation(({ ctx: { result } }) => {
        return result;
    });
