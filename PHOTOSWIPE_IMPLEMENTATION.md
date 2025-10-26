# PhotoSwipe Gallery Implementation

## Overview
A PhotoSwipe lightbox gallery system implemented as a separate section of the site, independent from existing ImageGrid components. Backed by a custom content collection loader that provides clean URLs and supports manual photo curation.

## Architecture

### Content Organization
- **One directory = one gallery** in `src/assets/galleries/[gallery-name]/`
- Each gallery has a `gallery.yaml` file for metadata
- Optional `photos` array for manual curation and ordering
- Images globbed from directory when `photos` not specified

### Routing
- **Gallery list**: `/galleries/`
- **Individual gallery**: `/galleries/[gallery-name]` (e.g., `/galleries/eastern-sierra-test`)
- Uses `[...id].astro` pattern consistent with notes

### Custom Content Loader
- Scans directories in `src/assets/galleries/`
- Sets gallery ID to directory name (not file path)
- Reads `gallery.yaml` from each directory
- Provides clean URLs without `/gallery` suffix

### Separation from Existing Code
- Does **not** modify existing ImageGrid component
- Does **not** touch existing content (notes, research pages)
- Can later evaluate merging with ImageGrid if beneficial

## Final Directory Structure

```
src/
├── content.config.ts                    # Custom gallery loader
├── assets/
│   └── galleries/                       # New directory
│       └── [gallery-name]/              # e.g., "eastern-sierra-test"
│           ├── gallery.yaml             # Gallery metadata
│           ├── photo1.jpg
│           ├── photo2.jpg
│           └── ...
├── components/
│   └── PhotoSwipeGallery.astro         # Main gallery grid component
├── pages/
│   └── galleries/
│       ├── index.astro                  # Gallery list page
│       └── [...id].astro                # Individual gallery pages (inline script)
├── css/
│   └── photoswipe.css                   # PhotoSwipe customization
└── types/
    └── gallery.ts                       # Gallery TypeScript schema
```

## Gallery Schema

### TypeScript Definition
Located in `src/types/gallery.ts`:

```typescript
import { z } from 'astro:content';

export const gallerySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
  modifiedAt: z.coerce.date().optional(),
  isDraft: z.boolean().default(false),
  photos: z.array(z.string()).optional(),
});

export type Gallery = z.infer<typeof gallerySchema>;
```

### YAML Example
`src/assets/galleries/eastern-sierra-test/gallery.yaml`:

```yaml
title: Eastern Sierra Test Gallery
description: Test gallery for PhotoSwipe lightbox implementation
createdAt: 2025-01-15
isDraft: false
photos:
  - 000045240022.jpg
  - 000045230001.jpg
  - 000045240011.jpg
  - 000045240022.jpg  # Can repeat photos
  - 000045230015.jpg
  - 000045240010.jpg
```

### Optional Photos Array
When `photos` is present:
- Only listed images are displayed
- Images appear in specified order
- Photos can be repeated
- Missing files are gracefully filtered out

When `photos` is absent:
- All images in directory are displayed
- Sorted alphabetically by filename

## Content Collection

### Custom Loader Implementation
Located in `src/content.config.ts`:

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { noteSchema } from '@mttypes/note';
import { gallerySchema } from '@mttypes/gallery';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

// Custom loader for galleries that sets ID to directory name
const galleriesLoader = {
  name: 'galleries-loader',
  load: async ({ store, logger }: any) => {
    const galleriesDir = path.join(process.cwd(), 'src/assets/galleries');

    if (!fs.existsSync(galleriesDir)) {
      logger.warn('Galleries directory not found');
      return;
    }

    const dirs = fs.readdirSync(galleriesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());

    for (const dir of dirs) {
      const yamlPath = path.join(galleriesDir, dir.name, 'gallery.yaml');

      if (fs.existsSync(yamlPath)) {
        try {
          const content = fs.readFileSync(yamlPath, 'utf-8');
          const rawData = parse(content);

          // Ensure dates are Date objects
          const data = {
            ...rawData,
            createdAt: rawData.createdAt instanceof Date
              ? rawData.createdAt
              : new Date(rawData.createdAt),
            modifiedAt: rawData.modifiedAt
              ? (rawData.modifiedAt instanceof Date
                  ? rawData.modifiedAt
                  : new Date(rawData.modifiedAt))
              : undefined,
          };

          store.set({
            id: dir.name,  // Just the directory name!
            data,
          });
        } catch (error) {
          logger.error(`Failed to load gallery from ${dir.name}: ${error}`);
        }
      }
    }
  }
};

const galleryCollection = defineCollection({
  loader: galleriesLoader,
  schema: gallerySchema,
});
```

**Key Benefits:**
- Gallery ID = directory name (e.g., `eastern-sierra-test`)
- Clean URLs: `/galleries/eastern-sierra-test`
- No need to strip `/gallery` suffix throughout codebase
- Proper Date object handling from YAML

## Components

### PhotoSwipeGallery.astro

**Purpose**: Render responsive thumbnail grid with PhotoSwipe data attributes

**Implementation Details:**
- Uses Astro's `<Image>` component for optimized thumbnails
- Uses `getImage()` for full-size lightbox metadata
- Responsive image sizes: `[400, 600, 800]`
- Three-column grid (responsive: 3/2/1 columns)
- Imports both PhotoSwipe CSS and custom CSS

**Key Features:**
- Thumbnails: 800px max width with responsive srcset
- Lightbox: 1600px max width (or original if smaller)
- WebP format for optimization
- Data attributes: `data-pswp-width`, `data-pswp-height`
- Lazy loading enabled
- CSS: `@assets` import works with Vite

### PhotoSwipe Initialization

**Implementation**: Inline `<script>` tag in `[...id].astro`

**Why not a component?**
- ES module imports don't work with `is:inline` directive
- `define:vars` requires `is:inline`
- Solution: Inline script directly in page

**Configuration:**
```javascript
const lightbox = new PhotoSwipeLightbox({
  gallery: `[data-pswp-gallery="${galleryId}"]`,
  children: 'a',
  pswpModule: PhotoSwipe,
  showHideAnimationType: 'fade',
  initialZoomLevel: 'fit',
  secondaryZoomLevel: 1,
  maxZoomLevel: 1,
  zoom: false,
  clickToCloseNonZoomable: false,
});
```

**Caption Support:**
- Only shows explicit titles (no filename fallback)
- Checks for `.hidden-caption` element
- No alt text displayed in lightbox

## Pages

### Gallery Index (`/galleries/index.astro`)

**Features:**
- Lists all galleries sorted by date (newest first)
- Shows year only (not full date)
- Draft filtering: `isDraft !== true` in production
- Shows "(draft)" label in development
- Clean presentation: title and year only (no descriptions)

**Template:**
```astro
<dl class="dl-horizontal">
  {sortedGalleries.map((gallery) => (
    <>
      <dt>{gallery.data.createdAt.getFullYear()}</dt>
      <dd>
        <a href={`/galleries/${gallery.id}`}>{gallery.data.title}</a>
        {gallery.data.isDraft && " (draft)"}
      </dd>
    </>
  ))}
</dl>
```

### Gallery Detail (`/galleries/[...id].astro`)

**Image Loading Strategy:**
1. Glob all images: `import.meta.glob("@assets/galleries/**/*.{jpg,jpeg,png}")`
2. Filter by gallery ID
3. If `photos` array exists: use it for ordering/filtering
4. If `photos` absent: use all images sorted alphabetically

**Draft Support:**
- Filter in `getStaticPaths`: `isDraft !== true` in production
- Add "(draft)" to page title when `isDraft === true`

**PhotoSwipe Integration:**
- Inline `<script>` for initialization
- Caption support via `uiRegister` event
- Minimal UI (no zoom button, no counter)

## Styling

### Custom PhotoSwipe CSS (`src/css/photoswipe.css`)

**Key Customizations:**
```css
/* Dark background */
.pswp__bg {
  background: rgba(0, 0, 0, 0.95);
}

/* Hide zoom button */
.pswp__button--zoom {
  display: none !important;
}

/* Hide counter (1 / N) */
.pswp__counter {
  display: none !important;
}

/* Caption styling with ET Book font */
.pswp__caption {
  font-family: et-book, Palatino, "Palatino Linotype", Georgia, serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
}
```

**UI Philosophy:**
- Minimal chrome for distraction-free viewing
- No zoom button or counter visible
- No filename captions (only explicit titles)
- Matches Tufte CSS aesthetic

### Grid Layout
Responsive three-column grid:
```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

@media (max-width: 760px) {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 500px) {
  grid-template-columns: 1fr;
}
```

## Draft Support

Matches notes behavior exactly:

### Development Mode
- Shows all galleries including drafts
- Displays "(draft)" label in:
  - Gallery index listing
  - Gallery detail page title

### Production Mode
- Filters out drafts (`isDraft !== true`)
- Draft galleries not built or accessible

### Implementation
```typescript
// In getCollection calls
const galleries = await getCollection("galleries", ({ data }) => {
  return import.meta.env.PROD ? data.isDraft !== true : true;
});

// In page title
const title = gallery.data.title + (gallery.data.isDraft ? " (draft)" : "");
```

## Image Handling

### Path Alias Support
- `@assets/galleries/**/*` works with `import.meta.glob`
- Vite respects TypeScript path aliases
- No need for relative paths or `/src/` prefix

### Responsive Optimization
**Thumbnails:**
- Width: 800px max
- Format: WebP
- Sizes: `(max-width: 500px) 100vw, (max-width: 760px) 50vw, 400px`
- Widths: `[400, 600, 800]`

**Lightbox:**
- Width: 1600px max (or original if smaller)
- Format: WebP
- Full dimensions passed via data attributes

### Manual Curation
Using `photos` array in `gallery.yaml`:
- Explicit ordering (not alphabetical)
- Subset selection (exclude images)
- Repeatable (same photo multiple times)
- Graceful handling of missing files

## Dependencies

### npm Packages
```json
{
  "photoswipe": "^5.x",
  "yaml": "^2.x"
}
```

### Why YAML Package?
- Custom loader needs to parse YAML files
- Handles date parsing from YAML
- Returns native JavaScript objects

## Testing Results

### Verified Functionality
✅ PhotoSwipe lightbox opens on thumbnail click
✅ Navigation between images (arrows, keyboard)
✅ Responsive grid layout (3/2/1 columns)
✅ Image optimization (thumbnails vs full-size)
✅ Clean URLs (`/galleries/[name]`)
✅ Draft filtering in production
✅ Manual photo curation with `photos` array
✅ Repeated photos support
✅ Minimal UI (no zoom button, no counter)
✅ No filename captions displayed

### Test Gallery
`src/assets/galleries/eastern-sierra-test/`:
- 6 images from Eastern Sierra trip
- Demonstrates custom ordering via `photos` array
- One photo repeated (shows at positions 1 and 4)
- One photo omitted (not in `photos` list)
- Set to `isDraft: true` for testing

## Known Limitations

### Zoom Behavior
- Zoom button hidden via CSS
- Zoom interactions disabled (`maxZoomLevel: 1`)
- Click-to-zoom still triggers but limited to fit-to-screen
- Not worth hacking further given minimal impact

## Path Aliases Reference

TypeScript path aliases (configured in `tsconfig.json`):
- `@assets/*` → `src/assets/*`
- `@components/*` → `src/components/*`
- `@css/*` → `src/css/*`
- `@layouts/*` → `src/layouts/*`
- `@mttypes/*` → `src/types/*`

## Development Workflow

```bash
# Install dependencies
npm install

# Start dev server (shows drafts)
npm run dev

# Build and type-check
npm run build

# Preview production build (hides drafts)
npm run preview
```

## Success Criteria

All criteria met:

✅ New `/galleries/` section independent from existing content
✅ PhotoSwipe lightbox works on thumbnail click
✅ Responsive grid layout (3/2/1 columns)
✅ Clean URLs without `/gallery` suffix
✅ No modifications to existing ImageGrid or content
✅ Follows existing site patterns (Content Collections, layout, styling)
✅ Type-safe with TypeScript schemas
✅ Works with Astro's static site generation
✅ Draft support matching notes behavior
✅ Optional manual photo curation
✅ Minimal distraction-free UI

## Future Enhancements

### Potential Features
- Per-image metadata (title, caption, date taken)
- EXIF data display
- Gallery cover image selection
- Tags/categories for galleries
- Search/filter functionality
- Pagination for large galleries

### ImageGrid Integration
After evaluation, could add:
- `enableLightbox` prop to ImageGrid
- Shared PhotoSwipe initialization logic
- Unified image handling patterns
- Migration path for existing content

## Files Modified/Created

### Created
- `src/types/gallery.ts` - Gallery schema
- `src/components/PhotoSwipeGallery.astro` - Gallery grid component
- `src/css/photoswipe.css` - Custom PhotoSwipe styles
- `src/pages/galleries/index.astro` - Gallery list page
- `src/pages/galleries/[...id].astro` - Gallery detail page
- `src/assets/galleries/eastern-sierra-test/` - Test gallery
- `PHOTOSWIPE_IMPLEMENTATION.md` - This document

### Modified
- `src/content.config.ts` - Added custom gallery loader
- `package.json` - Added photoswipe and yaml dependencies

### Not Used
- `src/components/PhotoSwipeInit.astro` - Initially created, then removed (inline script used instead)

## Implementation Notes

### Key Decisions
1. **Custom loader over glob loader**: Provides clean IDs and URLs
2. **Inline script over component**: ES modules work properly
3. **Optional photos array**: Enables manual curation without breaking existing behavior
4. **Minimal UI approach**: Focus on photos, reduce distractions
5. **Year-only display**: Cleaner presentation on index page

### Lessons Learned
- `@assets` alias works with `import.meta.glob` in Astro/Vite
- `is:inline` + `define:vars` prevents ES module imports
- Custom loaders provide more control than glob patterns
- PhotoSwipe's click-to-zoom is deeply integrated (hard to fully disable)

---

**Implementation completed on**: 2025-10-25
**Branch**: `gallery`
**Status**: Ready for merge to `dev`
