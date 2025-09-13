import { AuthInfo } from "@coeus-agent/mcp-tools-base";
import { initTRPC } from "@trpc/server";
import { partial } from "lodash-es";
import { OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { LogToClient } from "../LogToClient.js";
import { getOrganization, getOrganizationMetadata } from "../sdk/getOrganization.js";

export function createGetOrganizationProcedure(client: LogToClient, tags = ["tools", "logto"]) {
    const getOrganizationWithClient = partial(getOrganization, client);
    const t = initTRPC.context<{ authInfo: AuthInfo }>().meta<OpenApiMeta>().create();

    return t.procedure.meta({
        openapi: {
            method: "GET",
            path: `/${getOrganizationMetadata.name}/{id}`,
            tags,
            summary: getOrganizationMetadata.config.title,
            description: getOrganizationMetadata.config.description,
        },
    }).input(z.object(getOrganizationMetadata.config.inputSchema))
        .use(async ({ input, ctx, next }) => {
            const authInfo = ctx.authInfo;
            const extra = { authInfo };
            const result = await getOrganizationWithClient(input, extra);
            return next({
                ctx: {
                    result,
                },
            });
        });
}
