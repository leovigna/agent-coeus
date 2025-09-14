import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
import { OpenApiMeta } from "trpc-to-openapi";

import { getOrganization, getOrganizationMetadata } from "../sdk/getOrganization.js";

const getOrganizationProcedureMeta = {
    openapi: {
        method: "GET",
        path: `/${getOrganizationMetadata.name}/{id}`,
        tags: ["tools", "logto"],
        summary: getOrganizationMetadata.config.title,
        description: getOrganizationMetadata.config.description,
    },
} as OpenApiMeta;

export const createGetOrganizationProcedure = toProcedurePluginFn(getOrganizationMetadata.config.inputSchema, getOrganization, getOrganizationProcedureMeta);
