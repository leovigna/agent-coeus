import { buildLibESM, buildDistESM } from "@coeus-agent/esbuild-config";

await buildLibESM();
await buildDistESM();
