import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { LogToClient } from "../LogToClient.js";
import { deleteOrganization, deleteOrganizationMetadata } from "../sdk/deleteOrganization.js";

export function createDeleteOrganizationProcedure(client: LogToClient, tags = ["tools", "logto"]) {
    const deleteOrganizationWithClient = partial(deleteOrganization, client);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "DELETE",
            path: `/${deleteOrganizationMetadata.name}/{id}`,
            tags,
            summary: deleteOrganizationMetadata.config.title,
            description: deleteOrganizationMetadata.config.description,
        },
    }).input(z.object(deleteOrganizationMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await deleteOrganizationWithClient(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
