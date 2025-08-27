import { z } from "zod";

export const CompanySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    domain: z.string().optional(),
    industry: z.string().optional(),
    size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
    location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        timezone: z.string().optional(),
    }).optional(),
    description: z.string().optional(),
    employee_count: z.number().int().positive().optional(),
    founded_year: z.number().int().positive().optional(),
    website: z.string().url().optional(),
    metadata: z.record(z.unknown()).optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export const PersonSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    title: z.string().optional(),
    department: z.string().optional(),
    location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        timezone: z.string().optional(),
    }).optional(),
    linkedin_url: z.string().url().optional(),
    metadata: z.record(z.unknown()).optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export const RelationshipTypeSchema = z.enum(["WORKS_AT", "REPORTS_TO"]);

export const RelationshipSchema = z.object({
    type: RelationshipTypeSchema,
    from: z.string().uuid(),
    to: z.string().uuid(),
    properties: z.record(z.unknown()).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

export type Company = z.infer<typeof CompanySchema>;
export type Person = z.infer<typeof PersonSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;
