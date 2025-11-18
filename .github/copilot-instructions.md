<!-- .github/copilot-instructions.md - Guidance for AI coding agents working on this repository -->

# Repo overview (high level)

- **Framework**: This is a Next.js app using the App Router (`app/` directory). Primary entry points are `app/layout.tsx` and `app/page.tsx`.
- **Language**: TypeScript with `strict` mode enabled (`tsconfig.json`).
- **Styling**: Tailwind CSS + a minimal `app/globals.css` for theme variables.
- **Runtime**: Frontend-only application (no server-side API folder present). Targeted Next.js version is `16.x` and React `19.x` (see `package.json`).

# Big-picture architecture & patterns

- The project uses Next.js App Router. Files inside `app/` are server components by default; add `"use client"` at the top of a file to make it a client component.
- Global layout and fonts are configured in `app/layout.tsx` (see `Geist` font imports). Keep global UI changes there.
- Global CSS lives in `app/globals.css`. Tailwind utilities are expected (Tailwind config exists in repo root via `postcss.config.mjs`).
- Static assets are in `public/` (e.g., `public/next.svg`, `public/vercel.svg`) and referenced from components using `/`-rooted paths or `next/image`.

# Developer workflows (commands you can run)

- Install & run dev server: `npm install` then `npm run dev` (starts `next dev`, serves on port 3000 by default).
- Build for production: `npm run build` then `npm run start` (uses `next build` / `next start`).
- Linting: `npm run lint` (script maps to `eslint`; repo has `eslint.config.mjs`).

# Project-specific conventions (do not assume defaults)

- Components inside `app/` are server components by default. Avoid using browser-only APIs (window, localStorage, DOM) unless the file includes `"use client"` and appropriate client-side logic.
- TypeScript is strict—functions/components should have explicit types where necessary (the `tsconfig.json` sets `strict: true`).
- Keep global UI changes and font setup in `app/layout.tsx`. Small page-level UI belongs in `app/page.tsx` or new files under `app/`.
- There are no API routes or serverless functions in this repo. If you need backend behavior, confirm where to add it (not present in the current tree).

# Integration points & external dependencies

- `next.config.ts` is present but empty—feature flags or rewrites would be added there.
- Tailwind/PostCSS integrated (`postcss.config.mjs`), so prefer Tailwind utility classes for layout and styling.
- Vercel is the intended deployment target (README references Vercel). Keep serverless/edge config minimal unless requested.

# Files to inspect for context/examples

- `package.json` — scripts, Next/React versions, dependencies.
- `app/layout.tsx` — global layout, fonts, metadata.
- `app/page.tsx` — the main page scaffold and example of Tailwind usage.
- `app/globals.css` — global variables and theme handling.
- `next.config.ts` & `tsconfig.json` — build/runtime and TypeScript behavior.

# Agent guidelines (how to make safe, useful changes)

- Small UI changes: edit `app/page.tsx` or add a new file under `app/` and update `app/layout.tsx` only for global changes.
- Styling changes: prefer Tailwind classes; update `app/globals.css` for tokens (colors/fonts); do not replace the Tailwind pipeline.
- Adding client-side interactivity: add `"use client"` to the top of the component file and limit scope to that component.
- Add tests only if the user asks; repo has no test harness configured.
- Do not assume any backend: if a change requires an API route or server, ask the user where to host it or whether to scaffold an `api/` directory.

# Typical change examples (use these as templates)

- Add a new page: create `app/your-page/page.tsx` exporting a default React component (server component by default).
- Add a client widget: create `app/components/Widget.tsx` with `"use client"` at top; import into a page.
- Add global CSS token: edit `app/globals.css` and reference the variable in components.

# Known gaps / things to ask the user about

- There are no tests or CI configuration in the repo. Ask whether to add them.
- `app/nav.tsx` is empty (placeholder). Confirm intended nav structure if you plan to add global navigation.
- `next.config.ts` is empty—confirm any runtime features (image domains, rewrites, env handling).

# When editing code

- Preserve the App Router semantics (server vs client components). Prefer minimal, focused commits and keep changes to one logical concern per PR.
- Keep TypeScript types consistent with `tsconfig.json` and ensure no new compiler warnings.
- Run `npm run dev` locally after edits and verify pages render—report any console build errors.

---

If anything above is unclear or you'd like me to expand a section (example PR templates, CI, or test scaffolding), tell me which part to iterate on.
