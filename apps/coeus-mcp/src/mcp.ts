import {
    getCreateOrganizationTool,
    getDeleteOrganizationTool,
    getGetOrganizationTool,
    getListOrganizationsTool,
    getUpdateOrganizationTool,
    LogToClient,
} from "@coeus-agent/mcp-tools-logto";
import {
    getAddMemoryTool,
    getClearGraphTool,
    getDeleteEntityEdgeTool,
    getDeleteEpisodeTool,
    getGetEntityEdgeTool,
    getGetEpisodesTool,
    getSearchMemoryFactsTool,
    getSearchMemoryNodesTool,
    ZepClientProvider,
} from "@coeus-agent/mcp-tools-zep";
import {
    McpServer,
    ToolCallback,
} from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMcpTools(
    server: McpServer,
    clients: {
        logToClient: LogToClient;
        zepClient: ZepClientProvider;
    },
) {
    const { logToClient, zepClient } = clients;
    // TODO: Throwing errors?
    // TODO: Add models for episodes/memory etc..
    // TODO: Connect Zep.js
    // TODO: Add status resource for underlying zep.js connection

    // OpenAI Deep Research Tools
    // TODO: Implement these later
    // server.registerTool(searchTool.name, searchTool.config, searchTool.cb);
    // server.registerTool(fetchTool.name, fetchTool.config, fetchTool.cb);

    // Logto Tools
    const createOrganizationTool = getCreateOrganizationTool(logToClient);
    const deleteOrganizationTool = getDeleteOrganizationTool(logToClient);
    const getOrganizationTool = getGetOrganizationTool(logToClient);
    const listOrganizationsTool = getListOrganizationsTool(logToClient);
    const updateOrganizationTool = getUpdateOrganizationTool(logToClient);
    // const whoAmITool = getWhoAmITool(logToClient);

    server.registerTool(
        getOrganizationTool.name,
        getOrganizationTool.config,
        getOrganizationTool.cb as unknown as ToolCallback<
            typeof getOrganizationTool.config.inputSchema
        >,
    );
    server.registerTool(
        createOrganizationTool.name,
        createOrganizationTool.config,
        createOrganizationTool.cb as unknown as ToolCallback<
            typeof createOrganizationTool.config.inputSchema
        >,
    );
    server.registerTool(
        listOrganizationsTool.name,
        listOrganizationsTool.config,
        listOrganizationsTool.cb as unknown as ToolCallback<
            typeof listOrganizationsTool.config.inputSchema
        >,
    );
    server.registerTool(
        updateOrganizationTool.name,
        updateOrganizationTool.config,
        updateOrganizationTool.cb as unknown as ToolCallback<
            typeof updateOrganizationTool.config.inputSchema
        >,
    );
    server.registerTool(
        deleteOrganizationTool.name,
        deleteOrganizationTool.config,
        deleteOrganizationTool.cb as unknown as ToolCallback<
            typeof deleteOrganizationTool.config.inputSchema
        >,
    );
    // server.registerTool(whoAmITool.name, whoAmITool.config, whoAmITool.cb);

    // Zep Tools
    const addMemoryTool = getAddMemoryTool(zepClient);
    const clearGraphTool = getClearGraphTool(zepClient);
    const deleteEntityEdgeTool = getDeleteEntityEdgeTool(zepClient);
    const deleteEpisodeTool = getDeleteEpisodeTool(zepClient);
    const getEntityEdgeTool = getGetEntityEdgeTool(zepClient);
    const getEpisodesTool = getGetEpisodesTool(zepClient);
    const searchMemoryFactsTool = getSearchMemoryFactsTool(zepClient);
    const searchMemoryNodesTool = getSearchMemoryNodesTool(zepClient);

    server.registerTool(
        addMemoryTool.name,
        addMemoryTool.config,
        addMemoryTool.cb as unknown as ToolCallback<
            typeof addMemoryTool.config.inputSchema
        >,
    );
    server.registerTool(
        searchMemoryNodesTool.name,
        searchMemoryNodesTool.config,
        searchMemoryNodesTool.cb as unknown as ToolCallback<
            typeof searchMemoryNodesTool.config.inputSchema
        >,
    );
    server.registerTool(
        searchMemoryFactsTool.name,
        searchMemoryFactsTool.config,
        searchMemoryFactsTool.cb as unknown as ToolCallback<
            typeof searchMemoryFactsTool.config.inputSchema
        >,
    );
    server.registerTool(
        deleteEntityEdgeTool.name,
        deleteEntityEdgeTool.config,
        deleteEntityEdgeTool.cb as unknown as ToolCallback<
            typeof deleteEntityEdgeTool.config.inputSchema
        >,
    );
    server.registerTool(
        deleteEpisodeTool.name,
        deleteEpisodeTool.config,
        deleteEpisodeTool.cb as unknown as ToolCallback<
            typeof deleteEpisodeTool.config.inputSchema
        >,
    );
    server.registerTool(
        getEntityEdgeTool.name,
        getEntityEdgeTool.config,
        getEntityEdgeTool.cb as unknown as ToolCallback<
            typeof getEntityEdgeTool.config.inputSchema
        >,
    );
    server.registerTool(
        getEpisodesTool.name,
        getEpisodesTool.config,
        getEpisodesTool.cb as unknown as ToolCallback<
            typeof getEpisodesTool.config.inputSchema
        >,
    );
    server.registerTool(
        clearGraphTool.name,
        clearGraphTool.config,
        clearGraphTool.cb as unknown as ToolCallback<
            typeof clearGraphTool.config.inputSchema
        >,
    );

    return server;
}
