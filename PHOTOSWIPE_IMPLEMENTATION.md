# PhotoSwipe Gallery Implementation Plan

## Overview
Implementing a PhotoSwipe lightbox gallery system as a separate section of the site, independent from existing ImageGrid components. This will be backed by a new content collection that globs images from directories.

## Architecture Decisions

### Content Organization
- **One directory = one gallery** in `src/assets/galleries/[gallery-name]/`
- Each gallery has a `gallery.yaml` file for metadata
- Images are globbed from the directory
- Eventually may switch to JSON manifest for ordering and per-image metadata

### Routing
- **Gallery list**: `/galleries/` (index page)
- **Individual gallery**: `/galleries/[...id]` (consistent with notes pattern)

### Hydration Strategy
- Use `client:visible` for PhotoSwipe initialization
- Better performance with large galleries (50+ images)
- Loads when gallery scrolls into viewport

### Separation from Existing Code
- Does **not** modify existing ImageGrid component
- Does **not** touch existing content (notes, research pages)
- Can later evaluate merging with ImageGrid if beneficial

## Directory Structure

```
src/
├── content.config.ts                    # Add 'galleries' collection
├── assets/
│   └── galleries/                       # New directory
│       └── [gallery-name]/              # e.g., "eastern-sierra-test"
│           ├── gallery.yaml             # Gallery metadata
│           ├── photo1.jpg
│           ├── photo2.jpg
│           └── ...
├── components/
│   ├── PhotoSwipeGallery.astro         # Main gallery grid component
│   └── PhotoSwipeInit.astro            # Client-side script wrapper (client:visible)
├── pages/
│   └── galleries/
│       ├── index.astro                  # Gallery list page
│       └── [...id].astro                # Individual gallery pages
├── css/
│   └── photoswipe-custom.css           # PhotoSwipe theme customization
└── types/
    └── gallery.ts                       # Gallery TypeScript schema
```

## Implementation Steps

### 1. Install PhotoSwipe ✓
```bash
npm install photoswipe
```

### 2. Create Test Gallery Structure
Create directory and copy test images:
```bash
mkdir -p src/assets/galleries/eastern-sierra-test
# Copy 6-8 images from 2024-eastern-sierra-trip for testing
```

Create `src/assets/galleries/eastern-sierra-test/gallery.yaml`:
```yaml
title: Eastern Sierra Test Gallery
description: Test gallery for PhotoSwipe implementation
createdAt: 2025-01-15
```

### 3. Define Gallery Type Schema
Create `src/types/gallery.ts`:
```typescript
import { z } from 'astro:content';

export const gallerySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  modifiedAt: z.date().optional(),
  isDraft: z.boolean().default(false),
});

export type Gallery = z.infer<typeof gallerySchema>;
```

### 4. Create Galleries Content Collection
Update `src/content.config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { gallerySchema } from '@mttypes/gallery';

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/notes' }),
  schema: noteSchema,
});

// New galleries collection
const galleries = defineCollection({
  loader: glob({
    pattern: '**/gallery.yaml',
    base: './src/assets/galleries'
  }),
  schema: gallerySchema,
});

export const collections = { notes, galleries };
```

**Note**: Each gallery's ID will be derived from its directory name (e.g., `eastern-sierra-test`).

### 5. Create PhotoSwipeGallery Component
Create `src/components/PhotoSwipeGallery.astro`:

**Purpose**: Render thumbnail grid with data attributes for PhotoSwipe

**Props**:
```typescript
interface Props {
  images: {
    src: ImageMetadata;
    alt: string;
    title?: string;
  }[];
  galleryId: string;
  columns?: number; // default 3
}
```

**Key Features**:
- Uses Astro's `<Image>` component for optimized thumbnails
- Adds data attributes: `data-pswp-src`, `data-pswp-width`, `data-pswp-height`
- Wraps grid in element with unique ID for PhotoSwipe targeting
- Extends existing CSS grid system from site
- Each thumbnail is clickable `<a>` tag with proper href

**Implementation Details**:
- Import PhotoSwipe CSS: `import 'photoswipe/style.css';`
- Use existing grid CSS patterns (similar to ImageGrid)
- Generate unique gallery ID for PhotoSwipe initialization
- Calculate image dimensions for PhotoSwipe (needs width/height)

### 6. Create PhotoSwipe Initialization Script
Create `src/components/PhotoSwipeInit.astro`:

**Purpose**: Client-side script to initialize PhotoSwipe

**Props**:
```typescript
interface Props {
  gallerySelector: string; // CSS selector for gallery container
}
```

**Implementation**:
```astro
---
interface Props {
  gallerySelector: string;
}
const { gallerySelector } = Astro.props;
---

<script define:vars={{ gallerySelector }}>
  // This script runs with client:visible
  import PhotoSwipeLightbox from 'photoswipe/lightbox';
  import 'photoswipe/style.css';

  const lightbox = new PhotoSwipeLightbox({
    gallery: gallerySelector,
    children: 'a',
    pswpModule: () => import('photoswipe'),
    // Additional options...
  });

  lightbox.init();
</script>
```

**Key Features**:
- Use `client:visible` directive
- Initialize PhotoSwipe Lightbox on specified gallery
- Handle thumbnail clicks
- Manage lightbox opening/closing
- Keyboard navigation support (built into PhotoSwipe)

### 7. Create Custom PhotoSwipe CSS
Create `src/css/photoswipe-custom.css`:

**Purpose**: Customize PhotoSwipe to match Tufte CSS aesthetic

**Customizations**:
- Override default PhotoSwipe styles
- Match site typography (ET Book font)
- Adjust z-index to work with site layout
- Style captions/titles
- Responsive adjustments for mobile
- Color scheme matching site palette

### 8. Create Gallery List Page
Create `src/pages/galleries/index.astro`:

**Purpose**: Display list of all available galleries

**Implementation**:
```astro
---
import { getCollection } from 'astro:content';
import Layout from '@layouts/Layout.astro';

const galleries = await getCollection('galleries', ({ data }) => {
  return import.meta.env.PROD ? !data.isDraft : true;
});

// Sort by date, newest first
galleries.sort((a, b) =>
  b.data.createdAt.getTime() - a.data.createdAt.getTime()
);
---

<Layout title="Galleries">
  <h1>Photo Galleries</h1>
  <ul>
    {galleries.map(gallery => (
      <li>
        <a href={`/galleries/${gallery.id}`}>
          {gallery.data.title}
        </a>
        {gallery.data.description && <p>{gallery.data.description}</p>}
      </li>
    ))}
  </ul>
</Layout>
```

### 9. Create Dynamic Gallery Page
Create `src/pages/galleries/[...id].astro`:

**Purpose**: Display individual gallery with PhotoSwipe

**Implementation**:
```astro
---
import { getCollection } from 'astro:content';
import Layout from '@layouts/Layout.astro';
import PhotoSwipeGallery from '@components/PhotoSwipeGallery.astro';
import PhotoSwipeInit from '@components/PhotoSwipeInit.astro';

export async function getStaticPaths() {
  const galleries = await getCollection('galleries');
  return galleries.map(gallery => ({
    params: { id: gallery.id },
    props: { gallery },
  }));
}

const { gallery } = Astro.props;

// Glob images from the gallery directory
const galleryPath = `../assets/galleries/${gallery.id}`;
const imageModules = await Astro.glob(`${galleryPath}/*.{jpg,jpeg,png}`);

// Transform to image array
const images = imageModules.map((mod, i) => ({
  src: mod.default,
  alt: `Photo ${i + 1}`, // Basic alt text for now
}));
---

<Layout title={gallery.data.title}>
  <h1>{gallery.data.title}</h1>
  {gallery.data.description && <p>{gallery.data.description}</p>}

  <PhotoSwipeGallery
    images={images}
    galleryId={gallery.id}
    columns={3}
  />

  <PhotoSwipeInit
    gallerySelector={`#gallery-${gallery.id}`}
    client:visible
  />
</Layout>
```

**Key Features**:
- Use `getStaticPaths()` to generate pages for each gallery
- Glob images from gallery directory at build time
- Pass images to PhotoSwipeGallery component
- Initialize PhotoSwipe with client:visible
- Filter drafts in production (like notes)

## Image Handling Details

### Getting Image Dimensions
PhotoSwipe needs image dimensions for proper display. Options:

**Option 1**: Use Astro's image metadata
```typescript
import { getImage } from 'astro:assets';

const optimizedImage = await getImage({ src: imageSrc });
// optimizedImage.attributes.width, optimizedImage.attributes.height
```

**Option 2**: Hard-code aspect ratio (if all images same ratio)
```typescript
// Assuming 3:2 aspect ratio
width: 3000,
height: 2000,
```

**Option 3**: Calculate from Image component output
- Astro Image component knows dimensions
- Pass through data attributes

### Responsive Image Sizes
Use similar responsive sizes as existing ImageGrid:
```typescript
sizes="(max-width: 500px) 500px, (max-width: 800px) 800px, 1220px"
widths={[500, 800, 1220]}
```

Thumbnails smaller, lightbox uses larger versions:
- Thumbnail: 800px max width
- Lightbox: 1220px or 1600px max width

## Styling Integration

### Grid Layout
Reuse existing CSS grid patterns from ImageGrid:
```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 760px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### PhotoSwipe Customization
Match site aesthetic:
```css
/* photoswipe-custom.css */
.pswp__bg {
  background: rgba(0, 0, 0, 0.95);
}

.pswp__caption {
  font-family: 'et-book', serif;
  font-size: 1rem;
}
```

## Testing Plan

### Phase 1: Basic Functionality
1. Create test gallery with 6 images
2. Verify gallery appears in `/galleries/`
3. Verify individual gallery page renders at `/galleries/eastern-sierra-test`
4. Test thumbnail grid displays correctly
5. Test PhotoSwipe opens on click
6. Test navigation between images

### Phase 2: Responsive & Performance
1. Test on mobile viewport
2. Verify client:visible hydration works
3. Check image optimization (thumbnail vs full-size)
4. Test with 50+ images (performance)

### Phase 3: Edge Cases
1. Gallery with 1 image
2. Gallery with many images (100+)
3. Portrait vs landscape images
4. Different image sizes/aspect ratios

## Future Enhancements

### Phase 2 Features (Later)
- Switch from YAML to JSON manifest for explicit ordering
- Per-image metadata (title, description, date taken)
- Image captions in lightbox
- EXIF data display
- Thumbnail customization (crop, focal point)
- Gallery cover image selection
- Tags/categories for galleries
- Search/filter functionality

### Possible ImageGrid Integration
After successful implementation, evaluate:
- Adding `enableLightbox` prop to ImageGrid
- Sharing PhotoSwipe initialization logic
- Unified image handling patterns
- Migration path for existing content

## Path Aliases Reference
Remember to use TypeScript path aliases:
- `@assets/*` → `src/assets/*`
- `@components/*` → `src/components/*`
- `@css/*` → `src/css/*`
- `@layouts/*` → `src/layouts/*`
- `@mttypes/*` → `src/types/*`

## Development Workflow
```bash
# Start dev server
npm run dev

# Build and type-check
npm run build

# Preview production build
npm run preview
```

## Success Criteria
- ✅ New `/galleries/` section independent from existing content
- ✅ PhotoSwipe lightbox works on thumbnail click
- ✅ Responsive grid layout
- ✅ Client-side hydration with client:visible
- ✅ No modifications to existing ImageGrid or content
- ✅ Follows existing site patterns (Content Collections, layout, styling)
- ✅ Type-safe with TypeScript schemas
- ✅ Works with Astro's static site generation
