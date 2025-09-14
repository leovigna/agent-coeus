import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";
import { deleteOrganization, deleteOrganizationMetadata } from "../sdk/deleteOrganization.js";

export function getDeleteOrganizationTool(client: LogToClient) {
    return {
        ...deleteOrganizationMetadata,
        cb: partial(toCallToolResultFn(deleteOrganization), client),
    } as const satisfies Tool<typeof deleteOrganizationMetadata.config.inputSchema, ZodRawShape>;
}
