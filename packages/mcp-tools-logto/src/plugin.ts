import type { LogToClient } from "./LogToClient.js";
import {
    createOrganizationProcedureFactory,
    deleteOrganizationProcedureFactory,
    getMeProfileProcedureFactory,
    getOrganizationProcedureFactory,
    listOrganizationsProcedureFactory,
    setMeOrgIdProcedureFactory,
    updateOrganizationProcedureFactory,
} from "./sdk/index.js";

export function createLogToPlugin(ctx: { logToClient: LogToClient }) {
    const createOrganization = createOrganizationProcedureFactory(
        ctx.logToClient,
    );
    const deleteOrganization = deleteOrganizationProcedureFactory(
        ctx.logToClient,
    );
    const getOrganization = getOrganizationProcedureFactory(ctx.logToClient);
    const listOrganizations = listOrganizationsProcedureFactory(
        ctx.logToClient,
    );
    const updateOrganization = updateOrganizationProcedureFactory(
        ctx.logToClient,
    );
    const getMeProfile = getMeProfileProcedureFactory(ctx.logToClient);
    const setMeOrgId = setMeOrgIdProcedureFactory(ctx.logToClient);

    return {
        createOrganization,
        deleteOrganization,
        getOrganization,
        listOrganizations,
        updateOrganization,
        getMeProfile,
        setMeOrgId,
    };
}
