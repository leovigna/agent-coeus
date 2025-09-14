/* eslint-disable @typescript-eslint/no-unused-vars */
import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
// @ts-expect-error required for inference
import { Zep } from "@getzep/zep-cloud";
import { OpenApiMeta } from "trpc-to-openapi";

import { getEpisodes, getEpisodesMetadata } from "../sdk/getEpisodes.js";

const getEpisodesProcedureMeta = {
    openapi: {
        method: "GET",
        path: `/${getEpisodesMetadata.name}`,
        tags: ["tools", "zep"],
        summary: getEpisodesMetadata.config.title,
        description: getEpisodesMetadata.config.description,
    },
} as OpenApiMeta;

export const createGetEpisodesProcedure = toProcedurePluginFn(getEpisodesMetadata.config.inputSchema, getEpisodes, getEpisodesProcedureMeta);
