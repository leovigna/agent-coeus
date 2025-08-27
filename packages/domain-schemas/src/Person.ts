import { z } from "zod";

import { TagSchema } from "./Tag.js";

export const PersonSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the person."),
    name: z.string().min(1).describe("The full name of the person."),
    email: z.string().email().optional().describe("The person's email address."),
    phone: z.string().optional().describe("The person's phone number."),
    telegram: z.string().optional().describe("The person's Telegram handle."),
    title: z.string().optional().describe("The person's job title."),
    department: z.string().optional().describe("The department the person works in."),
    location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        timezone: z.string().optional(),
    }).optional().describe("The geographical location of the person."),
    linkedin_url: z.string().url().optional().describe("The URL of the person's LinkedIn profile."),
    tags: z.array(TagSchema).optional().describe("An array of tags associated with the person."),
    metadata: z.record(z.unknown()).optional().describe("A flexible object for storing additional custom data."),
    created_at: z.string().datetime().describe("The timestamp when the person was created."),
    updated_at: z.string().datetime().describe("The timestamp of the last update."),
}).describe("An individual person, typically a contact associated with a company.");

export type Person = z.infer<typeof PersonSchema>;
