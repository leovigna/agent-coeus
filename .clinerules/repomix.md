# Repomix
Cline uses repomix artifacts when unsure about how to use a technology. This enables Cline to read the full source code about a technology in one single XML file.

Using repomix can consume signifcant amount of tokens. Only use repomix if you are unsure about how to use a technology, if using new features, or if requested by the user "Add repomix for {technology}".
- Repomix artifacts are stored under the `/repomix` folder
- Add a repomix using `pnpm exec repomix --remote https://github.com/{organization}/{repository} -o repomix/{name}.xml`
For example, if you are using zod and want to fetch the latest source code
- Check if `/repomix/zod.xml` exists
- Add the repomix if it doesn't exist `pnpm exec repomix --remote https://github.com/colinhacks/zod -o repomix/zod.xml`
- Read `/repomix/zod.xml`

Repomix provides significant advantages by enabling access to current source code:
- Access to up-to-date information beyond training data cutoff dates
- Deeper understanding of implementation details not available in documentation
- Discovery of undocumented features, components, and patterns
- More accurate and specific assistance based on actual implementations
- Better alignment with current best practices and patterns

If you are unsure about what Github repository to use do not hesitate to ask the user.
Here are some popular repositories that could be relevant.
- https://github.com/microsoft/TypeScript
- https://github.com/facebook/react
- https://github.com/vercel/next.js
- https://github.com/lucide-icons/lucide
- https://github.com/lodash/lodash
- https://github.com/eslint/eslint
- https://github.com/colinhacks/zod
- https://github.com/pmndrs/jotai
- https://github.com/hakimel/reveal.js
- https://github.com/tailwindlabs/tailwindcss
- https://github.com/shadcn-ui/ui
- https://github.com/TanStack/query
- https://github.com/TanStack/router
- https://github.com/evanw/esbuild
- https://github.com/vitejs/vite
- https://github.com/vitest-dev/vitest
