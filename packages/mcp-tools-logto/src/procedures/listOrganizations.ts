import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { LogToClient } from "../LogToClient.js";
import { listOrganizations, listOrganizationsMetadata } from "../sdk/listOrganizations.js";

export function createListOrganizationsProcedure(client: LogToClient, tags = ["tools", "logto"]) {
    const listOrganizationsWithClient = partial(listOrganizations, client);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "GET",
            path: `/${listOrganizationsMetadata.name}`,
            tags,
            summary: listOrganizationsMetadata.config.title,
            description: listOrganizationsMetadata.config.description,
        },
    }).input(z.object(listOrganizationsMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await listOrganizationsWithClient(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
