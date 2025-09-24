import type { LogToClient } from "@coeus-agent/mcp-tools-logto";

import {
    createCompanyProcedureFactory,
    deleteCompanyProcedureFactory,
    getCompanyProcedureFactory,
    updateCompanyProcedureFactory,
} from "./sdk/index.js";
import type { TwentyCoreClientProvider } from "./TwentyClient.js";

export function createTwentyPlugin(ctx: {
    logToClient: LogToClient;
    twentyCoreClientProvider: TwentyCoreClientProvider;
}) {
    const createCompany = createCompanyProcedureFactory(ctx);
    const deleteCompany = deleteCompanyProcedureFactory(ctx);
    const getCompany = getCompanyProcedureFactory(ctx);
    const updateCompany = updateCompanyProcedureFactory(ctx);

    return {
        createCompany,
        deleteCompany,
        getCompany,
        updateCompany,
    };
}
