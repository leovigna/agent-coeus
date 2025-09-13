import { getAddMemoryTool, getClearGraphTool, getDeleteEntityEdgeTool, getDeleteEpisodeTool, getGetEntityEdgeTool, getGetEpisodesTool, getSearchMemoryFactsTool, getSearchMemoryNodesTool } from "@coeus-agent/mcp-tools-zep";

import { zepClient } from "../clients/zep-client.js";

export const addMemoryTool = getAddMemoryTool(zepClient);
export const clearGraphTool = getClearGraphTool(zepClient);
export const deleteEntityEdgeTool = getDeleteEntityEdgeTool(zepClient);
export const deleteEpisodeTool = getDeleteEpisodeTool(zepClient);
export const getEntityEdgeTool = getGetEntityEdgeTool(zepClient);
export const getEpisodesTool = getGetEpisodesTool(zepClient);
export const searchMemoryFactsTool = getSearchMemoryFactsTool(zepClient);
export const searchMemoryNodesTool = getSearchMemoryNodesTool(zepClient);
