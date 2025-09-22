/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LogToClient } from "@coeus-agent/mcp-tools-logto";
// @ts-expect-error imported for type reference
import type { Zep } from "@getzep/zep-cloud";

import {
    createAddDataBatchProcedure,
    createAddDataProcedure,
    createCreateGraphProcedure,
    createDeleteGraphProcedure,
    createGetGraphEdgesProcedure,
    createGetGraphEpisodesProcedure,
    createGetGraphProcedure,
    createListEntityTypesProcedure,
    createListGraphsProcedure,
    createSearchGraphProcedure,
} from "./sdk/index.js";
import type { ZepClientProvider } from "./ZepClientProvider.js";

export function createZepPlugin(ctx: {
    logToClient: LogToClient;
    zepClientProvider: ZepClientProvider;
}) {
    // Edge
    const getGraphEdges = createGetGraphEdgesProcedure(ctx);
    // Episode
    const getGraphEpisodes = createGetGraphEpisodesProcedure(ctx);
    // Graph
    const addData = createAddDataProcedure(ctx);
    const addDataBatch = createAddDataBatchProcedure(ctx);
    const createGraph = createCreateGraphProcedure(ctx);
    const deleteGraph = createDeleteGraphProcedure(ctx);
    const getGraph = createGetGraphProcedure(ctx);
    const listEntityTypes = createListEntityTypesProcedure(ctx);
    const listGraphs = createListGraphsProcedure(ctx);
    const searchGraph = createSearchGraphProcedure(ctx);

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
