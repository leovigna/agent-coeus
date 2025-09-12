import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { AuthInfo } from "../AuthInfo.js";
import { LogToClientProvider, resolveLogToClient } from "../LogToClientProvider.js";
import { Tool } from "../Tool.js";

const inputSchema = {
    name: z.string(),
};

function getCallback(provider: LogToClientProvider): ToolCallback<typeof inputSchema> {
    return async (_, { authInfo }) => {
        const client = await resolveLogToClient(provider, authInfo as unknown as AuthInfo);

        console.debug(client);
        /*
        client.apiClient.POST("/api/organizations", {
            name: "New Organization",
        });
        */

        return {
            content: [

                { type: "text", text: "" },
            ],
        };
    };
}

export function getCreateOrgTool(provider: LogToClientProvider) {
    return {
        name: "create_org",
        config: {
            title: "Create organization",
            description: "Create a new organization.",
            inputSchema,
        },
        cb: getCallback(provider),
    } as const satisfies Tool<typeof inputSchema, ZodRawShape>;
}
