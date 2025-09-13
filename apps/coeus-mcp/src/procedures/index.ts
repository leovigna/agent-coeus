import { router } from "../trpc.js";

import { addMemoryProcedure } from "./addMemory.js";
import { clearGraphProcedure } from "./clearGraph.js";
import { createOrganizationProcedure } from "./createOrganization.js";
import { deleteEntityEdgeProcedure } from "./deleteEntityEdge.js";
import { deleteEpisodeProcedure } from "./deleteEpisode.js";
import { deleteOrganizationProcedure } from "./deleteOrganization.js";
import { getEntityEdgeProcedure } from "./getEntityEdge.js";
import { getEpisodesProcedure } from "./getEpisodes.js";
import { getOrganizationProcedure } from "./getOrganization.js";
import { listOrganizationsProcedure } from "./listOrganizations.js";
import { searchMemoryFactsProcedure } from "./searchMemoryFacts.js";
import { searchMemoryNodesProcedure } from "./searchMemoryNodes.js";
import { updateOrganizationProcedure } from "./updateOrganization.js";
import { whoamiProcedure } from "./whoami.js";

export const appRouter = router({
    // Zep
    add_memory: addMemoryProcedure,
    clear_graph: clearGraphProcedure,
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
