import { toCallToolResultFn, Tool } from "@coeus-agent/mcp-tools-base";
import { partial } from "lodash-es";
import { ZodRawShape } from "zod";

import { LogToClient } from "../LogToClient.js";
import { createOrganization, createOrganizationMetadata } from "../sdk/createOrganization.js";

export function getCreateOrganizationTool(client: LogToClient) {
    return {
        ...createOrganizationMetadata,
        cb: partial(toCallToolResultFn(createOrganization), client),
    } as const satisfies Tool<typeof createOrganizationMetadata.config.inputSchema, ZodRawShape>;
}
