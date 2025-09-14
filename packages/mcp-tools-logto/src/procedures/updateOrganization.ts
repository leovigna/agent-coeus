import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
import { OpenApiMeta } from "trpc-to-openapi";

import { updateOrganization, updateOrganizationMetadata } from "../sdk/updateOrganization.js";

const updateOrganizationProcedureMeta = {
    openapi: {
        method: "PATCH",
        path: `/${updateOrganizationMetadata.name}/{id}`,
        tags: ["tools", "logto"],
        summary: updateOrganizationMetadata.config.title,
        description: updateOrganizationMetadata.config.description,
    },
} as OpenApiMeta;

export const createUpdateOrganizationProcedure = toProcedurePluginFn(updateOrganizationMetadata.config.inputSchema, updateOrganization, updateOrganizationProcedureMeta);
