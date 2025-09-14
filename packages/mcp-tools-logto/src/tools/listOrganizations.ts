import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";
import { listOrganizations, listOrganizationsMetadata } from "../sdk/listOrganizations.js";

export function getListOrganizationsTool(client: LogToClient) {
    return {
        ...listOrganizationsMetadata,
        cb: partial(toCallToolResultFn(listOrganizations), client),
    } as const satisfies Tool<typeof listOrganizationsMetadata.config.inputSchema, ZodRawShape>;
}
