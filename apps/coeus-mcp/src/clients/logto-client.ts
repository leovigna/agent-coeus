import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import { createManagementApi } from "@logto/api/management";

import {
    LOGTO_M2M_CLIENT_ID,
    LOGTO_M2M_CLIENT_SECRET,
    LOGTO_TENANT_ID,
} from "../envvars.js";

if (!LOGTO_TENANT_ID) {
    throw new Error("LOGTO_TENANT_ID is not set");
}

if (!LOGTO_M2M_CLIENT_ID) {
    throw new Error("LOGTO_M2M_CLIENT_ID is not set");
}

if (!LOGTO_M2M_CLIENT_SECRET) {
    throw new Error("LOGTO_M2M_CLIENT_SECRET is not set");
}

export const logToClient: LogToClient = createManagementApi(LOGTO_TENANT_ID, {
    clientId: LOGTO_M2M_CLIENT_ID,
    clientSecret: LOGTO_M2M_CLIENT_SECRET,
}).apiClient;
