# Technologies

Cline is always up-to-date with the latest technologies and best practices.

### Javascript
Cline MUST write valid JavaScript code that uses Node.js v20+ features and follows best practices:
- Always use ES6+ syntax and the built-in `fetch` for HTTP requests.
- Always use Node.js `import`, never use `require`.
- Always uses `sharp` for image processing if image processing is needed.

### Typescript
Cline MUST write valid Typescript syntax that uses Typescript 5.8.2+ features and follows  best practices.

### Pnpm
Cline uses pnpm as a package manager for Typescript projects.
Cline uses pnpm workspaces to manage multiple projects in the same project.
Cline installs dependencies in specific projects as needed.

### React
Cline uses React for with Vite + ShadCN building frontend Apps and UI component libraries

### Vite
Cline uses Vite as its main bundler for frontend apps and UI component libraries
- Cline does NOT use Vite for bundling non-frontend related projects such as sdks

### ESBuild
Cline uses ESbuild as its main bundler for non-fronented related Typescript projects such as sdks

### Vitest
Cline uses Vitest as its main testing framework for Typescript sdks & React frontend apps

### Nextjs
Cline uses NextJS for frontend apps that require SSR
- ALWAYS consider only building a simple single page app (SPA) using React + Vite before adding NextJs. Ask the user when in doubt.
- Cline uses App Router over the Next.js Pages Router, unless otherwise specified.

### Lodash
- Cline uses lodash-es for advanced array or object manipulations such as `mapValues` or `mapKeys`
- Cline uses JS built-ins such as `Array.map` or `Object.entries` for simple array or object manipulations

### Lucide React
Cline uses icons from "lucide-react" package for icons when available.

### Tailwind
Cline uses Tailwind CSS classes for styling when possible.
- Cline uses Tailwind v4, if Cline is unfamiliar with v4, it adds a Tailwind v4 repomix
- Cline avoids creating complex custom CSS files and prefers using tailwind CSS classes

### ShadCN
Cline uses ShadCN UI components when possible.

### Revealjs
- Cline uses revealjs for building html presentations

### Zod
Cline uses zod for schema validation when appropriate

### Tanstack Query
Cline uses Tanstack Query for data fetching when building a React SPA

### Tanstack Router
Cline uses Tanstack Router for routing when building a React SPA

### Placehold.co
Cline uses `https://placehold.co?{height}x{width}.{svg|png}?text={text}` for placeholder images.

### Mermaid
Cline uses Mermaid for diagrams and flowcharts. This is useful for visualizing complex concepts, processes, code architecture, and more.
- Cline MUST ALWAYS use quotes around the node names in Mermaid.
- Cline MUST use HTML UTF-8 codes for special characters (without `&`), such as `#43;` for the + symbol and `#45;` for the - symbol.
