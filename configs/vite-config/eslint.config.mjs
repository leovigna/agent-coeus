import { typecheckedConfigs } from "@leovigna/eslint-config"

export default [
    ...typecheckedConfigs,
    {
        files: ["index.mjs"],
    }
]
