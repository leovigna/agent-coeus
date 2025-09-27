/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
// @ts-expect-error imported for type reference
import type { Zep } from "@getzep/zep-cloud";

import {
    addDataBatchProcedureFactory,
    addDataProcedureFactory,
    createGraphProcedureFactory,
    deleteGraphProcedureFactory,
    getGraphEdgesProcedureFactory,
    getGraphEpisodesProcedureFactory,
    getGraphProcedureFactory,
    listEntityTypesProcedureFactory,
    listGraphsProcedureFactory,
    searchGraphProcedureFactory,
} from "./sdk/index.js";
import type { ZepClientProvider } from "./ZepClientProvider.js";

export function createZepPlugin(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    // Edge
    const getGraphEdges = getGraphEdgesProcedureFactory(ctx);
    // Episode
    const getGraphEpisodes = getGraphEpisodesProcedureFactory(ctx);
    // Graph
    const addData = addDataProcedureFactory(ctx);
    const addDataBatch = addDataBatchProcedureFactory(ctx);
    const createGraph = createGraphProcedureFactory(ctx);
    const deleteGraph = deleteGraphProcedureFactory(ctx);
    const getGraph = getGraphProcedureFactory(ctx);
    const listEntityTypes = listEntityTypesProcedureFactory(ctx);
    const listGraphs = listGraphsProcedureFactory(ctx);
    const searchGraph = searchGraphProcedureFactory(ctx);

    return {
        getGraphEdges,
        getGraphEpisodes,
        addData,
        addDataBatch,
        createGraph,
        deleteGraph,
        getGraph,
        listEntityTypes,
        listGraphs,
        searchGraph,
    };
}
