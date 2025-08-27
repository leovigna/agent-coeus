import { z } from "zod";

export const TagSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the tag."),
    name: z.string().min(1).describe("The name of the tag (e.g., \"Lead\", \"Customer\")."),
    color: z.string().optional().describe("A color code (e.g., hex) to visually represent the tag."),
}).describe("A label that can be applied to entities like `Company` or `Person` for categorization and filtering.");

export type Tag = z.infer<typeof TagSchema>;
