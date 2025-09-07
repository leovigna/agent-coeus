import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

import { zepClient } from "../zep-client.js";

import { Tool } from "./Tool.js";

const inputSchema = {
    query: z.string().describe("The search query"),
    group_ids: z.array(z.string()).optional().describe("Optional list of group IDs to filter results"),
    max_facts: z.number().default(10).describe("Maximum number of facts to return"),
    center_node_uuid: z.string().optional().describe("Optional UUID of a node to center the search around"),
};

const cb: ToolCallback<typeof inputSchema> = async (params) => {
    const { query, group_ids, max_facts, center_node_uuid } = params;
    const results = await zepClient.graph.search({
        query,
        graphId: group_ids?.[0],
        limit: max_facts,
        centerNodeUuid: center_node_uuid,
        scope: "edges",
    });
    return {
        outputs: [
            {
                json: results,
            },
        ],
        content: [
            {
                type: "text",
                text: JSON.stringify(results),
            },
        ],
    };
};

export const searchMemoryFactsTool = {
    name: "search_memory_facts",
    config: {
        title: "Search Memory Facts",
        description: "Search the graph memory for relevant facts.",
        inputSchema,
    },
    cb,
} as const satisfies Tool<typeof inputSchema, ZodRawShape>;
