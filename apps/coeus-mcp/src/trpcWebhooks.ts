import { initTRPC } from "@trpc/server";
import { generateOpenApiDocument, type OpenApiMeta } from "trpc-to-openapi";
import { z } from "zod";

export const webhooksT = initTRPC.meta<OpenApiMeta>().create();

export const webhooksPublicProcedure = webhooksT.procedure;

const webhooksTwentyRouter = webhooksT.router({
    receiveEvent: webhooksPublicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/twenty/{id}",
                tags: ["twenty"],
                summary: "",
                description: "",
            },
        })
        .input(z.object({ id: z.string() }))
        .output(z.object({ status: z.string() }))
        .mutation(({ input }) => {
            // Handle the incoming webhook event from Twenty CRM
            console.log("Received Twenty CRM webhook event:", input);
            // Process the event as needed
            return { status: "success" };
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
