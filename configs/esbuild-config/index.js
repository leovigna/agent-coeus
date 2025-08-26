const { build } = require('esbuild');

const baseConfig = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    external: [],
};

async function buildPackage(format) {
    await build({
        ...baseConfig,
        format,
        outfile: `dist/index.${format === 'esm' ? 'js' : 'cjs'}`,
    });
}

buildPackage('esm');
buildPackage('cjs');
