import type { Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    toCallToolResultFn,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import {
    updateOrganization,
    updateOrganizationInputSchema as updateOrganizationInputSchemaBase,
    updateOrganizationProcedureMetadata,
    updateOrganizationToolMetadata as updateOrganizationToolMetadataBase,
} from "@coeus-agent/mcp-tools-logto";
import { partial } from "lodash-es";
import { z, type ZodRawShape } from "zod";

import { logToClient } from "../clients/index.js";

/** Override Create Organization Tools with schema validation **/
export const updateOrganizationInputSchema = {
    ...updateOrganizationInputSchemaBase,
    customData: z.object({
        zepApiKey: z.string().optional().describe("Custom Zep API Key"),
    }),
};
// MCP Tool
export const updateOrganizationToolMetadata = {
    name: updateOrganizationToolMetadataBase.name,
    config: {
        ...updateOrganizationToolMetadataBase.config,
        inputSchema: updateOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof updateOrganizationInputSchema,
    ZodRawShape
>;

export function getUpdateOrganizationTool(client: LogToClient) {
    return {
        ...updateOrganizationToolMetadata,
        cb: partial(toCallToolResultFn(updateOrganization), client),
    } as const satisfies Tool<
        typeof updateOrganizationInputSchema,
        ZodRawShape
    >;
}

// TRPC Procedure
const createUpdateOrganizationProcedure = toProcedurePluginFn(
    updateOrganizationInputSchema,
    updateOrganization,
    updateOrganizationProcedureMetadata,
);

export const updateOrganizationProcedure =
    createUpdateOrganizationProcedure(logToClient);
