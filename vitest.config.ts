import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        setupFiles: ['./test/setup.ts'],
        coverage: {
            reporter: ['text', 'json', 'html'],
        },
    },
});
