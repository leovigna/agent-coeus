import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";
import { getOrganization, getOrganizationMetadata } from "../sdk/getOrganization.js";

export function getGetOrganizationTool(client: LogToClient) {
    return {
        ...getOrganizationMetadata,
        cb: partial(toCallToolResultFn(getOrganization), client),
    } as const satisfies Tool<typeof getOrganizationMetadata.config.inputSchema, ZodRawShape>;
}
