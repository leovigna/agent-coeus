import { createGetOrganizationProcedure } from "@coeus-agent/mcp-tools-logto";
import { z } from "zod";

import { logToClient } from "../clients/logto-client.js";
import { publicProcedure } from "../trpc.js";

export const getOrganizationProcedure = publicProcedure.concat(createGetOrganizationProcedure(logToClient))
    .output(z.any())
    .query(({ ctx: { result } }) => {
        return result;
    });
