import { typecheckedConfigs } from "@coeus-agent/eslint-config"

export default [
    ...typecheckedConfigs,
    {
        files: ["index.mjs"],
    }
]
