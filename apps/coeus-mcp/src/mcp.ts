import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import {
    getDeleteOrganizationTool,
    getGetMeProfileTool,
    getGetOrganizationTool,
    getListOrganizationsTool,
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
    getListGraphsTool,
    getSearchGraphTool,
} from "@coeus-agent/mcp-tools-zep";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { SYSTEM_PROMPT } from "./prompts.js";
import {
    getCreateOrganizationTool,
    getUpdateOrganizationTool,
} from "./sdk/index.js";

export function registerMcpTools(
    server: McpServer,
    clients: {
        logToClient: LogToClient;
        zepClient: ZepClientProvider;
    },
) {
    const { logToClient, zepClient } = clients;
    const tools = [
        // logto/organization
        getCreateOrganizationTool(logToClient),
        getGetOrganizationTool(logToClient),
        getListOrganizationsTool(logToClient),
        getUpdateOrganizationTool(logToClient),
        getDeleteOrganizationTool(logToClient),
        getGetMeProfileTool(logToClient),
        // zep/graph
        getCreateGraphTool({ logToClient, zepClientProvider: zepClient }),
        getGetGraphTool({ logToClient, zepClientProvider: zepClient }),
        getSearchGraphTool({ logToClient, zepClientProvider: zepClient }),
        getListEntityTypesTool({ logToClient, zepClientProvider: zepClient }),
        getListGraphsTool({ logToClient, zepClientProvider: zepClient }),
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

    server.registerPrompt(
        "sytem",
        {
            title: "Sytem Prompt",
            description: "Main system prompt",
        },
        () => {
            return {
                messages: [
                    {
                        role: "assistant",
                        content: {
                            type: "text",
                            text: SYSTEM_PROMPT,
                        },
                    },
                ],
            };
        },
    );

    return server;
}
