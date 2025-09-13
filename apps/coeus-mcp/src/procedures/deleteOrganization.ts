import { createDeleteOrganizationProcedure } from "@coeus-agent/mcp-tools-logto";
import { z } from "zod";

import { logToClient } from "../clients/logto-client.js";
import { publicProcedure } from "../trpc.js";

export const deleteOrganizationProcedure = publicProcedure.concat(createDeleteOrganizationProcedure(logToClient))
    .output(z.any())
    .mutation(({ ctx: { result } }) => {
        return result;
    });
