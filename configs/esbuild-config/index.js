import { build } from 'esbuild';

const baseConfig = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    external: [],
};

export async function buildLib() {
    await build({
        ...baseConfig,
        format: 'esm',
        outfile: 'dist/index.js',
    });

    await build({
        ...baseConfig,
        format: 'cjs',
        outfile: 'dist/index.cjs',
    });
}
