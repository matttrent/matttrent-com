# Gallery Refinement Implementation Plan

```
codex resume 019a2ead-9131-73b0-8709-e0d25d06cb77
```

## Context

The `gallery` branch introduced PhotoSwipe-powered gallery pages (`/photos/…`) with a custom content loader. README highlights four follow-up tasks to finish the feature set. This plan sequences the necessary work, clarifies the objective of each step, and lists the expected code updates.

### Current Implementation Issues

1. **Layout Anti-pattern**: Gallery pages use `ProseWrapper` which constrains content to `text-start / text-end` grid columns (designed for prose, not photo grids)
2. **Complex Page Logic**: `photos/[...id].astro` has 45 lines (lines 29-74) of data wrangling (globbing, filtering, ordering)
3. **Duplicated Code**: Draft filtering logic repeated in both index and detail pages
4. **Component Reuse**: Gallery list markup will be needed on homepage

## Design Philosophy

This refactor follows a pragmatic approach: **extract complex data logic to utilities, but keep components focused and simple**. We avoid premature abstraction - components are only split when there's a concrete need, not for theoretical reusability.

**Key Principles**:
- Use existing patterns from the codebase (study `Layout.astro`, `NotesLayout.astro`, `ProseWrapper.astro`)
- Keep PhotoSwipe-related code as-is (it works well)
- Extract utilities for data fetching, not rendering
- Follow YAGNI (You Aren't Gonna Need It)

## Architectural Context

### Understanding the Grid System

The site uses a **12-column named grid** defined in `src/css/shared.css:111-128`:

```css
.gridContainer {
  display: grid;
  grid-template-columns:
    [screen-start] var(--outer-margin)
    [page-start left-kickout] var(--column-width)
    [text-start] repeat(7, var(--column-width)) [text-end]
    var(--column-width)
    [right-kickout margin-start] repeat(3, var(--column-width)) [page-end margin-end]
    var(--outer-margin)
    [screen-end];
}
```

**Key grid areas**:
- `text-start / text-end`: Main prose column (7 columns) - used by `ProseWrapper`
- `page-start / page-end`: Full page width (excludes outer margins)
- `screen-start / screen-end`: Full viewport width
- `margin-start / margin-end`: Right margin area for sidenotes (3 columns)

**Why this matters**: `ProseWrapper` forces all children to `text-start / text-end` (line 15 in ProseWrapper.astro), which is too narrow for photo galleries.

### Layout Pattern: Base + Specialized

**Layout.astro** (base layout):
```astro
<Layout title={string}>
  <slot name="header" />  <!-- Optional header slot -->
  <main>
    <slot />  <!-- Main content -->
  </main>
</Layout>
```

**NotesLayout.astro** (specialized layout):
```astro
<Layout title={title}>
  <Header title={title} slot="header" />
  <ProseWrapper>
    <slot />  <!-- MDX content -->
  </ProseWrapper>
</Layout>
```

**Pattern**: Specialized layouts **wrap** the base layout, adding structure. They don't extend via inheritance.

### Component vs CSS File Decision

**Use separate CSS file when**:
- Reusable across multiple components/pages (e.g., `deflist.css` used by 4+ pages)
- Third-party customizations (e.g., `photoswipe.css`)

**Use `<style>` block when**:
- Component-specific styling (e.g., `ImageGrid.astro`, `BaseFigure.astro`)
- Layout-specific rules (e.g., `ProseWrapper.astro`)

**For galleries**: Since gallery styling is only used by gallery pages, use `<style>` block in `GalleryLayout.astro`.

### Current PhotoSwipe Integration

**PhotoSwipeGallery.astro** (`src/components/PhotoSwipeGallery.astro`):
- Renders thumbnail grid with data attributes
- Generates optimized images (thumbnails + full-size)
- Self-contained component (no external state)

**PhotoSwipe initialization** (`src/pages/photos/[...id].astro:99-158`):
- Lives in page-level `<script>` tag, NOT in component
- Runs once per page on `DOMContentLoaded`
- Handles caption support, configuration

**Why script is at page level**: Avoids hydration complexity, ES module imports work cleanly.

## Implementation Steps

## Step 1 — Create GalleryLayout Component

**Goal**: Provide a layout that gives galleries full width while maintaining Tufte aesthetic for text (title/description).

### Files to Create

**`src/layouts/GalleryLayout.astro`**:
```astro
---
import Layout from "@layouts/Layout.astro";

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<Layout title={title}>
  <slot name="header" slot="header" />

  <!-- Main gallery content - no gridContainer, no ProseWrapper -->
  <slot />
</Layout>

<style>
  /* Add any gallery-specific spacing/layout rules here */
  /* Keep it minimal - galleries should be full-width */
</style>
```

**Key decisions**:
- No `ProseWrapper` - galleries need more width
- No `gridContainer` on main slot - let gallery components control their own width
- Header slot passed through to base `Layout`
- Styles in `<style>` block (not separate CSS file)

### Files to Modify

**`src/pages/photos/[...id].astro`**:

Change imports (lines 3-6):
```astro
// Before:
import Layout from "@layouts/Layout.astro";
import ProseWrapper from "@components/ProseWrapper.astro";

// After:
import GalleryLayout from "@layouts/GalleryLayout.astro";
// Remove ProseWrapper import
```

Change template (lines 76-96):
```astro
// Before:
<Layout title={title}>
  <Header ... slot="header" />
  <ProseWrapper>
    <PhotoSwipeGallery ... />
  </ProseWrapper>
</Layout>

// After:
<GalleryLayout title={title}>
  <Header ... slot="header" />
  <PhotoSwipeGallery ... />
</GalleryLayout>
```

**Do NOT change**:
- `photos/index.astro` - it's just a list, should keep `ProseWrapper`
- PhotoSwipe initialization script
- `PhotoSwipeGallery` component

### Validation

```bash
npm run build  # Should pass astro check with 0 errors
npm run dev    # Check http://localhost:4321/photos/eastern-sierra-test
```

**What to verify**:
- Gallery grid has more breathing room
- Header/title still aligned with other pages
- No layout shift on mobile (test at 760px, 500px widths)
- PhotoSwipe lightbox still works

### Expected Changes Summary

- **Created**: `src/layouts/GalleryLayout.astro` (~30 lines)
- **Modified**: `src/pages/photos/[...id].astro` (lines 3-6, 76-96)
- **Not changed**: `src/pages/photos/index.astro` (still uses ProseWrapper)

---

## Step 2 — Extract Gallery Data Logic

**Goal**: Move complex data fetching from page templates to reusable utilities.

### Problem Analysis

**Current code in `photos/[...id].astro` lines 29-74**:
```astro
// Glob all images
const allImages = import.meta.glob(...);

// Filter by gallery ID
const galleryImageEntries = Object.entries(allImages)
  .filter([path] => path.includes(`/gallery/${gallery.id}/`));

// Handle photos array OR alphabetical sorting
if (gallery.data.photos && gallery.data.photos.length > 0) {
  // Build filename lookup map
  const imagesByFilename = new Map(...);
  // Map photos array to images
  galleryImages = gallery.data.photos.map(...);
} else {
  // Sort alphabetically
  galleryImages = galleryImageEntries.map(...).sort(...);
}
```

**Issues**:
- 45 lines of imperative code in template
- Logic duplicated if we add more gallery pages
- Hard to test without rendering page
- Obscures page intent (render gallery X)

### Files to Create

**`src/utils/gallery.ts`**:
```typescript
import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";

/**
 * Image representation for gallery rendering
 */
export interface GalleryImage {
  src: ImageMetadata;
  alt: string;
  title?: string;
}

/**
 * Get images for a specific gallery, respecting photos array if present
 *
 * @param galleryId - Directory name of the gallery (e.g., "eastern-sierra-test")
 * @param photos - Optional array of filenames for manual ordering
 * @returns Array of images ready for PhotoSwipeGallery component
 */
export async function getGalleryImages(
  galleryId: string,
  photos?: string[]
): Promise<GalleryImage[]> {
  // Glob all images from gallery directory
  const allImages = import.meta.glob<{ default: ImageMetadata }>(
    "@assets/gallery/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
    { eager: true }
  );

  // Filter images that belong to this gallery
  const galleryImageEntries = Object.entries(allImages)
    .filter(([path]) => path.includes(`/gallery/${galleryId}/`))
    .filter(([path]) => !path.endsWith('gallery.yaml'));

  // If photos array specified, use that for ordering
  if (photos && photos.length > 0) {
    const imagesByFilename = new Map(
      galleryImageEntries.map(([path, module]) => [
        path.split('/').pop() || '',
        { path, module }
      ])
    );

    return photos
      .map(filename => {
        const entry = imagesByFilename.get(filename);
        if (!entry) return null;
        return {
          src: entry.module.default,
          alt: filename.replace(/\.[^/.]+$/, ''),
        };
      })
      .filter((img): img is GalleryImage => img !== null);
  }

  // Default: alphabetical by filename
  return galleryImageEntries
    .map(([path, module]) => ({
      src: module.default,
      alt: path.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Gallery image',
    }))
    .sort((a, b) => a.alt.localeCompare(b.alt));
}

/**
 * Filter galleries based on draft status and environment
 *
 * @param galleries - Array of gallery collection entries
 * @returns Filtered array (excludes drafts in production)
 */
export function filterPublishedGalleries<T extends CollectionEntry<"galleries">>(
  galleries: T[]
): T[] {
  return import.meta.env.PROD
    ? galleries.filter(g => g.data.isDraft !== true)
    : galleries;
}
```

**Key design decisions**:
- `getGalleryImages()` returns `GalleryImage[]` type (not raw module objects)
- Keeps glob pattern identical to current implementation
- Maintains backward compatibility (photos array is optional)
- JSDoc comments for future maintainers
- `filterPublishedGalleries()` is generic (works with any collection type)

### Files to Modify

**`src/pages/photos/[...id].astro`**:

Add import (after line 5):
```astro
import { getGalleryImages } from "@utils/gallery";
```

Replace data fetching logic (lines 29-74):
```astro
// Before: 45 lines of globbing/filtering/sorting

// After:
const galleryImages = await getGalleryImages(
  gallery.id,
  gallery.data.photos
);
```

**`src/pages/photos/index.astro`**:

Add import (after line 2):
```astro
import { filterPublishedGalleries } from "@utils/gallery";
```

Replace filter logic (lines 11-13):
```astro
// Before:
const allGalleries = await getCollection("galleries", ({ data }) => {
  return import.meta.env.PROD ? data.isDraft !== true : true;
});

// After:
const allGalleries = await getCollection("galleries");
const publishedGalleries = filterPublishedGalleries(allGalleries);
```

Update sort (line 16):
```astro
// Before:
const sortedGalleries = allGalleries.sort(...);

// After:
const sortedGalleries = publishedGalleries.sort(...);
```

### Validation

```bash
npm run build  # Should pass astro check
npm run dev    # Verify galleries still load correctly
```

**What to verify**:
- Gallery images appear in correct order
- Draft galleries hidden in production (`npm run build && npm run preview`)
- Draft galleries visible in development
- No broken images

### Expected Changes Summary

- **Created**: `src/utils/gallery.ts` (~80 lines)
- **Modified**: `src/pages/photos/[...id].astro` (lines 29-74 → ~5 lines)
- **Modified**: `src/pages/photos/index.astro` (lines 11-16)

---

## Step 3 — Create Shared GalleryList Component

**Goal**: Extract gallery list rendering for reuse on homepage.

### Files to Create

**`src/components/GalleryList.astro`**:
```astro
---
import type { CollectionEntry } from "astro:content";

interface Props {
  galleries: CollectionEntry<"galleries">[];
}

const { galleries } = Astro.props;

// Sort by date, newest first
const sortedGalleries = galleries.sort((a, b) =>
  b.data.createdAt.getTime() - a.data.createdAt.getTime()
);
---

<dl class="dl-horizontal">
  {
    sortedGalleries.map((gallery) => (
      <>
        <dt>
          {gallery.data.createdAt.getFullYear()}
        </dt>
        <dd>
          <a href={`/photos/${gallery.id}`}>{gallery.data.title}</a>
          {gallery.data.isDraft && " (draft)"}
        </dd>
      </>
    ))
  }
</dl>
```

**Key decisions**:
- Component handles sorting (consistent behavior)
- Accepts pre-filtered galleries (caller controls published/draft logic)
- Uses `dl-horizontal` class (requires `@css/deflist.css` import by page)
- Shows draft indicator when applicable

### Files to Modify

**`src/pages/photos/index.astro`**:

Add import (after line 4):
```astro
import GalleryList from "@components/GalleryList.astro";
```

Replace list rendering (lines 28-43):
```astro
// Before:
<dl class="dl-horizontal">
  {sortedGalleries.map((gallery) => (
    <>
      <dt>{gallery.data.createdAt.getFullYear()}</dt>
      <dd>
        <a href={`/photos/${gallery.id}`}>{gallery.data.title}</a>
        {gallery.data.isDraft && " (draft)"}
      </dd>
    </>
  ))}
</dl>

// After:
<GalleryList galleries={publishedGalleries} />
```

Remove now-unused sorting (lines 16-18):
```astro
// Delete this - GalleryList handles sorting:
const sortedGalleries = publishedGalleries.sort(...);
```

### Validation

```bash
npm run build
npm run dev  # Check http://localhost:4321/photos/
```

**What to verify**:
- Gallery list still renders correctly
- Galleries sorted by year (newest first)
- Years displayed correctly
- Draft indicators shown in dev mode

### Expected Changes Summary

- **Created**: `src/components/GalleryList.astro` (~30 lines)
- **Modified**: `src/pages/photos/index.astro` (removed ~20 lines, simpler)

### Future Usage

To add galleries to homepage:
```astro
---
import { getCollection } from "astro:content";
import { filterPublishedGalleries } from "@utils/gallery";
import GalleryList from "@components/GalleryList.astro";

const galleries = await getCollection("galleries");
const recentGalleries = filterPublishedGalleries(galleries).slice(0, 3);
---

<section>
  <h2>Recent Galleries</h2>
  <GalleryList galleries={recentGalleries} />
</section>
```

---

## Step 4 — Document ImageGrid vs PhotoSwipeGallery Decision

**Goal**: Clearly document why these components stay separate and when to use each.

### Context

Two photo grid components exist:
1. **ImageGrid** (`src/components/ImageGrid.astro`) - For prose-embedded galleries
2. **PhotoSwipeGallery** (`src/components/PhotoSwipeGallery.astro`) - For standalone gallery pages

### Decision: Keep Separate

**Rationale**:

| Aspect | ImageGrid | PhotoSwipeGallery |
|--------|-----------|-------------------|
| **Context** | Within ProseWrapper (prose content) | Within GalleryLayout (standalone pages) |
| **Parent** | Extends BaseFigure | Self-contained div |
| **Grid Constraint** | Respects prose grid columns | Full-width control |
| **Features** | layout prop, object positioning, sidenote slot | PhotoSwipe lightbox, data attributes |
| **Aspect Ratio** | Configurable via prop | Fixed 3:2 |
| **Use Case** | Illustrating articles/notes | Browsing photo collections |

**Why not merge**:
- Different semantic purposes (illustration vs. browsing)
- Different layout constraints (ProseWrapper vs. full-width)
- Merging would add conditional complexity (`if (lightbox) { ... }`, `if (inProse) { ... }`)
- No current need for:
  - Lightbox in prose ImageGrid
  - Non-lightbox standalone galleries

**When to use each**:
- **ImageGrid**: Embedding photos in notes/articles with captions, sidenotes
- **PhotoSwipeGallery**: Dedicated gallery pages with lightbox browsing

### Files to Update

**`plans/PHOTOSWIPE_IMPLEMENTATION.md`**:

Add section after line 512:
```markdown
## ImageGrid vs PhotoSwipeGallery

### Decision: Keep Separate

These components serve different purposes and should remain distinct:

**ImageGrid** (`src/components/ImageGrid.astro`):
- **Purpose**: Prose-embedded photo arrays
- **Context**: Within ProseWrapper (notes, articles)
- **Features**: BaseFigure integration, sidenote slots, layout variants, object positioning
- **Example**: `src/content/notes/2024-eastern-sierra-trip.mdx`

**PhotoSwipeGallery** (`src/components/PhotoSwipeGallery.astro`):
- **Purpose**: Standalone gallery browsing
- **Context**: Within GalleryLayout (dedicated gallery pages)
- **Features**: PhotoSwipe lightbox, optimized thumbnails, fixed aspect ratio
- **Example**: `src/pages/photos/[...id].astro`

### Rationale

Merging would introduce unnecessary conditional complexity:
- `if (enableLightbox)` - Most prose grids don't need lightbox
- `if (inProseWrapper)` - Different grid constraints
- `if (hasBaseFigure)` - Gallery pages don't need figure semantics

Current separation keeps each component focused and maintainable.

### When to Reconsider

Merge if these requirements emerge:
- Prose-embedded galleries need lightbox browsing
- Multiple gallery page types with different lightbox behavior
- Shared responsive sizing logic becomes inconsistent (extract utility instead)
```

**`AGENTS.md`** (if it exists):

Add guidance section:
```markdown
### Photo Grid Components

**Use ImageGrid when**:
- Embedding photos within notes/articles
- Need captions, sidenotes, or figure semantics
- Want responsive layout variants (normal/full/fullscreen)
- Content is within ProseWrapper

**Use PhotoSwipeGallery when**:
- Creating dedicated gallery pages
- Want full-screen lightbox browsing
- Gallery is the primary content (not embedded)
- Content is within GalleryLayout
```

### Validation

- Review documentation for clarity
- Verify links work
- Confirm guidance aligns with actual component usage

### Expected Changes Summary

- **Modified**: `plans/PHOTOSWIPE_IMPLEMENTATION.md` (add ~30 lines)
- **Modified**: `AGENTS.md` (add ~15 lines)

---

## Final Validation Checklist

After completing all steps:

```bash
# Type checking
npm run build

# Visual testing
npm run dev
```

**Pages to verify**:
- ✅ `/photos/` - Gallery list renders correctly
- ✅ `/photos/eastern-sierra-test` - Gallery displays with good spacing
- ✅ Gallery lightbox opens on thumbnail click
- ✅ Mobile responsive (test 760px, 500px widths)
- ✅ Draft galleries hidden in production preview

**Code quality**:
- ✅ 0 TypeScript errors
- ✅ All imports resolve correctly
- ✅ No unused variables/imports
- ✅ Consistent formatting

**Documentation**:
- ✅ Implementation decisions recorded
- ✅ Component usage guidance added
- ✅ README checkboxes updated

---

## Success Criteria

All criteria met:

✅ Gallery pages use appropriate layout (GalleryLayout, not ProseWrapper)
✅ Data fetching logic extracted to utilities
✅ Gallery list component reusable on homepage
✅ Component separation documented with rationale
✅ No regressions in existing functionality
✅ Build passes with 0 errors
✅ Mobile responsive across breakpoints

---

## Files Modified Summary

### Created (3 files)
1. `src/layouts/GalleryLayout.astro` - Gallery-specific layout
2. `src/utils/gallery.ts` - Gallery data utilities
3. `src/components/GalleryList.astro` - Shared gallery list component

### Modified (4 files)
1. `src/pages/photos/[...id].astro` - Use GalleryLayout, extract data logic
2. `src/pages/photos/index.astro` - Use utilities and GalleryList component
3. `plans/PHOTOSWIPE_IMPLEMENTATION.md` - Document component decisions
4. `AGENTS.md` - Add component usage guidance

### Not Modified
- `src/components/PhotoSwipeGallery.astro` - Works as-is
- `src/components/ImageGrid.astro` - Different use case
- `src/css/photoswipe.css` - No styling changes needed
- Gallery content files - No changes to YAML or images

---

## Implementation Notes

### Mistake to Avoid #1: Don't use GalleryLayout for index pages

**Wrong**:
```astro
<!-- photos/index.astro -->
<GalleryLayout title="Photographs">
  <dl>...</dl>
</GalleryLayout>
```

**Right**:
```astro
<!-- photos/index.astro -->
<Layout title="Photographs">
  <ProseWrapper>
    <GalleryList galleries={...} />
  </ProseWrapper>
</Layout>
```

**Why**: Index pages are *lists*, not *galleries*. They should use prose layout for consistency with other index pages (notes/index, cv, etc.).

### Mistake to Avoid #2: Don't extract gallery.css as separate file

**Wrong**: Create `src/css/gallery.css` and import in GalleryLayout

**Right**: Put styles in `<style>` block of GalleryLayout.astro

**Why**: Gallery styles are only used by GalleryLayout (no reuse). Separate CSS files are for multi-component styles (deflist.css, photoswipe.css).

### Mistake to Avoid #3: Don't move PhotoSwipe script to component

**Wrong**: Try to create PhotoSwipeInit.astro component with script

**Right**: Keep script in page template (`photos/[...id].astro`)

**Why**: Page-level scripts avoid hydration complexity. Current pattern works well.

### Testing in Development vs Production

**Development** (`npm run dev`):
- Shows draft galleries
- Displays "(draft)" indicator
- Faster iteration

**Production** (`npm run build && npm run preview`):
- Filters draft galleries
- No draft indicators shown
- Tests actual deployment behavior

**Always test both** before considering a step complete.

---

## Architecture Patterns Reference

### Grid System Quick Reference

```
[screen-start]──────────────────────────────────────────[screen-end]
    [page-start]────────────────────────────[page-end]
        [left-kickout]──────────────[right-kickout]
            [text-start]────[text-end]
                              [margin-start]──[margin-end]
```

- **ProseWrapper children**: `text-start / text-end`
- **GalleryLayout content**: No grid constraint (use page-start/page-end or custom)
- **Responsive (<760px)**: Most content becomes `page-start / page-end`

### Layout Pattern Template

```astro
---
import Layout from "@layouts/Layout.astro";
// Add specialized imports here

interface Props {
  title: string;
  // Add specialized props
}

const { title } = Astro.props;
---

<Layout title={title}>
  <slot name="header" slot="header" />

  <!-- Add specialized structure here -->
  <slot />
</Layout>

<style>
  /* Add specialized styles here */
</style>
```

### Component Props Pattern

```astro
---
import type { CollectionEntry } from "astro:content";

interface Props {
  items: CollectionEntry<"collection-name">[];
  // Additional props
}

const { items } = Astro.props;
---

<!-- Component template -->
```

### Utility Function Pattern

```typescript
import type { CollectionEntry } from "astro:content";

/**
 * JSDoc comment explaining function purpose
 */
export function utilityName(
  param: Type
): ReturnType {
  // Implementation
}
```
