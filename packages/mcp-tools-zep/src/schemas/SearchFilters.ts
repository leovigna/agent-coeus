import { z } from "zod";

export const dateFilterSchema = z.object({
    comparisonOperator: z
        .enum(["=", "<>", ">", "<", ">=", "<="])
        .describe("Comparison operator for date filter"),
    date: z.string().describe("Date to filter on"),
});

export const searchFiltersSchema = z
    .object({
        createdAt: z
            .array(z.array(dateFilterSchema))
            .optional()
            .describe(
                "2D array of date filters for the created_at field. The outer array elements are combined with OR logic. The inner array elements are combined with AND logic. Example: [[{”>”, date1}, {”<”, date2}], [{”=”, date3}]] This translates to: (created_at > date1 AND created_at < date2) OR (created_at = date3)",
            ),
        edgeTypes: z
            .array(z.string())
            .optional()
            .describe("List of edge types to filter on"),
        expiredAt: z
            .array(z.array(dateFilterSchema))
            .optional()
            .describe(
                "2D array of date filters for the expired_at field. The outer array elements are combined with OR logic. The inner array elements are combined with AND logic. Example: [[{”>”, date1}, {”<”, date2}], [{”=”, date3}]] This translates to: (expired_at > date1 AND expired_at < date2) OR (expired_at = date3)",
            ),
        invalidAt: z
            .array(z.array(dateFilterSchema))
            .optional()
            .describe(
                "2D array of date filters for the invalid_at field. The outer array elements are combined with OR logic. The inner array elements are combined with AND logic. Example: [[{”>”, date1}, {”<”, date2}], [{”=”, date3}]] This translates to: (invalid_at > date1 AND invalid_at < date2) OR (invalid_at = date3)",
            ),
        nodeLabels: z
            .array(z.string())
            .optional()
            .describe("List of node labels to filter on"),
        validAt: z
            .array(z.array(dateFilterSchema))
            .optional()
            .describe(
                "2D array of date filters for the valid_at field. The outer array elements are combined with OR logic. The inner array elements are combined with AND logic. Example: [[{”>”, date1}, {”<”, date2}], [{”=”, date3}]] This translates to: (valid_at > date1 AND valid_at < date2) OR (valid_at = date3)",
            ),
    })
    .optional()
    .describe("Search filters to apply to the search");
