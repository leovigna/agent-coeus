import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
import {
    deleteOrganizationToolFactory,
    getMeProfileToolFactory,
    getOrganizationToolFactory,
    listOrganizationsToolFactory,
} from "@coeus-agent/mcp-tools-logto";
import {
    createCompanyToolFactory,
    createMessageToolFactory,
    createNoteToolFactory,
    createPersonToolFactory,
    createTaskToolFactory,
    createWebhookToolFactory,
    deleteCompanyToolFactory,
    deleteMessageToolFactory,
    deleteNoteToolFactory,
    deletePersonToolFactory,
    deleteTaskToolFactory,
    deleteWebhookToolFactory,
    findCompaniesToolFactory,
    findMessagesToolFactory,
    findNotesToolFactory,
    findPeopleToolFactory,
    findTasksToolFactory,
    findWebhooksToolFactory,
    getCompanyToolFactory,
    getMessageToolFactory,
    getNoteToolFactory,
    getPersonToolFactory,
    getTaskToolFactory,
    getWebhookToolFactory,
    updateCompanyToolFactory,
    updateMessageToolFactory,
    updateNoteToolFactory,
    updatePersonToolFactory,
    updateTaskToolFactory,
    updateWebhookToolFactory,
} from "@coeus-agent/mcp-tools-twenty";
import type { ZepClientProvider } from "@coeus-agent/mcp-tools-zep";
import {
    addDataBatchToolFactory,
    addDataToolFactory,
    createGraphToolFactory,
    deleteGraphToolFactory,
    getGraphEdgesToolFactory,
    getGraphEpisodesToolFactory,
    getGraphToolFactory,
    listEntityTypesToolFactory,
    listGraphsToolFactory,
    searchGraphToolFactory,
} from "@coeus-agent/mcp-tools-zep";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
    twentyCoreClientProvider,
    twentyMetadataClientProvider,
} from "./clients/twenty-client.js";
import { SYSTEM_PROMPT } from "./prompts.js";
import {
    createOrganizationToolFactory,
    updateOrganizationToolFactory,
} from "./sdk/index.js";

export function registerMcpTools(
    server: McpServer,
    clients: {
        logToClient: LogToClient;
        zepClient: ZepClientProvider;
    },
) {
    const { logToClient, zepClient } = clients;
    const tools = [
        // logto/organization
        createOrganizationToolFactory({ logToClient }),
        getOrganizationToolFactory({ logToClient }),
        listOrganizationsToolFactory({ logToClient }),
        updateOrganizationToolFactory({ logToClient }),
        deleteOrganizationToolFactory({ logToClient }),
        getMeProfileToolFactory({ logToClient }),
        // zep/graph
        createGraphToolFactory({ logToClient, zepClientProvider: zepClient }),
        getGraphToolFactory({ logToClient, zepClientProvider: zepClient }),
        searchGraphToolFactory({ logToClient, zepClientProvider: zepClient }),
        listEntityTypesToolFactory({
            logToClient,
            zepClientProvider: zepClient,
        }),
        listGraphsToolFactory({ logToClient, zepClientProvider: zepClient }),
        addDataToolFactory({ logToClient, zepClientProvider: zepClient }),
        addDataBatchToolFactory({ logToClient, zepClientProvider: zepClient }),
        deleteGraphToolFactory({ logToClient, zepClientProvider: zepClient }),
        // zep/edge
        getGraphEdgesToolFactory({ logToClient, zepClientProvider: zepClient }),
        // zep/episode
        getGraphEpisodesToolFactory({
            logToClient,
            zepClientProvider: zepClient,
        }),
        // twenty-core/company
        createCompanyToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        deleteCompanyToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        findCompaniesToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        getCompanyToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        updateCompanyToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        // twenty-core/person
        createPersonToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        deletePersonToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        findPeopleToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        getPersonToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        updatePersonToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        // twenty-core/task
        createTaskToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        deleteTaskToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        findTasksToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        getTaskToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        updateTaskToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        // twenty-core/note
        createNoteToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        deleteNoteToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        findNotesToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        getNoteToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        updateNoteToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        // twenty-core/message
        createMessageToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        deleteMessageToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        findMessagesToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        getMessageToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        updateMessageToolFactory({
            logToClient,
            twentyCoreClientProvider,
        }),
        // twenty-metadata/webhook
        createWebhookToolFactory({
            logToClient,
            twentyMetadataClientProvider,
        }),
        deleteWebhookToolFactory({
            logToClient,
            twentyMetadataClientProvider,
        }),
        findWebhooksToolFactory({
            logToClient,
            twentyMetadataClientProvider,
        }),
        getWebhookToolFactory({
            logToClient,
            twentyMetadataClientProvider,
        }),
        updateWebhookToolFactory({
            logToClient,
            twentyMetadataClientProvider,
        }),
    ];

    tools.forEach((tool) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        server.registerTool(tool.name, tool.config, tool.cb as unknown as any);
    });

    server.registerPrompt(
        "sytem",
        {
            title: "Sytem Prompt",
            description: "Main system prompt",
        },
        () => {
            return {
                messages: [
                    {
                        role: "assistant",
                        content: {
                            type: "text",
                            text: SYSTEM_PROMPT,
                        },
                    },
                ],
            };
        },
    );

    return server;
}
