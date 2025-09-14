import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
import { OpenApiMeta } from "trpc-to-openapi";

import { listOrganizations, listOrganizationsMetadata } from "../sdk/listOrganizations.js";

const listOrganizationsProcedureMeta = {
    openapi: {
        method: "GET",
        path: `/${listOrganizationsMetadata.name}`,
        tags: ["tools", "logto"],
        summary: listOrganizationsMetadata.config.title,
        description: listOrganizationsMetadata.config.description,
    },
} as OpenApiMeta;

export const createListOrganizationsProcedure = toProcedurePluginFn(listOrganizationsMetadata.config.inputSchema, listOrganizations, listOrganizationsProcedureMeta);
