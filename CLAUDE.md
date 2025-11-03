# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website built with Astro, deployed to GitHub Pages. It serves as both a professional portfolio and a public digital notebook, featuring research work, CV, and notes/travel photography documentation. The site uses a Tufte CSS-inspired design emphasizing typography and sidenotes.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (runs astro check then builds)
npm run build

# Preview production build
npm run preview
```

## Architecture

### Content System

The site uses Astro's content collections system (v5) with the glob loader pattern. Content is defined in `src/content.config.ts`:

- **Notes collection**: MDX files in `src/content/notes/` with schema defined in `src/types/note.ts`
- Notes have frontmatter: `title`, `isDraft`, `createdAt`, `modifiedAt`
- Files prefixed with `_` are ignored by the glob pattern `**/[^_]*.{md,mdx}`

### TypeScript Path Aliases

The project uses path aliases configured in `tsconfig.json`:
- `@assets/*` → `src/assets/*`
- `@components/*` → `src/components/*`
- `@css/*` → `src/css/*`
- `@data/*` → `src/data/*`
- `@layouts/*` → `src/layouts/*`
- `@mttypes/*` → `src/types/*`
- `@utils/*` → `src/utils/*`

### Layout Structure

**Two primary layouts:**
1. `Layout.astro` - Base layout with HTML structure, imports reset/shared CSS
2. `NotesLayout.astro` - Extends base layout, wraps content in `ProseWrapper`, handles note metadata

**ProseWrapper component**: Defines CSS grid for main content area with designated columns for text and margin notes. Uses `grid-column` extensively to position elements.

### Styling System

The site uses a layered CSS approach:
- `reset.css` - CSS reset
- `shared.css` - Shared variables and grid definitions
- Additional CSS files for specific needs (tufte.css, latex.css, cv.css, deflist.css)

**CSS Grid**: The prose layout uses a named grid with columns for: page margins, left-kickout, text content, right margin (for sidenotes), and right-kickout.

### Key Components

**Sidenote.astro**: Sophisticated implementation of margin notes and sidenotes
- Auto-generates unique IDs using crypto API
- Two modes: numbered sidenotes (`num=true`) and margin notes (`num=false`)
- Uses CSS counters for automatic numbering
- Responsive: on narrow screens, notes toggle via checkbox input
- `inflow` prop controls whether sidenote height affects text flow

**Figure components**:
- `BaseFigure.astro` - Base figure wrapper with optional caption
- `CustomFigure.astro` - Extends BaseFigure for custom content
- `BasicImage.astro` - Simple image with Astro's image optimization
- `SidenoteImage.astro` - Images in the margin
- `ImageGrid.astro` - Photo grid layouts

### Data Files

**CV data** (`src/data/cv.ts`): TypeScript file exporting arrays for professional experience, education, publications, patents, talks, etc. Used by CV page and components.

**Artifacts data** (`src/data/artifacts.ts`): Similar pattern for other content.

### RSS Feed

`src/pages/rss.xml.ts` generates an RSS feed of notes:
- Uses Astro Container API to render MDX content to HTML
- Filters draft notes in production via `import.meta.env.PROD`
- Renders full note content in feed items

### Static Assets

- Research papers and PDFs in `public/attachments/research/papers/`
- ET Book webfonts in `public/type/et-book/`
- Photography in `src/assets/` (optimized via Astro's image service)

## Component Patterns

When creating new components:
- Use `ProseWrapper` for long-form content that needs sidenote support
- Import components in MDX files with full paths: `import Sidenote from "@components/Sidenote.astro"`
- Use CSS grid classes (`.kickout-left`, `.kickout-right`, `.kickout-both`) for wider layouts
- Astro's `<slot />` pattern for component composition

## Notes Content Workflow

Notes are the primary content type:
1. Create MDX files in `src/content/notes/`
2. Add required frontmatter (title, createdAt, isDraft)
3. Notes render at `/notes/[id]` via dynamic route in `src/pages/notes/[...id].astro`
4. Index page at `/notes/` lists all non-draft notes
5. Use `isDraft: true` during development; filter applied automatically in production

## Deployment

Site deploys to GitHub Pages with custom domain configured via `public/CNAME`.

## Implementation Plans

The `plans/` directory contains detailed documentation for major features and architectural changes:

- **PHOTOSWIPE_IMPLEMENTATION.md**: Complete documentation for the PhotoSwipe gallery system at `/photos/`, including architecture, content organization, custom loaders, and implementation decisions.
- **GALLERY_REFACTOR_PLAN.md**: Step-by-step plan for refactoring gallery components and data handling.

These documents provide historical context and implementation details that may be useful when extending or modifying related features.

**When working on multi-step plans**: Commit after completing each major step to preserve progress and make it easier to review changes incrementally.
