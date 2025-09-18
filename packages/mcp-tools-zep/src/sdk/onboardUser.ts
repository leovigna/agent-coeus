import { AuthInfo, ToolMetadata } from "@coeus-agent/mcp-tools-base";
import {
    createOrganization,
    getUserCustomData,
    LogToClient,
} from "@coeus-agent/mcp-tools-logto";
import { createError, INTERNAL_SERVER_ERROR } from "http-errors-enhanced";
import { ZodRawShape } from "zod";

import { UserCustomData } from "../UserCustomData.js";
import { resolveZepClient, ZepClientProvider } from "../ZepClientProvider.js";

export const onboardUserInputSchema = {};

/**
 * Get an organization by its ID.
 *
 * @param {string} id - The ID of the organization.
 */
export async function onboardUser(
    clients: { logToClient: LogToClient; zepClientProvider: ZepClientProvider },
    _: void,
    { authInfo }: { authInfo: AuthInfo },
) {
    const { logToClient, zepClientProvider } = clients;
    const zepClient = await resolveZepClient(zepClientProvider, authInfo);

    const { subject } = authInfo;
    const userId = subject!;

    const userCustomData = (await getUserCustomData(
        logToClient,
        {},
        { authInfo },
    )) as unknown as UserCustomData;

    if (!userCustomData?.status) {
        // User not onboarded previously
        const org = await createOrganization(
            logToClient,
            {
                name: "Personal",
                description: "Personal Organization",
            },
            { authInfo },
        );

        const graphId = `${org.id}:${userId}:default`;
        // TODO: Handle error
        await zepClient.graph.create({
            graphId,
            name: "Default Graph",
        });

        const userCustomDataPatch: UserCustomData = {};
        userCustomDataPatch.status = {
            orgId: org.id,
            graphId,
        };
        const updateCustomDataResponse = await logToClient.PATCH(
            "/api/users/{userId}/custom-data",
            {
                params: {
                    path: {
                        userId,
                    },
                },
                body: {
                    // cast to Record<string, never> as customData can have any type
                    customData: userCustomDataPatch as unknown as Record<
                        string,
                        never
                    >,
                },
            },
        );
        if (!updateCustomDataResponse.response.ok)
            throw createError(INTERNAL_SERVER_ERROR);
    }
}

export const onboardUserMetadata = {
    name: "onboard",
    config: {
        title: "Onboard",
        description:
            "Setup user account and create personal organization and default graph if not already present",
        inputSchema: onboardUserInputSchema,
    },
} as const satisfies ToolMetadata<typeof onboardUserInputSchema, ZodRawShape>;
