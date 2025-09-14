/* eslint-disable @typescript-eslint/no-unused-vars */
import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
// @ts-expect-error required for inference
import { Zep } from "@getzep/zep-cloud";
import { OpenApiMeta } from "trpc-to-openapi";

import { clearGraph, clearGraphMetadata } from "../sdk/clearGraph.js";

const clearGraphProcedureMeta = {
    openapi: {
        method: "POST",
        path: `/${clearGraphMetadata.name}`,
        tags: ["tools", "zep"],
        summary: clearGraphMetadata.config.title,
        description: clearGraphMetadata.config.description,
    },
} as OpenApiMeta;

export const createClearGraphProcedure = toProcedurePluginFn(clearGraphMetadata.config.inputSchema, clearGraph, clearGraphProcedureMeta);
