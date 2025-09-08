import { initTRPC } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

export const t = initTRPC.meta<OpenApiMeta>().create();

export const publicProcedure = t.procedure;
export const router = t.router;
