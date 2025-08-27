import { z } from "zod";

export const RelationshipTypeSchema = z.enum(["WORKS_AT", "REPORTS_TO"]).describe("The type of relationship (e.g., `WORKS_AT`, `REPORTS_TO`).");

export const RelationshipSchema = z.object({
    type: RelationshipTypeSchema,
    from: z.string().uuid().describe("The UUID of the source entity in the relationship."),
    to: z.string().uuid().describe("The UUID of the target entity in the relationship."),
    properties: z.record(z.unknown()).optional().describe("A flexible object for storing additional data about the relationship."),
    startDate: z.string().datetime().optional().describe("The date when the relationship began."),
    endDate: z.string().datetime().optional().describe("The date when the relationship ended."),
}).describe("Defines a typed connection between two entities, such as a person working at a company.");

export type Relationship = z.infer<typeof RelationshipSchema>;
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;
