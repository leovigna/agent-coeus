import { createLogToPlugin } from "@coeus-agent/mcp-tools-logto";
import { createZepPlugin } from "@coeus-agent/mcp-tools-zep";
import { z } from "zod";

import { logToClient, zepClient } from "./clients/index.js";
import { publicProcedure, router } from "./trpc.js";

const logToPlugin = createLogToPlugin({ logToClient });
const logToRouter = router({
    createOrganization: publicProcedure
        .concat(logToPlugin.createOrganization)
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
        .concat(logToPlugin.updateOrganization)
        .output(z.any())
        .mutation(({ ctx: { result } }) => result),
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

export const appRouter = router({
    // logto/organization
    logTo: logToRouter,
    // zep
    zep: zepRouter,
});

export type AppRouter = typeof appRouter;
