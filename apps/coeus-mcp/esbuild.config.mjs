import { buildLibESM, buildDistCJS, cjsBundleConfig } from "@coeus-agent/esbuild-config";

await buildLibESM();

cjsBundleConfig.platform = "node";
await buildDistCJS();
