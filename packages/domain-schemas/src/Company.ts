import { z } from "zod";

import { TagSchema } from "./Tag.js";

export const CompanySchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the company."),
    name: z.string().min(1).describe("The name of the company."),
    domain: z.string().optional().describe("The company's primary domain (e.g., `example.com`)."),
    industry: z.string().optional().describe("The industry the company operates in."),
    size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional().describe("The size of the company."),
    location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        timezone: z.string().optional(),
    }).optional().describe("The geographical location of the company."),
    description: z.string().optional().describe("A brief description of the company."),
    employee_count: z.number().int().positive().optional().describe("The number of employees."),
    founded_year: z.number().int().positive().optional().describe("The year the company was founded."),
    website: z.string().url().optional().describe("The company's official website URL."),
    tags: z.array(TagSchema).optional().describe("An array of tags associated with the company."),
    metadata: z.record(z.unknown()).optional().describe("A flexible object for storing additional custom data."),
    created_at: z.string().datetime().describe("The timestamp when the company was created."),
    updated_at: z.string().datetime().describe("The timestamp of the last update."),
}).describe("A company or organization that is tracked in the CRM.");

export type Company = z.infer<typeof CompanySchema>;
