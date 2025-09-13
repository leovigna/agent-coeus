import { getCreateOrganizationTool, getListOrganizationsTool, getWhoAmITool } from "@coeus-agent/mcp-tools-logto";

import { logToClient } from "../clients/logto-client.js";

export const createOrganizationTool = getCreateOrganizationTool(logToClient);
export const listOrganizationsTool = getListOrganizationsTool(logToClient);
export const whoAmITool = getWhoAmITool(logToClient);
