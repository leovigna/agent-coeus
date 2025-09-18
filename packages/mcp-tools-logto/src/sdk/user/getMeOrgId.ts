import type { AuthInfo } from "@coeus-agent/mcp-tools-base";

import type { LogToClient } from "../../LogToClient.js";
import { createOrganization } from "../organization/createOrganization.js";

import { getMeCustomData } from "./getMeCustomData.js";
import { patchMeCustomData } from "./patchMeCustomData.js";

/**
 * Get (or create) current user org id (no role check)
 * @param client
 * @param authInfo
 * @returns
 */
export async function getMeOrgId(
    client: LogToClient,
    { authInfo }: { authInfo: AuthInfo },
): Promise<string> {
    // Get current orgId
    const userCustomData = (await getMeCustomData(client, {
        authInfo,
    })) as unknown as { currentOrgId?: string };
    let orgId = userCustomData.currentOrgId;

    if (!orgId) {
        // Create personal org
        const org = await createOrganization(
            client,
            {
                name: "Personal",
                description: "Personal Organization",
            },
            { authInfo },
        );
        orgId = org.id;
        // Set as personal org
        await patchMeCustomData(client, { currentOrgId: orgId }, { authInfo });
    }

    return orgId;
}
