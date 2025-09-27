import { existsSync, mkdirSync, writeFileSync } from "fs";

import { openApiDocument } from "../openapi.js";
import { webhooksOpenApiDocument } from "../trpcWebhooks.js";

function main() {
    if (!existsSync("./openapi")) {
        mkdirSync("./openapi");
    }
    writeFileSync("./openapi/api.json", JSON.stringify(openApiDocument));
    writeFileSync(
        "./openapi/webhooks.json",
        JSON.stringify(webhooksOpenApiDocument),
    );
}

main();
