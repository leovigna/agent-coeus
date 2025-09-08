import { router } from "../trpc.js";

import { addMemoryProcedure } from "./addMemory.js";
import { clearGraphProcedure } from "./clearGraph.js";
import { deleteEntityEdgeProcedure } from "./deleteEntityEdge.js";
import { deleteEpisodeProcedure } from "./deleteEpisode.js";
import { fetchProcedure } from "./fetch.js";
import { getEntityEdgeProcedure } from "./getEntityEdge.js";
import { getEpisodesProcedure } from "./getEpisodes.js";
import { searchProcedure } from "./search.js";
import { searchMemoryFactsProcedure } from "./searchMemoryFacts.js";
import { searchMemoryNodesProcedure } from "./searchMemoryNodes.js";
import { whoamiProcedure } from "./whoami.js";

export const appRouter = router({
    add_memory: addMemoryProcedure,
    clear_graph: clearGraphProcedure,
    delete_entity_edge: deleteEntityEdgeProcedure,
    delete_episode: deleteEpisodeProcedure,
    fetch: fetchProcedure,
    get_entity_edge: getEntityEdgeProcedure,
    get_episodes: getEpisodesProcedure,
    search: searchProcedure,
    search_memory_facts: searchMemoryFactsProcedure,
    search_memory_nodes: searchMemoryNodesProcedure,
    whoami: whoamiProcedure,
});

export type AppRouter = typeof appRouter;
