import { createHmac, timingSafeEqual } from "crypto";

import type { Webhook } from "@coeus-agent/mcp-tools-twenty";
import { resolveTwentyMetadataClient } from "@coeus-agent/mcp-tools-twenty";
import {
    graphIdParamsSchema,
    resolveZepClient,
} from "@coeus-agent/mcp-tools-zep";
import { Zep } from "@getzep/zep-cloud";
import { initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import {
    BAD_REQUEST,
    createError,
    NOT_FOUND,
    UNAUTHORIZED,
} from "http-errors-enhanced";
import { omit } from "lodash-es";
import { generateOpenApiDocument, type OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

import { twentyMetadataClientProvider, zepClient } from "./clients/index.js";
import {
    requestHeadersMiddleware,
    requestRawBodyMiddleware,
} from "./middleware/requestMiddleware.js";

export interface WebhooksContext {
    /** *** Express Req/Response*****/
    readonly req: CreateExpressContextOptions["req"];
    readonly res?: CreateExpressContextOptions["res"];
}

export const webhooksT = initTRPC
    .context<WebhooksContext>()
    .meta<OpenApiMeta>()
    .create();

export const webhooksPublicProcedure = webhooksT.procedure
    .concat(requestHeadersMiddleware)
    .concat(requestRawBodyMiddleware);

export const createWebhooksContext = ({
    req,
    res,
}: CreateExpressContextOptions): WebhooksContext => {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        res,
    } as WebhooksContext;
};

const webhooksTwentyRouter = webhooksT.router({
    receiveEvent: webhooksPublicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/organizations/{orgId}/twenty",
                tags: ["twenty"],
                summary: "",
                description: "",
            },
        })
        .input(z.object({ orgId: z.string() }).passthrough())
        .output(z.any())
        .mutation(async ({ ctx, input }) => {
            const { headers, rawBody } = ctx;
            const { orgId } = input;

            // Twenty CRM webhook headers
            const twentyWebhookNonce = headers["x-twenty-webhook-nonce"] as
                | string
                | undefined;
            const twentyWebhookSignature = headers[
                "x-twenty-webhook-signature"
            ] as string | undefined;
            const twentyWebhookTimestamp = headers[
                "x-twenty-webhook-timestamp"
            ] as string | undefined;
            if (!twentyWebhookNonce) {
                throw createError(
                    BAD_REQUEST,
                    "missing header: x-twenty-webhook-nonce",
                ); // 400 Missing headers
            }
            if (!twentyWebhookTimestamp) {
                throw createError(
                    BAD_REQUEST,
                    "missing header: x-twenty-webhook-timestamp",
                ); // 400 Missing headers
            }
            if (!twentyWebhookSignature) {
                throw createError(
                    BAD_REQUEST,
                    "missing header: x-twenty-webhook-signature",
                ); // 400 Missing headers
            }

            // Webhook timestamp must be within 5 minutes
            if (
                parseInt(twentyWebhookTimestamp ?? "0") <
                Date.now() - 5 * 60 * 1000
            ) {
                throw createError(
                    BAD_REQUEST,
                    `outdated x-twenty-webhook-timestamp: ${twentyWebhookTimestamp}`,
                ); // 400 Outdated request
            }

            // TODO: Webhook nonce must be unprocessed

            // 1) Get Twenty webhook secret for organization
            const client = await resolveTwentyMetadataClient(
                twentyMetadataClientProvider,
                orgId,
            );
            const webhookId = input.webhookId as string;

            const webhookResponse = await client.GET("/webhooks/{id}", {
                params: { path: { id: webhookId } },
            });
            if (!webhookResponse.response.ok) {
                throw createError(
                    NOT_FOUND,
                    `webhook ${webhookId} not found for organization ${orgId}`,
                ); // 404 Webhook not found
            }
            const webhook = webhookResponse.data as Webhook; // metadata api does not match OpenAPI spec
            if (!webhook.secret) {
                throw createError(
                    BAD_REQUEST,
                    `organization ${orgId} webhook ${webhookId} is missing secret`,
                ); // 400 missing Twenty webhook secret
            }
            const twentyWebhookSecret = webhook.secret;

            // Webhook HMAC signature must be valid using twentyWebhookSecret
            // 2) Compute expected signature: HMAC-SHA256(secret, `${ts}:${rawBody}`) -> hex
            const toSign = `${twentyWebhookTimestamp}:${rawBody.toString("utf8")}`;
            const expected = createHmac("sha256", twentyWebhookSecret)
                .update(toSign)
                .digest("hex");

            // 3) Constant-time compare
            const signatureValid =
                expected.length === twentyWebhookSignature.length &&
                timingSafeEqual(
                    Buffer.from(expected),
                    Buffer.from(twentyWebhookSignature),
                );
            if (!signatureValid) {
                throw createError(
                    UNAUTHORIZED,
                    "invalid x-twenty-webhook-signature",
                ); // 401 Invalid signature
            }

            // Resolve Zep client
            const zep = await resolveZepClient(zepClient, orgId);

            // Get graph, create if not exists
            const graphId = graphIdParamsSchema.parse({
                orgId,
                userId: "all",
                name: "twenty",
            });
            try {
                await zep.graph.get(graphId);
            } catch (err) {
                if (err instanceof Zep.NotFoundError) {
                    // Create graph if not exists
                    await zep.graph.create({
                        graphId,
                        name: "Twenty CRM",
                        description: "Twenty CRM",
                    });
                } else {
                    throw err;
                }
            }

            // Cleanup event (remove orgId, targetUrl, workspaceId, webhookId, objectMetadata)
            const event = omit(input, [
                "orgId",
                "targetUrl",
                "workspaceId",
                "webhookId",
                "objectMetadata",
            ]);

            /*
            // TODO: For debugging later, capture events and derive Zod schemas with ChatGPT
            writeFileSync(
                `./data/${twentyWebhookNonce}.json`,
                JSON.stringify(input),
                "utf-8",
            );
            */

            // Store in Zep twenty database
            // TODO: Populate `createdAt` from event if possible
            const episode = await zep.graph.add({
                graphId,
                data: JSON.stringify(event),
                sourceDescription: "Twenty CRM",
                type: "json",
            });

            return episode;
        }),
});

export const webhooksAppRouter = webhooksT.router({
    // twenty
    twenty: webhooksTwentyRouter,
});

export const webhooksOpenApiDocument = generateOpenApiDocument(
    webhooksAppRouter,
    {
        title: "Coeus Webhooks OpenAPI",
        description: "OpenAPI compliant REST API for Coeus Webhooks",
        version: "1.0.0",
        baseUrl: "http://localhost:3000/webhooks",
        docsUrl: "https://github.com/leovigna/agent-coeus",
    },
);

export type WebhooksAppRouter = typeof webhooksAppRouter;
