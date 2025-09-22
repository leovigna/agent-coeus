import type { LogToClient } from "./LogToClient.js";
import {
    createCreateOrganizationProcedure,
    createDeleteOrganizationProcedure,
    createGetMeProfileProcedure,
    createGetOrganizationProcedure,
    createListOrganizationsProcedure,
    createUpdateOrganizationProcedure,
} from "./sdk/index.js";

export function createLogToPlugin(ctx: { logToClient: LogToClient }) {
    const createOrganization = createCreateOrganizationProcedure(
        ctx.logToClient,
    );
    const deleteOrganization = createDeleteOrganizationProcedure(
        ctx.logToClient,
    );
    const getOrganization = createGetOrganizationProcedure(ctx.logToClient);
    const listOrganizations = createListOrganizationsProcedure(ctx.logToClient);
    const updateOrganization = createUpdateOrganizationProcedure(
        ctx.logToClient,
    );
    const getMeProfile = createGetMeProfileProcedure(ctx.logToClient);

    return {
        createOrganization,
        deleteOrganization,
        getOrganization,
        listOrganizations,
        updateOrganization,
        getMeProfile,
    };
}
