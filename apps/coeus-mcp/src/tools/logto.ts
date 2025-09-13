import { getCreateOrganizationTool, getDeleteOrganizationTool, getGetOrganizationTool, getListOrganizationsTool, getUpdateOrganizationTool, getWhoAmITool } from "@coeus-agent/mcp-tools-logto";

import { logToClient } from "../clients/logto-client.js";

export const createOrganizationTool = getCreateOrganizationTool(logToClient);
export const listOrganizationsTool = getListOrganizationsTool(logToClient);
export const getOrganizationTool = getGetOrganizationTool(logToClient);
export const updateOrganizationTool = getUpdateOrganizationTool(logToClient);
export const deleteOrganizationTool = getDeleteOrganizationTool(logToClient);
export const whoAmITool = getWhoAmITool(logToClient);
