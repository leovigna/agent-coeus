import type { Tool, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    toCallToolResultFn,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import {
    createOrganization,
    createOrganizationInputSchema as createOrganizationInputSchemaBase,
    createOrganizationProcedureMetadata,
    createOrganizationToolMetadata as createOrganizationToolMetadataBase,
} from "@coeus-agent/mcp-tools-logto";
import { partial } from "lodash-es";
import { v4 } from "uuid";
import { z, type ZodRawShape } from "zod";

import { logToClient } from "../clients/index.js";

/** Override Create Organization Tools with schema validation **/
export const createOrganizationInputSchema = {
    ...createOrganizationInputSchemaBase,
    customData: z
        .object({
            zepApiKey: z.string().optional().describe("Custom Zep API Key"),
            twentyApiKey: z
                .string()
                .optional()
                .describe("Custom Twenty CRM API Key"),
        })
        .transform((obj) => {
            if (obj.twentyApiKey) {
                return {
                    ...obj,
                    // Add a random webhook secret for Twenty CRM Webhook
                    twentyWebhookSecret: v4(),
                };
            }
            return obj;
        })
        .optional(),
};
// MCP Tool
export const createOrganizationToolMetadata = {
    name: createOrganizationToolMetadataBase.name,
    config: {
        ...createOrganizationToolMetadataBase.config,
        inputSchema: createOrganizationInputSchema,
    },
} as const satisfies ToolMetadata<
    typeof createOrganizationInputSchema,
    ZodRawShape
>;

export function getCreateOrganizationTool(client: LogToClient) {
    return {
        ...createOrganizationToolMetadata,
        cb: partial(toCallToolResultFn(createOrganization), client),
    } as const satisfies Tool<
        typeof createOrganizationInputSchema,
        ZodRawShape
    >;
}

// TRPC Procedure
const createCreateOrganizationProcedure = toProcedurePluginFn(
    createOrganizationInputSchema,
    createOrganization,
    createOrganizationProcedureMetadata,
);

export const createOrganizationProcedure =
    createCreateOrganizationProcedure(logToClient);
