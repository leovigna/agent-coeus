import { router } from "../trpc.js";

import { fetchProcedure } from "./fetch.js";
import { whoamiProcedure } from "./whoami.js";

export const appRouter = router({
    fetch: fetchProcedure,
    whoami: whoamiProcedure,
});

export type AppRouter = typeof appRouter;
