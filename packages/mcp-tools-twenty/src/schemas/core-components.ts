import { z } from "zod";

import type { components } from "./core-api.js";

export const startingAfterSchema = z
    .string()
    .describe(
        "Returns objects starting after a specific cursor. You can find cursors in **startCursor** and **endCursor** in **pageInfo** in response data",
    );

export const endingBeforeSchema = z
    .string()
    .describe(
        "Returns objects ending before a specific cursor. You can find cursors in **startCursor** and **endCursor** in **pageInfo** in response data",
    );

const COMPARATORS = z.enum([
    "eq",
    "neq",
    "in",
    "containsAny",
    "is",
    "gt",
    "gte",
    "lt",
    "lte",
    "startsWith",
    "like",
    "ilike",
]);

export const filterSchema = z
    .string()
    .refine(
        (value) => {
            const parts = value.split(",");
            return parts.every((part) => {
                const match = /([^[]+)\[([^\]]+)\]:(.*)/.exec(part);
                if (!match) return false;
                const [, , comparator] = match;
                return COMPARATORS.safeParse(comparator).success;
            });
        },
        {
            message:
                "Invalid filter format. Expected format: field[COMPARATOR]:value,field2[COMPARATOR]:value2",
        },
    )
    .describe(
        "Format: field[COMPARATOR]:value,field2[COMPARATOR]:value2. Refer to the filter section at the top of the page for more details.",
    );

export const depthSchema = z
    .union([z.literal(0), z.literal(1)])
    .default(1)
    .describe(
        "Determines the level of nested related objects to include in the response. 0: Primary object only, 1: Primary object + direct relations",
    );

const DIRECTIONS = z.enum([
    "AscNullsFirst",
    "AscNullsLast",
    "DescNullsFirst",
    "DescNullsLast",
]);

export const orderBySchema = z
    .string()
    .refine(
        (value) => {
            const parts = value.split(",");
            return parts.every((part) => {
                const match = /([^[]+)(\[([^\]]+)\])?/.exec(part);
                if (!match) return false;
                const [, , , direction] = match;
                if (direction) {
                    return DIRECTIONS.safeParse(direction).success;
                }
                return true;
            });
        },
        {
            message:
                "Invalid orderBy format. Expected format: field_name_1,field_name_2[DIRECTION_2]",
        },
    )
    .describe(
        "Format: field_name_1,field_name_2[DIRECTION_2]. Refer to the filter section at the top of the page for more details.",
    );

export const limitSchema = z
    .number()
    .int()
    .min(1)
    .max(100)
    .describe("Limits the number of objects returned.");

// TODO: Should we split into Component, ComponentForUpdate, ComponentForResponse?
export type Company = components["schemas"]["Company"];
export type Person = components["schemas"]["Person"];
export type Task = components["schemas"]["Task"];
export type Note = components["schemas"]["Note"];
export type Message = components["schemas"]["Message"];

const LinkSchema = z.object({
    primaryLinkLabel: z.string().optional(),
    primaryLinkUrl: z.string().optional(),
    secondaryLinks: z
        .array(
            z.object({
                url: z.string().url().optional(),
                label: z.string().optional(),
            }),
        )
        .optional(),
});

export const CompanySchema = z
    .object({
        accountOwnerId: z.string().uuid().optional(),
        name: z.string().optional().describe("The company name"),
        domainName: LinkSchema.optional().describe(
            "The company website URL. We use this url to fetch the company icon",
        ),
        employees: z
            .number()
            .optional()
            .describe("Number of employees in the company"),
        linkedinLink: LinkSchema.optional().describe(
            "The company Linkedin account",
        ),
        xLink: LinkSchema.optional().describe("The company Twitter/X account"),
        annualRecurringRevenue: z
            .object({
                amountMicros: z.number().optional(),
                currencyCode: z.string().optional(),
            })
            .optional()
            .describe(
                "Annual Recurring Revenue: The actual or estimated annual revenue of the company",
            ),
        address: z
            .object({
                addressStreet1: z.string().optional(),
                addressStreet2: z.string().optional(),
                addressCity: z.string().optional(),
                addressPostcode: z.string().optional(),
                addressState: z.string().optional(),
                addressCountry: z.string().optional(),
                addressLat: z.number().optional(),
                addressLng: z.number().optional(),
            })
            .optional()
            .describe("Address of the company"),
        idealCustomerProfile: z
            .boolean()
            .optional()
            .describe(
                "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you",
            ),
        position: z.number().optional().describe("Company record position"),
        createdBy: z
            .object({
                source: z
                    .enum([
                        "EMAIL",
                        "CALENDAR",
                        "WORKFLOW",
                        "API",
                        "IMPORT",
                        "MANUAL",
                        "SYSTEM",
                        "WEBHOOK",
                    ])
                    .optional(),
            })
            .optional()
            .describe("The creator of the record"),
    })
    .passthrough()
    .describe("A company");

export const PersonSchema = z
    .object({
        avatarUrl: z.string().url().optional().describe("Contact’s avatar"),
        city: z.string().optional().describe("Contact’s city"),
        phones: z
            .object({
                additionalPhones: z.array(z.string()).optional(),
                primaryPhoneCountryCode: z.string().optional(),
                primaryPhoneCallingCode: z.string().optional(),
                primaryPhoneNumber: z.string().optional(),
            })
            .optional()
            .describe("Contact’s phone numbers"),
        jobTitle: z.string().optional().describe("Contact’s job title"),
        xLink: LinkSchema.optional().describe("Contact’s X/Twitter account"),
        linkedinLink: LinkSchema.optional().describe(
            "Contact’s Linkedin account",
        ),
        emails: z
            .object({
                primaryEmail: z.string().email().optional(),
                additionalEmails: z.array(z.string().email()).optional(),
            })
            .optional()
            .describe("Contact’s Emails"),
        name: z
            .object({
                firstName: z.string().optional(),
                lastName: z.string().optional(),
            })
            .optional()
            .describe("Contact’s name"),
        companyId: z.string().uuid().optional(),
        createdBy: z
            .object({
                source: z
                    .enum([
                        "EMAIL",
                        "CALENDAR",
                        "WORKFLOW",
                        "API",
                        "IMPORT",
                        "MANUAL",
                        "SYSTEM",
                        "WEBHOOK",
                    ])
                    .optional(),
            })
            .optional()
            .describe("The creator of the record"),
        position: z.number().optional().describe("Person record Position"),
    })
    .passthrough()
    .describe("A person");

export const TaskSchema = z
    .object({
        position: z.number().optional().describe("Task record position"),
        assigneeId: z.string().uuid().optional(),
        createdBy: z
            .object({
                source: z
                    .enum([
                        "EMAIL",
                        "CALENDAR",
                        "WORKFLOW",
                        "API",
                        "IMPORT",
                        "MANUAL",
                        "SYSTEM",
                        "WEBHOOK",
                    ])
                    .optional(),
            })
            .optional()
            .describe("The creator of the record"),
        status: z
            .enum(["TODO", "IN_PROGRESS", "DONE"])
            .optional()
            .describe("Task status"),
        dueAt: z.string().datetime().optional().describe("Task due date"),
        bodyV2: z
            .object({
                blocknote: z.string().optional(),
                markdown: z.string().optional(),
            })
            .optional()
            .describe("Task body"),
        title: z.string().optional().describe("Task title"),
    })
    .passthrough()
    .describe("A task");

export const NoteSchema = z
    .object({
        createdBy: z
            .object({
                source: z
                    .enum([
                        "EMAIL",
                        "CALENDAR",
                        "WORKFLOW",
                        "API",
                        "IMPORT",
                        "MANUAL",
                        "SYSTEM",
                        "WEBHOOK",
                    ])
                    .optional(),
            })
            .optional()
            .describe("The creator of the record"),
        bodyV2: z
            .object({
                blocknote: z.string().optional(),
                markdown: z.string().optional(),
            })
            .optional()
            .describe("Note body"),
        position: z.number().optional().describe("Note record position"),
        title: z.string().optional().describe("Note title"),
    })
    .passthrough()
    .describe("A note");

export const MessageSchema = z
    .object({
        headerMessageId: z
            .string()
            .optional()
            .describe("Message id from the message header"),
        subject: z.string().optional().describe("Subject"),
        text: z.string().optional().describe("Text"),
        receivedAt: z
            .string()
            .datetime()
            .optional()
            .describe("The date the message was received"),
        messageThreadId: z.string().uuid().optional(),
    })
    .passthrough()
    .describe(
        "A message sent or received through a messaging channel (email, chat, etc.)",
    );
