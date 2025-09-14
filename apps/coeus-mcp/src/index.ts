import { readFileSync } from "fs";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { logToClient, zepClient } from "./clients/index.js";
import { registerMcpTools } from "./mcp.js";
import { getExpressApp } from "./server.js";

async function main() {
    // MCP Server
    const instructions = readFileSync("./MCP_INSTRUCTIONS.md", "utf-8");
    const mcpServer = new McpServer({
        name: "coeus-mcp",
        version: "1.0.0",
    }, { instructions },
    );
    registerMcpTools(mcpServer, { logToClient, zepClient });
    const mcpTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });

    // Express server
    const port = process.env.PORT ?? 3000;
    const app = await getExpressApp({ mcpServer, mcpTransport });
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}

main().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});
