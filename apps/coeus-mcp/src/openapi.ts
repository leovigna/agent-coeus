import { generateOpenApiDocument } from "trpc-to-openapi";

import { appRouter } from "./procedures/index.js";

// Generate OpenAPI document
export const openApiDocument = generateOpenApiDocument(appRouter, {
    title: "Coeus MCP OpenAPI",
    description: "OpenAPI compliant REST API for Coeus MCP",
    version: "1.0.0",
    // baseUrl: "http://localhost:3000/auth/api",
    baseUrl: "https://neat-perfectly-buck.ngrok-free.app/auth/api",
    docsUrl: "https://github.com/leovigna/agent-coeus",
    tags: ["tools"],
});
