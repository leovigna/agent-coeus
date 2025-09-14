import { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import { createOrganization, LogToClient } from "@coeus-agent/mcp-tools-logto";
import { resolveZepClient, ZepClientProvider } from "@coeus-agent/mcp-tools-zep";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { ZodRawShape } from "zod";

export interface UserCustomData {
    // Default organization of the user
    defaultOrgId?: string;
    // Default graph of the user (should be part of defaultOrgId)
    defaultGraphId?: string;
}

export interface OrgCustomData {
    // Default graph of the org
    defaultGraphId?: string;
}

export const whoAmIInputSchema = {};

/**
 * Get an organization by its ID.
 *
 * @param {string} id - The ID of the organization.
 */
export async function whoAmI(clients: { logToClient: LogToClient; zepClientProvider: ZepClientProvider }, _: void, { authInfo }: { authInfo: AuthInfo }) {
    const { logToClient, zepClientProvider } = clients;
    const zepClient = await resolveZepClient(zepClientProvider, authInfo);

    const { subject } = authInfo;
    const userId = subject!;

    const userCustomDataResponse = (await logToClient.GET("/api/users/{userId}/custom-data", {
        params: {
            path: {
                userId,
            },
        },
    }));
    if (!userCustomDataResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR); // 500 LogTo API call failed
    const userCustomData = userCustomDataResponse.data! as unknown as (UserCustomData | undefined);

    const userCustomDataPatch: UserCustomData = {};
    if (!userCustomData?.defaultOrgId) {
        // TODO: User may have been invited to an org, could skip this and assign first org
        const org = await createOrganization(logToClient, {
            name: "Personal",
            description: "Personal Organization",
        }, { authInfo });
        userCustomDataPatch.defaultOrgId = org.id;
    }

    if (!userCustomData?.defaultGraphId) {
        // TODO: Must validate if user is part of defaultOrg
        const defaultOrgId = userCustomData?.defaultOrgId ?? userCustomDataPatch.defaultOrgId!;
        userCustomDataPatch.defaultGraphId = `${defaultOrgId}:${userId}:default`;

        const defaultGraphId = `${defaultOrgId}:${userId}`;
        // TODO: Handle error
        await zepClient.graph.create({
            graphId: defaultGraphId,
            name: "Default Graph",
        });
    }

    if (Object.keys(userCustomDataPatch).length > 0) {
        const updateCustomDataResponse = await logToClient.PATCH("/api/users/{userId}/custom-data", {
            params: {
                path: {
                    userId,
                },
            },
            body: {
                // cast to Record<string, never> as customData can have any type
                customData: userCustomDataPatch as unknown as Record<string, never>,
            },
        });
        if (!updateCustomDataResponse.response.ok) throw createError(INTERNAL_SERVER_ERROR);
    }
}

export const whoAmIMetadata = {
    name: "whoami",
    config: {
        title: "Who Am I?",
        description: "Get information about the current user.",
        inputSchema: whoAmIInputSchema,
    },
} as const satisfies ToolMetadata<typeof whoAmIInputSchema, ZodRawShape>;
