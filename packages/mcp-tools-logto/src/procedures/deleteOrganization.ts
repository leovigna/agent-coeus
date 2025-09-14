import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
import { OpenApiMeta } from "trpc-to-openapi";

import { deleteOrganization, deleteOrganizationMetadata } from "../sdk/deleteOrganization.js";

const deleteOrganizationProcedureMeta = {
    openapi: {
        method: "DELETE",
        path: `/${deleteOrganizationMetadata.name}/{id}`,
        tags: ["tools", "logto"],
        summary: deleteOrganizationMetadata.config.title,
        description: deleteOrganizationMetadata.config.description,
    },
} as OpenApiMeta;

export const createDeleteOrganizationProcedure = toProcedurePluginFn(deleteOrganizationMetadata.config.inputSchema, deleteOrganization, deleteOrganizationProcedureMeta);
