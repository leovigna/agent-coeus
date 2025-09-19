import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import {
    getCreateOrganizationTool,
    getDeleteOrganizationTool,
    getGetOrganizationTool,
    getListOrganizationsTool,
    getUpdateOrganizationTool,
} from "@coeus-agent/mcp-tools-logto";
import type { ZepClientProvider } from "@coeus-agent/mcp-tools-zep";
import {
    getAddDataBatchTool,
    getAddDataTool,
    getCreateGraphTool,
    getDeleteGraphTool,
    getGetGraphEdgesTool,
    getGetGraphEpisodesTool,
    getGetGraphTool,
    getListEntityTypesTool,
    getSearchGraphTool,
} from "@coeus-agent/mcp-tools-zep";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

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

    // const whoAmITool = getWhoAmITool(logToClient);
    const tools = [
        // logto/organization
        getCreateOrganizationTool(logToClient),
        getGetOrganizationTool(logToClient),
        getListOrganizationsTool(logToClient),
        getUpdateOrganizationTool(logToClient),
        getDeleteOrganizationTool(logToClient),
        // zep/graph
        getCreateGraphTool({ logToClient, zepClientProvider: zepClient }),
        getGetGraphTool({ logToClient, zepClientProvider: zepClient }),
        getSearchGraphTool({ logToClient, zepClientProvider: zepClient }),
        getListEntityTypesTool({ logToClient, zepClientProvider: zepClient }),
        getAddDataTool({ logToClient, zepClientProvider: zepClient }),
        getAddDataBatchTool({ logToClient, zepClientProvider: zepClient }),
        getDeleteGraphTool({ logToClient, zepClientProvider: zepClient }),
        // zep/edge
        getGetGraphEdgesTool({ logToClient, zepClientProvider: zepClient }),
        // zep/episode
        getGetGraphEpisodesTool({ logToClient, zepClientProvider: zepClient }),
    ];

    tools.forEach((tool) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        server.registerTool(tool.name, tool.config, tool.cb as unknown as any);
    });

    return server;
}
