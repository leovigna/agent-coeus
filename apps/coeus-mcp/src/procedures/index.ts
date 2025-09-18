import { router } from "../trpc.js";

import {
    deleteEntityEdgeProcedure,
    getEntityEdgeProcedure,
} from "./edge/index.js";
import {
    deleteEpisodeProcedure,
    getEpisodesProcedure,
} from "./episode/index.js";
import {
    addMemoryProcedure,
    deleteGraphProcedure,
    searchMemoryFactsProcedure,
    searchMemoryNodesProcedure,
} from "./graph/index.js";
import {
    createOrganizationProcedure,
    deleteOrganizationProcedure,
    getOrganizationProcedure,
    listOrganizationsProcedure,
    updateOrganizationProcedure,
} from "./organization/index.js";
import { whoamiProcedure } from "./whoami.js";

export const appRouter = router({
    // Zep
    add_memory: addMemoryProcedure,
    clear_graph: deleteGraphProcedure,
    delete_entity_edge: deleteEntityEdgeProcedure,
    delete_episode: deleteEpisodeProcedure,
    get_entity_edge: getEntityEdgeProcedure,
    get_episodes: getEpisodesProcedure,
    search_memory_facts: searchMemoryFactsProcedure,
    search_memory_nodes: searchMemoryNodesProcedure,
    // LogTo
    create_organization: createOrganizationProcedure,
    delete_organization: deleteOrganizationProcedure,
    get_organization: getOrganizationProcedure,
    list_organizations: listOrganizationsProcedure,
    update_organization: updateOrganizationProcedure,
    whoami: whoamiProcedure,
});

export type AppRouter = typeof appRouter;
