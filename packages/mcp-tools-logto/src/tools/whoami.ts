import { AuthInfo, Tool } from "@coeus-agent/mcp-tools-base";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";

const inputSchema = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCallback(_: LogToClient): ToolCallback<typeof inputSchema> {
    return (_, { authInfo }) => {
        const auth = authInfo as unknown as AuthInfo | undefined; // forced casting here due to extending type

        return {
            content: [

                { type: "text", text: JSON.stringify((auth)?.claims ?? { error: "Not authenticated" }) },
            ],
        };
    };
}

export function getWhoAmITool(provider: LogToClient) {
    return {
        name: "whoami",
        config: {
            title: "Who am I?",
            description: "Retrieve information about the current user.",
            inputSchema,
        },
        cb: getCallback(provider),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
