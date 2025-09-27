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
import { z, type ZodRawShape } from "zod";

import { logToClient } from "../clients/index.js";

/** Override Create Organization Tools with schema validation **/
export const createOrganizationInputSchema = {
    ...createOrganizationInputSchemaBase,
    customData: z
        .object({
            zepApiKey: z.string().optional().describe("Zep API Key"),
            twentyApiUrl: z
                .string()
                .default("https://api.twenty.com/rest")
                .describe("Twenty CRM API URL"),
            twentyApiKey: z.string().optional().describe("Twenty CRM API Key"),
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

export function createOrganizationToolFactory(ctx: {
    logToClient: LogToClient;
}) {
    return {
        ...createOrganizationToolMetadata,
        name: createOrganizationToolMetadata.name,
        cb: partial(toCallToolResultFn(createOrganization), ctx),
    } as const satisfies Tool<
        typeof createOrganizationInputSchema,
        ZodRawShape
    >;
}

// TRPC Procedure
const createOrganizationProcedureFactory = toProcedurePluginFn(
    createOrganizationInputSchema,
    createOrganization,
    createOrganizationProcedureMetadata,
);

export const createOrganizationProcedure = createOrganizationProcedureFactory({
    logToClient,
});
