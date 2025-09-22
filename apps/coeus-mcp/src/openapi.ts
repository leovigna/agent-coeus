import { generateOpenApiDocument } from "trpc-to-openapi";

import { appRouter } from "./trpcAppRouter.js";

// Generate OpenAPI document
const description = "OpenAPI compliant REST API for Coeus MCP";
const openApiDocument = generateOpenApiDocument(appRouter, {
    title: "Coeus MCP OpenAPI",
    description,
    version: "1.0.0",
    baseUrl: "http://localhost:3000/api",
    docsUrl: "https://github.com/leovigna/agent-coeus",
});

openApiDocument.servers = [
    {
        url: "http://localhost:3000/api",
        description: "Local development server",
    },
    {
        url: "https://neat-perfectly-buck.ngrok-free.app/api",
        description: "Local development proxy",
    },
]; // set servers to support dual environment setup (local + ngrok)
openApiDocument.openapi = "3.1.0"; // set OpenAPI version to 3.1.0 (preferred by ChatGPT Actions)

export { openApiDocument };
