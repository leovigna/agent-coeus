import path from "path"
import { viteReactConfig } from "@leovigna/vite-config"

// https://vite.dev/config/
export default {
    ...viteReactConfig,
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}
