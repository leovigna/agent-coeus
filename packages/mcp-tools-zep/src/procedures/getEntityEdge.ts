/* eslint-disable @typescript-eslint/no-unused-vars */
import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
// @ts-expect-error required for inference
import { Zep } from "@getzep/zep-cloud";
import { OpenApiMeta } from "trpc-to-openapi";

import { getEntityEdge, getEntityEdgeMetadata } from "../sdk/getEntityEdge.js";

const getEntityEdgeProcedureMeta = {
    openapi: {
        method: "GET",
        path: `/${getEntityEdgeMetadata.name}/{uuid}`,
        tags: ["tools", "zep"],
        summary: getEntityEdgeMetadata.config.title,
        description: getEntityEdgeMetadata.config.description,
    },
} as OpenApiMeta;

export const createGetEntityEdgeProcedure = toProcedurePluginFn(getEntityEdgeMetadata.config.inputSchema, getEntityEdge, getEntityEdgeProcedureMeta);
