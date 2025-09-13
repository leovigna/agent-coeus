import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { LogToClient } from "../LogToClient.js";
import { updateOrganization, updateOrganizationMetadata } from "../sdk/updateOrganization.js";

export function createUpdateOrganizationProcedure(client: LogToClient, tags = ["tools", "logto"]) {
    const updateOrganizationWithClient = partial(updateOrganization, client);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "PATCH",
            path: `/${updateOrganizationMetadata.name}/{id}`,
            tags,
            summary: updateOrganizationMetadata.config.title,
            description: updateOrganizationMetadata.config.description,
        },
    }).input(z.object(updateOrganizationMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await updateOrganizationWithClient(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
