import { z } from "zod";

export const graphIdParamsSchema = z
    .object({
        orgId: z.string().regex(/^[a-z0-9-_]+$/),
        userId: z.string().regex(/^[a-z0-9]+$/),
        name: z.string().regex(/^[a-z0-9]+$/),
    })
    .transform(({ orgId, userId, name }) => {
        return `${orgId}:${userId}:${name}`;
    });

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
