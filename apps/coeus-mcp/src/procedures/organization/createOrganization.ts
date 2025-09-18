import { createCreateOrganizationProcedure } from "@coeus-agent/mcp-tools-logto";
import { z } from "zod";

import { logToClient } from "../../clients/logto-client.js";
import { publicProcedure } from "../../trpc.js";

export const createOrganizationProcedure = publicProcedure
    .concat(createCreateOrganizationProcedure(logToClient))
    .output(z.any())
    .mutation(({ ctx: { result } }) => {
        return result;
    });
