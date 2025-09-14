import { toProcedurePluginFn } from "@coeus-agent/mcp-tools-base";
import { OpenApiMeta } from "trpc-to-openapi";

import { createOrganization, createOrganizationMetadata } from "../sdk/createOrganization.js";

const createOrganizationProcedureMeta = {
    openapi: {
        method: "POST",
        path: `/${createOrganizationMetadata.name}`,
        tags: ["tools", "logto"],
        summary: createOrganizationMetadata.config.title,
        description: createOrganizationMetadata.config.description,
    },
} as OpenApiMeta;

export const createCreateOrganizationProcedure = toProcedurePluginFn(createOrganizationMetadata.config.inputSchema, createOrganization, createOrganizationProcedureMeta);
