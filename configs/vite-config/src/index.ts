/// <reference types="vitest" />
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import CheckerPlugin from "vite-plugin-checker";
import { ngrok } from "vite-plugin-ngrok";
import { nodePolyfills, PolyfillOptions } from "vite-plugin-node-polyfills";
import SVGRPlugin from "vite-plugin-svgr";

// Plugin issue v0.17+ https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/81#issuecomment-2325104572
const nodePolyfillsFix = (options?: PolyfillOptions): Plugin => {
    return {
        ...nodePolyfills(options),
        // @ts-expect-error typescript error not important
        resolveId(source: string) {
            const m =
                /^vite-plugin-node-polyfills\/shims\/(buffer|global|process)$/.exec(
                    source,
                );
            if (m) {
                return `node_modules/vite-plugin-node-polyfills/shims/${m[1]}/dist/index.cjs`;
            }
        },
    };
};

export const viteConfig = defineConfig({
    plugins: [],
    test: {
        globals: false,
        globalSetup: "vitest.setup.ts",
        testTimeout: 60000,
        watch: true,
        include: ["src/**/*.test.ts"],
    },
});

const { NGROK_AUTH_TOKEN, NGROK_DOMAIN } = loadEnv("", process.cwd(), "NGROK");

const pluginsReact = [
    react(),
    tailwindcss(),
    TanStackRouterVite(),
    SVGRPlugin({
        svgrOptions: {
            icon: "100%",
        },
    }),
    CheckerPlugin({
        typescript: true, // TODO: Disable for now
        overlay: true,
        eslint: {
            useFlatConfig: true,
            lintCommand: "eslint src",
        },
    }),
    nodePolyfillsFix(),
];

if (NGROK_AUTH_TOKEN)
    pluginsReact.push(
        ngrok({
            domain: NGROK_DOMAIN,
            authtoken: NGROK_AUTH_TOKEN,
        }),
    );

export const viteReactConfig = defineConfig({
    plugins: pluginsReact,
    test: {
        globals: false,
        globalSetup: "vitest.setup.ts",
        testTimeout: 60000,
        watch: true,
        include: ["src/**/*.test.ts"],
    },
});
