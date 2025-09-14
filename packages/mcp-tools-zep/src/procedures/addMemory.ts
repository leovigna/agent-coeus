/* eslint-disable @typescript-eslint/no-unused-vars */
import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
// @ts-expect-error required for inference
import { Zep } from "@getzep/zep-cloud";
import { OpenApiMeta } from "trpc-to-openapi";

import { addMemory, addMemoryMetadata } from "../sdk/addMemory.js";

const createAddMemoryProcedureMeta = {
    openapi: {
        method: "POST",
        path: `/${addMemoryMetadata.name}`,
        tags: ["tools", "zep"],
        summary: addMemoryMetadata.config.title,
        description: addMemoryMetadata.config.description,
    },
} as OpenApiMeta;

export const createAddMemoryProcedure = toProcedurePluginFn(addMemoryMetadata.config.inputSchema, addMemory, createAddMemoryProcedureMeta);
