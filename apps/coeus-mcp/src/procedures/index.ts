import { listGraphs } from "@coeus-agent/mcp-tools-zep";

import { router } from "../trpc.js";

import { getGraphEdgesProcedure } from "./edge/index.js";
import { getGraphEpisodesProcedure } from "./episode/index.js";
import {
    addDataBatchProcedure,
    addDataProcedure,
    createGraphProcedure,
    deleteGraphProcedure,
    getGraphProcedure,
    listEntityTypesProcedure,
    listGraphsProcedure,
    searchGraphProcedure,
} from "./graph/index.js";
import {
    createOrganizationProcedure,
    deleteOrganizationProcedure,
    getOrganizationProcedure,
    listOrganizationsProcedure,
    updateOrganizationProcedure,
} from "./organization/index.js";

export const appRouter = router({
    // logto/organization
    createOrganization: createOrganizationProcedure,
    getOrganization: getOrganizationProcedure,
    listOrganizations: listOrganizationsProcedure,
    updateOrganization: updateOrganizationProcedure,
    deleteOrganization: deleteOrganizationProcedure,
    // zep/graph
    createGraph: createGraphProcedure,
    getGraph: getGraphProcedure,
    searchGraph: searchGraphProcedure,
    listEntityTypes: listEntityTypesProcedure,
    listGraphs: listGraphsProcedure,
    addData: addDataProcedure,
    addDataBatch: addDataBatchProcedure,
    deleteGraph: deleteGraphProcedure,
    // zep/edge
    getGraphEdges: getGraphEdgesProcedure,
    // zep/episode
    getGraphEpisodes: getGraphEpisodesProcedure,
});

export type AppRouter = typeof appRouter;
