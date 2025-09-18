/* eslint-disable @typescript-eslint/no-explicit-any */
import { initTRPC } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { OpenApiMeta } from "trpc-to-openapi";

import { requestMiddleware } from "./middleware/requestMiddleware.js";

export interface Context {
    /** *** Express Req/Response*****/
    readonly req: {
        body: Record<string, any>;
        headers: Record<string, any>;
        [k: string]: any;
    };
    readonly res?: CreateExpressContextOptions["res"];
}

export const t = initTRPC.context<Context>().meta<OpenApiMeta>().create();

export const publicProcedure = t.procedure.concat(requestMiddleware);
export const router = t.router;

/**
 * createContext creates the initial context. Middlewares can add to this context
 * NOTE: This is only called in the express server when a request is made.
 * When testing you need to create to create a context and pass it to a procedure call
 */
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
