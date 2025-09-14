/* eslint-disable @typescript-eslint/no-unused-vars */
import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
// @ts-expect-error required for inference
import { Zep } from "@getzep/zep-cloud";
import { OpenApiMeta } from "trpc-to-openapi";

import { deleteEntityEdge, deleteEntityEdgeMetadata } from "../sdk/deleteEntityEdge.js";

const deleteEntityEdgeProcedureMeta = {
    openapi: {
        method: "POST", // Should be DELETE, but OpenAPI spec doesn't support request body for DELETE
        path: `/${deleteEntityEdgeMetadata.name}`,
        tags: ["tools", "zep"],
        summary: deleteEntityEdgeMetadata.config.title,
        description: deleteEntityEdgeMetadata.config.description,
    },
} as OpenApiMeta;

export const createDeleteEntityEdgeProcedure = toProcedurePluginFn(deleteEntityEdgeMetadata.config.inputSchema, deleteEntityEdge, deleteEntityEdgeProcedureMeta);
