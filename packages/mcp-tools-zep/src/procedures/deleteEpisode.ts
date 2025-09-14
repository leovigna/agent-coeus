/* eslint-disable @typescript-eslint/no-unused-vars */
import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
// @ts-expect-error required for inference
import { Zep } from "@getzep/zep-cloud";
import { OpenApiMeta } from "trpc-to-openapi";

import { deleteEpisode, deleteEpisodeMetadata } from "../sdk/deleteEpisode.js";

const deleteEpisodeProcedureMeta = {
    openapi: {
        method: "POST", // Should be DELETE
        path: `/${deleteEpisodeMetadata.name}`,
        tags: ["tools", "zep"],
        summary: deleteEpisodeMetadata.config.title,
        description: deleteEpisodeMetadata.config.description,
    },
} as OpenApiMeta;

export const createDeleteEpisodeProcedure = toProcedurePluginFn(deleteEpisodeMetadata.config.inputSchema, deleteEpisode, deleteEpisodeProcedureMeta);
