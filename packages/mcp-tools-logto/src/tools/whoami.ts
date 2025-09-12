import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape } from "zod";

import { AuthInfo } from "../AuthInfo.js";
import { LogToClientProvider } from "../LogToClientProvider.js";
import { Tool } from "../Tool.js";

const inputSchema = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCallback(_: LogToClientProvider): ToolCallback<typeof inputSchema> {
    return (_, { authInfo }) => {
        const auth = authInfo as unknown as AuthInfo | undefined; // forced casting here due to extending type

        return {
            content: [

                { type: "text", text: JSON.stringify((auth)?.claims ?? { error: "Not authenticated" }) },
            ],
        };
    };
}

export function getWhoAmITool(provider: LogToClientProvider) {
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
