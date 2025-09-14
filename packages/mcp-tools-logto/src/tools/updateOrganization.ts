import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";
import { updateOrganization, updateOrganizationMetadata } from "../sdk/updateOrganization.js";

export function getUpdateOrganizationTool(client: LogToClient) {
    return {
        ...updateOrganizationMetadata,
        cb: partial(toCallToolResultFn(updateOrganization), client),
    } as const satisfies Tool<typeof updateOrganizationMetadata.config.inputSchema, ZodRawShape>;
}
