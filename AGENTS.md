# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/` defines public routes; each `.astro` file maps directly to a URL.
- `src/components/`, `src/layouts/`, and `src/utils/` hold reusable UI, layouts, and helpers.
- `src/content/` (validated by `content.config.ts`) stores Markdown/MDX collections. Notes live in `src/content/notes/` and use frontmatter (`title`, `createdAt`, `modifiedAt`, `isDraft`). Files prefixed with `_` are ignored by the loader.
- Static assets live in `public/`; build artifacts land in `dist/`.
- Planning notes live under `plans/` for feature histories.

## Build, Test, and Development Commands
- `npm install` bootstraps dependencies.
- `npm run dev` starts Astro with hot reload.
- `npm run build` runs `astro check` before emitting the optimized bundle in `dist/`.
- `npm run preview` serves the built site; use it to confirm PhotoSwipe routing and content filters.

## Coding Style & Naming Conventions
- Stick to TypeScript and Astro templates with 2-space indentation; match existing formatting (no trailing commas in objects).
- Favor named exports and PascalCase component filenames (`GalleryModal.astro`). Content collection slugs stay kebab-case.
- Use path aliases (`@components/...`, `@data/...`, `@utils/...`, etc.) instead of deep relative chains.
- Run `npm run build` before pushing to verify schema compliance and link hygiene.

## Content & Styling Workflow
- Wrap long-form content in `ProseWrapper` to inherit the Tufte-inspired grid.
- Margin notes use `@components/Sidenote.astro`; let it manage numbering and mobile toggles.
- Figure components (`BaseFigure`, `SidenoteImage`, `ImageGrid`) rely on grid helper classes like `.kickout-left`. Keep captions succinct.
- Research PDFs belong in `public/attachments/`; photography assets live under `src/assets/` for Astro’s image optimizer.

## Testing Guidelines
- `astro check` (triggered by `npm run build`) is the primary static test; run it on every branch.
- Document manual walk-through steps for major UI changes and flag new content schemas in PRs.
- If you introduce automated tests (Playwright, Vitest), keep them in `src/tests/` and record the command here.

## Commit & Pull Request Guidelines
- Use short, imperative commit subjects (e.g., `docs: organize implementation plans`, `Refactor gallery paths`). Prefix with Conventional Commit scopes (`docs:`, `feat:`) when it clarifies intent.
- Reference related plans or issues in the commit body. Group unrelated changes into separate commits to keep diffs reviewable.
- PRs should summarize user-facing impact, list manual validation steps (dev server, preview build), and include before/after screenshots for visual tweaks.
