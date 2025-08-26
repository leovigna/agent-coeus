import { z } from 'zod';

export const MCPRequestSchema = z.object({
    method: z.string(),
    params: z.unknown(),
});

export function validateRequest(request: unknown) {
    return MCPRequestSchema.safeParse(request);
}
