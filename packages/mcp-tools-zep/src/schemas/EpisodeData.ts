import { z } from "zod";

export const episodeDataSchema = {
    createdAt: z.string().optional().describe("Creation date of the episode"),
    data: z.string().describe("Content of the episode"),
    sourceDescription: z
        .string()
        .max(500, { message: "sourceDescription <= 500 characters" })
        .describe("Description of the source"),
    type: z
        .enum(["text", "json", "message"])
        .default("text")
        .describe("Source type"),
};
