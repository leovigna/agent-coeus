import { initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { OpenApiMeta } from "trpc-to-openapi";

import { requestAuthInfoMiddleware } from "./middleware/requestMiddleware.js";

export interface Context {
    /** *** Express Req/Response*****/
    readonly req: CreateExpressContextOptions["req"];
    readonly res?: CreateExpressContextOptions["res"];
}

export const t = initTRPC.context<Context>().meta<OpenApiMeta>().create();

export const publicProcedure = t.procedure.concat(requestAuthInfoMiddleware);
export const router = t.router;

export const createContext = ({
    req,
    res,
}: CreateExpressContextOptions): Context => {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        res,
    } as Context;
};
