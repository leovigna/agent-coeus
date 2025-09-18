import { createUpdateOrganizationProcedure } from "@coeus-agent/mcp-tools-logto";
import { z } from "zod";

import { logToClient } from "../../clients/logto-client.js";
import { publicProcedure } from "../../trpc.js";

export const updateOrganizationProcedure = publicProcedure
    .concat(createUpdateOrganizationProcedure(logToClient))
    .output(z.any())
    .mutation(({ ctx: { result } }) => {
        return result;
    });
