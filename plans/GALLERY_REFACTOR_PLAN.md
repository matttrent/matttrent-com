# Gallery Refinement Implementation Plan

## Context
The `gallery` branch introduced PhotoSwipe-powered gallery pages (`/photos/…`) with a custom content loader. README highlights four follow-up tasks to finish the feature set. This plan sequences the necessary work, clarifies the objective of each step, and lists the expected code updates.

## Step 1 — Establish Gallery Layout & Styling Foundation
- **Goal**: Deliver intentional gallery-page framing and satisfy “Create GalleryLayout component and have better gallery styling” in README.
- **Implementation**:
  - Add `src/layouts/GalleryLayout.astro` that wraps `Layout.astro`, provides a wide gallery shell, optional intro slot (ProseWrapper), and centralises gallery-specific spacing.
  - Create `src/css/gallery.css` (or extend `photoswipe.css`) for layout-wide spacing, breakpoints, and typography tweaks distinct from ProseWrapper; this keeps gallery rules from leaking into prose pages.
  - Update `src/pages/photos/[...id].astro` and future gallery pages to use `GalleryLayout`, moving header/subtitle into layout slots so each page only manages content, not chrome.
  - Verify styling across breakpoints (`npm run dev`) and mark the README checkbox once the layout matches requirements.
- **Rationale**: Gallery pages should not inherit ProseWrapper’s constraints; a purpose-built layout preserves the Tufte tone while giving the grid room to breathe and making future gallery variants easier to ship.

## Step 2 — Separate Grid Rendering from Lightbox Wiring
- **Goal**: Prepare for cleaner composition and satisfy the README refactor item (“Refactor code in [...id].astro…”).
- **Implementation**:
  - Extract image-loading logic from `[...id].astro` into `@utils/gallery.ts` helpers (e.g., `getGalleryData()` returning metadata and ordered image lists).
  - Split the current `PhotoSwipeGallery.astro` into two layers:
    - `GalleryGrid.astro`: pure thumbnail renderer (configurable columns, responsive sizing, optional captions).
    - `PhotoSwipeGallery.astro`: wraps `GalleryGrid`, enriches props with `getImage` outputs, applies `data-pswp-*`, and mounts the lightbox script via an island/inline script.
  - Adjust gallery CSS so grid spacing lives with `GalleryGrid`, while lightbox chrome remains in `photoswipe.css`.
- **Rationale**: Untangling layout from the lightbox keeps PhotoSwipe optional, enables reusing the grid for non-lightbox contexts, and makes it trivial to swap lightbox tech later without touching markup.

## Step 3 — Refine `/photos/[...id].astro`
- **Goal**: Consume the new helpers/components and leave the page logic declarative.
- **Implementation**:
  - Replace in-file globbing/parsing with calls to `getGalleryData()` from Step 2.
  - Render intro content (title, description, draft badge) via `GalleryLayout` slots.
  - Drop any redundant `ProseWrapper` usage around the gallery grid; the layout + grid should control width.
  - Keep the PhotoSwipe initialisation inside the wrapper component to simplify the page template.
  - Add regression coverage: run `npm run build` and spot-check `http://localhost:4321/photos/<id>`.
- **Rationale**: The page should describe “what” (render gallery X with description Y) rather than “how” (glob files, wire scripts). Centralising the imperative parts reduces defects when galleries grow in number.

## Step 4 — Share Gallery Listing UI
- **Goal**: Address README task “Create GalleryList component to share with root page”.
- **Implementation**:
  - Extract the `<dl>` rendering from `src/pages/photos/index.astro` into `src/components/GalleryList.astro`, accepting a `CollectionEntry<"galleries">[]`.
  - Reuse the helper from Step 2 (or a lighter variant) to fetch gallery metadata where needed (index page, potential homepage sections).
  - Update `/photos/index.astro` to import and render `GalleryList`.
  - If the site highlights galleries elsewhere (e.g., home page), replace ad-hoc markup with the new component.
- **Rationale**: A shared list component keeps typography and draft labelling consistent, reduces duplication if galleries surface on the homepage later, and makes it clear where to tweak ordering or formatting.

## Step 5 — Reconcile Photo Grids with Existing Components
- **Goal**: Fulfil README “Think about how I want to merge with ImageGrid” with a documented decision.
- **Implementation**:
  - Log the current roles:
    - `ImageGrid` (within ProseWrapper) expects `BaseFigure` semantics, sidenote slots, and typography-aligned spacing.
    - `GalleryGrid` (from Step 2) targets full-width gallery contexts, skips figcaption floats, and integrates with PhotoSwipe.
  - Audit shared needs (responsive sizes, aspect-ratio handling, column breakpoints) and extract them into a utility module (`@utils/imageSizing.ts`) consumed by both grids so sizing logic stays consistent.
  - Keep structural differences explicit: `ImageGrid` continues wrapping `BaseFigure` for prose compatibility; `GalleryGrid` owns its container to avoid inherited margins.
  - Document the rationale—why only helpers are shared and the components stay distinct—in `plans/PHOTOSWIPE_IMPLEMENTATION.md`, and capture guidance for contributors inside `AGENTS.md` (choose `ImageGrid` for prose, `GalleryGrid`/PhotoSwipe for gallery pages).
  - Rationale: merging the components would blur prose-specific behaviours (sidenotes, captions) with gallery requirements (full bleed, lightbox hooks), increasing conditional complexity. Sharing utilities keeps the responsive math aligned while letting each component specialise for its context.
  - Update README work items once the decision and supporting notes are committed.

## Validation & Documentation
- After each step, run `npm run build` to exercise `astro check`.
- Record significant architecture decisions (e.g., helper locations, grid abstractions) in `plans/PHOTOSWIPE_IMPLEMENTATION.md`.
- Update `README.md` checkboxes and add cross-links to `AGENTS.md` so future contributors follow the new patterns.
