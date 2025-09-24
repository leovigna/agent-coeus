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
    const createOrganization = createOrganizationProcedureFactory(ctx);
    const deleteOrganization = deleteOrganizationProcedureFactory(ctx);
    const getOrganization = getOrganizationProcedureFactory(ctx);
    const listOrganizations = listOrganizationsProcedureFactory(ctx);
    const updateOrganization = updateOrganizationProcedureFactory(ctx);
    const getMeProfile = getMeProfileProcedureFactory(ctx);
    const setMeOrgId = setMeOrgIdProcedureFactory(ctx);

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
