/* eslint-disable @typescript-eslint/no-unused-vars */
import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
// @ts-expect-error required for inference
import { Zep } from "@getzep/zep-cloud";
import { OpenApiMeta } from "trpc-to-openapi";

import { searchMemoryFacts, searchMemoryFactsMetadata } from "../sdk/searchMemoryFacts.js";

const searchMemoryFactsProcedureMeta = {
    openapi: {
        method: "GET",
        path: `/${searchMemoryFactsMetadata.name}`,
        tags: ["tools", "zep"],
        summary: searchMemoryFactsMetadata.config.title,
        description: searchMemoryFactsMetadata.config.description,
    },
} as OpenApiMeta;

export const createSearchMemoryFactsProcedure = toProcedurePluginFn(searchMemoryFactsMetadata.config.inputSchema, searchMemoryFacts, searchMemoryFactsProcedureMeta);
