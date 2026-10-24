# matttrent.com

Personal website built with Astro and deployed to GitHub Pages: portfolio, CV, research pages, notes, and photo galleries. The design follows Tufte CSS, with sidenotes and margin notes.

## Commands

- `npm run dev` starts the dev server.
- `npm run build` runs `astro check`, then builds to `dist/`. It is the repository's only check.
- `npm run preview` serves the built site.

## Layout

- `src/pages/` maps each `.astro` file to a URL. Notes render at `/notes/[id]` and galleries at `/photos/[id]`.
- `src/content.config.ts` defines two collections. `notes` loads Markdown and MDX from `src/content/notes/`, skipping files that start with `_`. `galleries` loads YAML from `src/content/gallery/`. Schemas live in `src/types/`.
- Note frontmatter is `title`, `createdAt`, `modifiedAt`, and `isDraft`. Production builds drop drafts, including from `src/pages/rss.xml.ts`.
- `src/data/cv.ts` and `src/data/artifacts.ts` hold the CV and artifacts lists.
- Research PDFs go in `public/attachments/`. Photos go in `src/assets/` so Astro's image service optimizes them.
- Import through the path aliases in `tsconfig.json` (`@components/*`, `@data/*`, `@utils/*`, and so on), not deep relative paths.

## Components

- `ProseWrapper` defines the prose grid: text column, right margin for notes, and kickouts. Long-form content goes inside it. `.kickout-left`, `.kickout-right`, and `.kickout-both` widen an element.
- `Sidenote.astro` renders a numbered sidenote with `num`, or a margin note without it. It handles numbering and the mobile toggle. `inflow` controls whether the note's height affects text flow.
- Figures build on `BaseFigure`: `CustomFigure`, `BasicImage`, `SidenoteImage`, and `ImageGrid`.
- Use `ImageGrid` for photos embedded in a note, inside `ProseWrapper`. Use `PhotoSwipeGallery` for a dedicated gallery page with a lightbox, inside `GalleryLayout`.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`. `public/CNAME` sets the custom domain.

## Development process

- `mtrent-mode.toml` at this repository's root is its dev config, which the `dev` script reads.
- Every change runs through a DEV card in the Linear `matttrent.com` project and lands as a PR.
- Each card's review level comes from the review-level test in the `mtrent-mode` skill's dev process reference.
- Run `npm run build` before a PR opens.
