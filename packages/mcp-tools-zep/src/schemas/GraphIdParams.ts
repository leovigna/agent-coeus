import { z } from "zod";

export const graphIdParamsSchema = {
    orgId: z
        .string()
        .optional()
        .describe(
            "Organization unique identifier. If not provided, uses the user's current org.",
        ),
    graphUUID: z
        .string()
        .optional()
        .describe(
            "Graph unique identifier. If not provided, uses the user's default graph.",
        ),
};
