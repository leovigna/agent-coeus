import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { LogToClient } from "../LogToClient.js";
import { createOrganization, createOrganizationMetadata } from "../sdk/createOrganization.js";

export function createCreateOrganizationProcedure(client: LogToClient, tags = ["tools", "logto"]) {
    const createOrganizationWithClient = partial(createOrganization, client);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "POST",
            path: `/${createOrganizationMetadata.name}`,
            tags,
            summary: createOrganizationMetadata.config.title,
            description: createOrganizationMetadata.config.description,
        },
    }).input(z.object(createOrganizationMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await createOrganizationWithClient(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
