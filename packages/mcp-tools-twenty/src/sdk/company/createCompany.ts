import {
    type AuthInfo,
    checkRequiredScopes,
    toCallToolResultFn,
    type Tool,
    type ToolMetadata,
    toProcedurePluginFn,
} from "@coeus-agent/mcp-tools-base";
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { checkOrganizationUserRoles } from "@coeus-agent/mcp-tools-logto";
import { partial } from "lodash-es";
import type { OpenApiMeta } from "trpc-to-openapi";
import { z, type ZodRawShape } from "zod";

import type { TwentyCoreClientProvider } from "../../TwentyClient.js";
import { resolveTwentyCoreClient } from "../../TwentyClient.js";

export const createCompanyInputSchema = {
    orgId: z
        .string()
        .describe(
            "The ID of the organization. If not provided, uses the user's current org.",
        ),
    name: z
        .string()
        .regex(/^[a-zA-Z0-9-_]+$/)
        .describe("Name of the graph, no spaces or special characters."),
    description: z.string().optional().describe("Company description."),
};

export async function createCompany(
    ctx: {
        logToClient: LogToClient;
        twentyCoreClientProvider: TwentyCoreClientProvider;
    },
    params: z.objectOutputType<typeof createCompanyInputSchema, z.ZodTypeAny>,
    { authInfo }: { authInfo: AuthInfo },
): Promise<void> {
    const { subject, scopes } = authInfo;
    const userId = subject!;
    checkRequiredScopes(scopes, ["write:crm"]); // 403 if auth has insufficient scopes

    const { orgId, name } = params;

    // Check user has access to org
    await checkOrganizationUserRoles(
        ctx.logToClient,
        { orgId, validRoles: ["owner", "admin", "member"] },
        { authInfo },
    ); // 404 if not part of org, 403 if has insufficient role

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const client = await resolveTwentyCoreClient(
        ctx.twentyCoreClientProvider,
        orgId,
    );
}

// MCP Tool
export const createCompanyToolMetadata = {
    name: "zep_create_graph",
    config: {
        title: "create Company",
        description:
            "creates all data from a specific graph. This operation is irreversible.",
        inputSchema: createCompanyInputSchema,
    },
} as const satisfies ToolMetadata<typeof createCompanyInputSchema, ZodRawShape>;

export function getCreateCompanyTool(ctx: {
    logToClient: LogToClient;
    zepClientProvider: TwentyCoreClientProvider;
}) {
    return {
        ...createCompanyToolMetadata,
        name: createCompanyToolMetadata.name,
        cb: partial(toCallToolResultFn(createCompany), ctx),
    } as const satisfies Tool<typeof createCompanyInputSchema, ZodRawShape>;
}

// TRPC Procedure
export const createCompanyProcedureMetadata = {
    openapi: {
        method: "POST",
        path: "/zep/graph",
        tags: ["zep"],
        summary: createCompanyToolMetadata.config.title,
        description: createCompanyToolMetadata.config.description,
    },
} as OpenApiMeta;

export const createCreateCompanyProcedure = toProcedurePluginFn(
    createCompanyInputSchema,
    createCompany,
    createCompanyProcedureMetadata,
);
