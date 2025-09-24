import type { Client } from "openapi-fetch";
import createClient from "openapi-fetch";

import type { paths as twentyCorePaths } from "./schemas/twenty-core.js";
import type { paths as twentyMetadataPaths } from "./schemas/twenty-metadata.js";

export type TwentyCoreClient = Client<twentyCorePaths>;
export type TwentyMetadataClient = Client<twentyMetadataPaths>;

export const createTwentyCoreClient = createClient<twentyCorePaths>;
export const createTwentyMetadataClient = createClient<twentyMetadataPaths>;
