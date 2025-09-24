import { z } from "zod";

import type { components } from "./metadata-api.js";

export type Webhook = components["schemas"]["Webhook"];

export const WebhookSchema = z
    .object({
        targetUrl: z.string().url(),
        operations: z.array(z.string()).default(["*.*"]),
        description: z.string().optional(),
        secret: z.string().optional(),
    })
    .passthrough()
    .describe("A webhook");
