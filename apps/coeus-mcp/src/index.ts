import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { getExpressApp, getMcpServer } from "./server.js";

const mcpServer = getMcpServer();
const mcpTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
});

// Start server
const port = process.env.PORT ?? 3000;

const app = await getExpressApp({ mcpServer, mcpTransport });
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
