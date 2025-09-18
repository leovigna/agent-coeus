import { createListOrganizationsProcedure } from "@coeus-agent/mcp-tools-logto";
import { z } from "zod";

import { logToClient } from "../../clients/logto-client.js";
import { publicProcedure } from "../../trpc.js";

export const listOrganizationsProcedure = publicProcedure
    .concat(createListOrganizationsProcedure(logToClient))
    .output(z.any())
    .query(({ ctx: { result } }) => {
        return result;
    });
