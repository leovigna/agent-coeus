import { router } from "../trpc.js";

import { fetchProcedure } from "./fetch.js";

export const appRouter = router({
    fetch: fetchProcedure,
});

export type AppRouter = typeof appRouter;
