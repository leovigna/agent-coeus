/* eslint-disable @typescript-eslint/no-unused-vars */
import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
// @ts-expect-error required for inference
import { Zep } from "@getzep/zep-cloud";
import { OpenApiMeta } from "trpc-to-openapi";

import { searchMemoryNodes, searchMemoryNodesMetadata } from "../sdk/searchMemoryNodes.js";

const searchMemoryNodesProcedureMeta = {
    openapi: {
        method: "GET",
        path: `/${searchMemoryNodesMetadata.name}`,
        tags: ["tools", "zep"],
        summary: searchMemoryNodesMetadata.config.title,
        description: searchMemoryNodesMetadata.config.description,
    },
} as OpenApiMeta;

export const createSearchMemoryNodesProcedure = toProcedurePluginFn(searchMemoryNodesMetadata.config.inputSchema, searchMemoryNodes, searchMemoryNodesProcedureMeta);
