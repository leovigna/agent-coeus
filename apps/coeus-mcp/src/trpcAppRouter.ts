import { createLogToPlugin } from "@coeus-agent/mcp-tools-logto";
import {
    createTwentyCorePlugin,
    createTwentyMetadataPlugin,
} from "@coeus-agent/mcp-tools-twenty";
import { createZepPlugin } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import {
    logToClient,
    twentyCoreClientProvider,
    twentyMetadataClientProvider,
    twentyWebhookUrlProvider,
    zepClient,
} from "./clients/index.js";
import { SYSTEM_PROMPT } from "./prompts.js";
import {
    createOrganizationProcedure,
    updateOrganizationProcedure,
} from "./sdk/index.js";
import { publicProcedure, router } from "./trpc.js";

const logToPlugin = createLogToPlugin({ logToClient });
const logToRouter = router({
    createOrganization: publicProcedure
        .concat(createOrganizationProcedure)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    deleteOrganization: publicProcedure
        .concat(logToPlugin.deleteOrganization)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    getOrganization: publicProcedure
        .concat(logToPlugin.getOrganization)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    listOrganizations: publicProcedure
        .concat(logToPlugin.listOrganizations)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    updateOrganization: publicProcedure
        .concat(updateOrganizationProcedure)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    getMeProfile: publicProcedure
        .concat(logToPlugin.getMeProfile)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
});

const zepPlugin = createZepPlugin({
    logToClient,
    zepClientProvider: zepClient,
});
const zepRouter = router({
    // Edge
    getGraphEdges: publicProcedure
        .concat(zepPlugin.getGraphEdges)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    // Episode
    getGraphEpisodes: publicProcedure
        .concat(zepPlugin.getGraphEpisodes)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    // Graph
    addData: publicProcedure
        .concat(zepPlugin.addData)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    addDataBatch: publicProcedure
        .concat(zepPlugin.addDataBatch)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    createGraph: publicProcedure
        .concat(zepPlugin.createGraph)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    deleteGraph: publicProcedure
        .concat(zepPlugin.deleteGraph)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    getGraph: publicProcedure
        .concat(zepPlugin.getGraph)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    listEntityTypes: publicProcedure
        .concat(zepPlugin.listEntityTypes)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    listGraphs: publicProcedure
        .concat(zepPlugin.listGraphs)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    searchGraph: publicProcedure
        .concat(zepPlugin.searchGraph)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
});

const twentyCorePlugin = createTwentyCorePlugin({
    logToClient,
    twentyCoreClientProvider,
});
const twentyCoreRouter = router({
    createCompany: publicProcedure
        .concat(twentyCorePlugin.createCompany)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    deleteCompany: publicProcedure
        .concat(twentyCorePlugin.deleteCompany)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    findCompanies: publicProcedure
        .concat(twentyCorePlugin.findCompanies)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    getCompany: publicProcedure
        .concat(twentyCorePlugin.getCompany)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    updateCompany: publicProcedure
        .concat(twentyCorePlugin.updateCompany)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    createPerson: publicProcedure
        .concat(twentyCorePlugin.createPerson)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    deletePerson: publicProcedure
        .concat(twentyCorePlugin.deletePerson)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    findPeople: publicProcedure
        .concat(twentyCorePlugin.findPeople)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    getPerson: publicProcedure
        .concat(twentyCorePlugin.getPerson)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    updatePerson: publicProcedure
        .concat(twentyCorePlugin.updatePerson)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    createTask: publicProcedure
        .concat(twentyCorePlugin.createTask)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    deleteTask: publicProcedure
        .concat(twentyCorePlugin.deleteTask)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    findTasks: publicProcedure
        .concat(twentyCorePlugin.findTasks)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    getTask: publicProcedure
        .concat(twentyCorePlugin.getTask)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    updateTask: publicProcedure
        .concat(twentyCorePlugin.updateTask)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    createNote: publicProcedure
        .concat(twentyCorePlugin.createNote)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    deleteNote: publicProcedure
        .concat(twentyCorePlugin.deleteNote)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    findNotes: publicProcedure
        .concat(twentyCorePlugin.findNotes)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    getNote: publicProcedure
        .concat(twentyCorePlugin.getNote)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    updateNote: publicProcedure
        .concat(twentyCorePlugin.updateNote)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    createMessage: publicProcedure
        .concat(twentyCorePlugin.createMessage)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    deleteMessage: publicProcedure
        .concat(twentyCorePlugin.deleteMessage)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    findMessages: publicProcedure
        .concat(twentyCorePlugin.findMessages)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    getMessage: publicProcedure
        .concat(twentyCorePlugin.getMessage)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    updateMessage: publicProcedure
        .concat(twentyCorePlugin.updateMessage)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
});

const twentyMetadataPlugin = createTwentyMetadataPlugin({
    logToClient,
    twentyMetadataClientProvider,
    twentyWebhookUrlProvider,
});
const twentyMetadataRouter = router({
    createWebhook: publicProcedure
        .concat(twentyMetadataPlugin.createWebhook)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    createWebhookCoeus: publicProcedure
        .concat(twentyMetadataPlugin.createWebhookCoeus)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    deleteWebhook: publicProcedure
        .concat(twentyMetadataPlugin.deleteWebhook)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
    findWebhooks: publicProcedure
        .concat(twentyMetadataPlugin.findWebhooks)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    getWebhook: publicProcedure
        .concat(twentyMetadataPlugin.getWebhook)
        .output(z.any())
        .query(({ ctx: { result } }) => result),
    updateWebhook: publicProcedure
        .concat(twentyMetadataPlugin.updateWebhook)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
});

const promptsRouter = router({
    systemPrompt: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/prompt/system",
                tags: ["prompts"],
                summary: "Get System Prompt",
                description: "Returns the system prompt used by default.",
            },
        })
        .input(z.void())
        .output(z.object({ prompt: z.string() }))
        .query(() => {
            return { prompt: SYSTEM_PROMPT };
        }),
});
export const appRouter = router({
    // logto/organization
    logTo: logToRouter,
    // zep
    zep: zepRouter,
    // prompts
    prompts: promptsRouter,
    // twenty-core
    twenty: twentyCoreRouter,
    // twenty-metadata
    twentyMetadata: twentyMetadataRouter,
});

export type AppRouter = typeof appRouter;
