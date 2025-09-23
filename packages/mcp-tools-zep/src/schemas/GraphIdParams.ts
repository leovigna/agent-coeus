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

export const graphIdRegex =
    /^(?<orgId>[a-z0-9-_]+):(?<userId>[a-z0-9]+):(?<name>[a-z0-9]+)$/;
export const graphIdSchema = z
    .string()
    .regex(graphIdRegex)
    .transform((val) => {
        const match = graphIdRegex.exec(val);
        if (!match) throw new Error("Invalid graph ID format");

        return {
            graphId: val,
            orgId: match.groups!.orgId,
            userId: match.groups!.userId,
            name: match.groups!.name,
        };
    })
    .describe("Graph ID in the format orgId:userId:name");
