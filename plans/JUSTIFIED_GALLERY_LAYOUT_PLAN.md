# Justified Gallery Layout Implementation Plan

## Overview

Replace the current fixed-aspect-ratio grid in PhotoSwipeGallery with a Lightroom-style justified layout that preserves natural image aspect ratios. This addresses the current limitation where all images are forced into 3:2 aspect ratio, causing unwanted cropping.

## Motivation

**Current Problem:**
- Gallery uses CSS Grid with `aspect-ratio: 3/2` and `object-fit: cover`
- Forces all images into fixed aspect regardless of original dimensions
- Results in cropped images, losing important content at edges
- Less visually faithful to original photography

**Desired Result:**
- Images preserve their natural aspect ratios
- Layout similar to Adobe Lightroom's gallery view
- Rows have consistent heights for clean visual rhythm
- Images arranged to efficiently fill horizontal space
- Professional appearance matching modern photo gallery standards

## Current Implementation Analysis

### PhotoSwipeGallery.astro (Current)

**Layout approach:**
```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

img {
  aspect-ratio: 3 / 2;
  object-fit: cover;
}
```

**Image optimization:**
- Thumbnails: 800px max width, WebP format
- Responsive sizes: `[400, 600, 800]`
- Full-size for lightbox: 1600px max width

**Characteristics:**
- ✅ Simple, predictable layout
- ✅ Fast CSS-only rendering
- ✅ Clean grid structure
- ❌ Crops images to forced aspect ratio
- ❌ Not visually faithful to originals
- ❌ Fixed 4-column layout

## Design Goals

### User Requirements

Based on discussion with user:

1. **Container width**: Full viewport width (GalleryLayout provides this)
2. **Gap size**: 0.5rem (~8px) - maintain consistency with current design
3. **Image format**: WebP thumbnails (continue current approach)
4. **Maximum gallery size**: 100 images
5. **Mobile layout**: ~3 columns (or appropriate responsive behavior)
6. **Target row height**: 250-300px (configurable parameter)
7. **Layout style**: Option 2 - Justified layout using `justified-layout` library

### Technical Goals

- Preserve natural image aspect ratios (no cropping)
- Rows have consistent heights for visual balance
- Responsive layout that reflows on window resize
- Maintain PhotoSwipe lightbox integration
- Optimize performance with lazy loading
- Keep implementation maintainable

## Layout Approach Options Considered

### Option 1: CSS Masonry Grid
**Complexity**: Low
**Visual Result**: Pinterest-style

Uses CSS Grid with `grid-auto-flow: dense`.

**Pros:**
- Native CSS solution
- No JavaScript required
- Simple to implement

**Cons:**
- Irregular row heights
- Less visually balanced
- Not the Lightroom aesthetic

**Decision**: ❌ Rejected - doesn't match desired aesthetic

### Option 2: Justified Gallery Layout ⭐ SELECTED
**Complexity**: Medium
**Visual Result**: Lightroom-style

Uses `justified-layout` library (Flickr's algorithm) to calculate optimal image positions.

**Pros:**
- Professional, balanced appearance
- Rows have consistent heights
- Natural horizontal flow
- Used by Flickr, Google Photos, etc.
- Works well with PhotoSwipe
- We already have image dimensions from `getImage()`

**Cons:**
- Requires JavaScript calculations
- Need image dimensions beforehand (already available)
- Slightly more complex than CSS-only

**Decision**: ✅ Selected - best match for requirements

### Option 3: Flex-based Responsive Rows
**Complexity**: Medium-Low
**Visual Result**: Compromise

Uses flexbox with natural aspect ratios.

**Pros:**
- No external libraries
- Simple CSS

**Cons:**
- Less precise than justified layout
- Last row might not fill

**Decision**: ❌ Rejected - justified layout better fits goals

## Lazy Loading Strategy

### Context

Justified-layout requires image dimensions before calculating layout. We have dimensions from Astro's `getImage()` during build time. Question: when do we load actual image pixels?

### Options Considered

#### Option A: Native Lazy Loading ⭐ SELECTED

```astro
<img
  src={thumbnail.src}
  loading="lazy"
  decoding="async"
/>
```

**Pros:**
- ✅ Zero JavaScript required
- ✅ Browser-optimized
- ✅ No layout shifts (dimensions pre-specified)
- ✅ Works perfectly with justified-layout
- ✅ Progressive enhancement

**Cons:**
- ❌ Less control over loading threshold
- ❌ No custom placeholder effects

**Performance:**
- Gallery with 50 images (~100KB each)
- Without lazy loading: ~5MB initial load
- With lazy loading: ~800KB initial load (first ~8 images)
- **~6x reduction** in initial page weight

**Decision**: ✅ Selected - optimal balance of simplicity and performance

#### Option B: Intersection Observer + Custom Logic

Custom JavaScript for fine-grained control.

**Pros:**
- Fine-grained control
- Blur-up placeholders possible
- Loading indicators

**Cons:**
- More complexity (~50 lines JS)
- Need placeholder images
- More maintenance

**Decision**: ❌ Rejected - unnecessary complexity for current needs. Can upgrade later if needed.

#### Option C: No Lazy Loading

Load all images immediately.

**Cons:**
- Large initial page load
- Wasted bandwidth
- Slower First Contentful Paint

**Decision**: ❌ Rejected - poor performance for 100-image galleries

## Image Sizing Strategy

### Analysis Based on ImageGrid.astro Pattern

User requested sizing approach similar to ImageGrid's responsive strategy.

**Parameters:**
- Full width container
- Target row height: 280px (desktop), 220px (tablet), 150px (mobile)
- Gap: 0.5rem (~8px)
- ~3-4 images per row on desktop

**Responsive Calculations:**

**Desktop (1400px+ viewport):**
- Container: ~1400px
- Row height: 280px
- Average ~4 images/row = ~350px per image
- Need: 600-700px thumbnails for 2x displays

**Tablet (800-1400px):**
- Container: 800-1400px
- Row height: 220px
- Average ~3 images/row = ~250-400px per image
- Need: 500-800px thumbnails

**Mobile (<800px):**
- Container: 400-800px
- Row height: 150px
- Average ~2 images/row = ~200-400px per image
- Need: 400-600px thumbnails

### Recommended Configuration

```typescript
sizes: "(max-width: 500px) 400px, (max-width: 800px) 600px, (max-width: 1400px) 800px, 1200px"
widths: [400, 600, 800, 1200]
```

More conservative than ImageGrid's fullscreen mode (max 1600px) since justified layout displays multiple images per row, making individual thumbnails smaller.

## Implementation Plan

### Implementation Workflow

After completing each step:

1. **Test the build**: Run `npm run build` to ensure the site builds without errors
2. **Check for TypeScript errors**: Verify there are no type errors or warnings
3. **Review changes**: Confirm the changes align with the plan
4. **Get user approval**: Check in with the user before proceeding to the next step
5. **Commit changes**: Once approved, commit the completed step with a descriptive message

This incremental approach ensures:
- Each step can be reviewed independently
- Problems are caught early
- Progress is preserved with granular commits
- The implementation can be rolled back to any step if needed

### Step 1: Install justified-layout

```bash
npm install justified-layout
npm install --save-dev @types/justified-layout
```

Flickr's open-source justified layout algorithm.

### Step 2: Update PhotoSwipeGallery.astro Component

**File**: `src/components/PhotoSwipeGallery.astro`

#### Changes to Template Structure

**Before:**
```astro
<div class="gallery-grid" data-pswp-gallery={galleryId}>
  {images.map((image, index) => (
    <a href={fullSizeImage.src}>
      <Image src={image.src} ... />
    </a>
  ))}
</div>
```

**After:**
```astro
<div class="gallery-justified" data-pswp-gallery={galleryId} data-gallery-id={galleryId}>
  {images.map((image, index) => (
    <a
      href={fullSizeImage.src}
      data-pswp-width={fullSizeImage.width}
      data-pswp-height={fullSizeImage.height}
      data-width={fullSizeImage.width}
      data-height={fullSizeImage.height}
      class="gallery-item"
    >
      <Image
        src={image.src}
        width={1200}
        height={Math.round((1200 * fullSizeImage.height) / fullSizeImage.width)}
        sizes="(max-width: 500px) 400px, (max-width: 800px) 600px, (max-width: 1400px) 800px, 1200px"
        widths={[400, 600, 800, 1200]}
        format="webp"
        loading={index < 8 ? "eager" : "lazy"}
        decoding="async"
        alt={image.alt}
      />
    </a>
  ))}
</div>
```

**Key changes:**
- Container class: `gallery-grid` → `gallery-justified`
- Add `data-gallery-id` for script targeting
- Add `data-width` and `data-height` for layout calculation
- Keep existing PhotoSwipe attributes (`data-pswp-width`, `data-pswp-height`)
- Update image sizing: widths `[400, 600, 800, 1200]`
- Add lazy loading: first 8 eager, rest lazy
- Add `class="gallery-item"` for styling and selection

#### Changes to CSS

**Before:**
```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

img {
  aspect-ratio: 3 / 2;
  object-fit: cover;
}
```

**After:**
```css
.gallery-justified {
  position: relative;
  width: 100%;
  /* height set dynamically by JS */
}

.gallery-item {
  position: absolute;
  display: block;
  overflow: hidden;
  /* left, top, width, height set by JS */
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Still cover since justified-layout sizes container */
  display: block;
}
```

### Step 3: Add Justified Layout Script

**File**: `src/pages/photos/[...id].astro`

Add new script block **before** PhotoSwipe initialization script.

```astro
<script>
  import justifiedLayout from 'justified-layout';

  interface LayoutBox {
    top: number;
    left: number;
    width: number;
    height: number;
  }

  interface LayoutGeometry {
    containerHeight: number;
    boxes: LayoutBox[];
  }

  function applyJustifiedLayout(galleryId: string) {
    const gallery = document.querySelector(`[data-gallery-id="${galleryId}"]`) as HTMLElement;
    if (!gallery) return;

    const items = Array.from(gallery.querySelectorAll('.gallery-item')) as HTMLAnchorElement[];
    if (items.length === 0) return;

    // Extract image dimensions
    const imageDimensions = items.map(item => ({
      width: parseInt(item.dataset.width || '1', 10),
      height: parseInt(item.dataset.height || '1', 10),
    }));

    // Get container width
    const containerWidth = gallery.offsetWidth;

    // Determine target row height based on viewport
    const viewportWidth = window.innerWidth;
    let targetRowHeight: number;
    if (viewportWidth < 500) {
      targetRowHeight = 150;
    } else if (viewportWidth < 800) {
      targetRowHeight = 180;
    } else if (viewportWidth < 1400) {
      targetRowHeight = 220;
    } else {
      targetRowHeight = 280;
    }

    // Calculate layout
    const layoutGeometry = justifiedLayout(imageDimensions, {
      containerWidth,
      targetRowHeight,
      targetRowHeightTolerance: 0.25,
      boxSpacing: 8, // 0.5rem ≈ 8px
      containerPadding: 0,
    }) as LayoutGeometry;

    // Apply positions to items
    items.forEach((item, index) => {
      const box = layoutGeometry.boxes[index];
      item.style.left = `${box.left}px`;
      item.style.top = `${box.top}px`;
      item.style.width = `${box.width}px`;
      item.style.height = `${box.height}px`;
    });

    // Set container height
    gallery.style.height = `${layoutGeometry.containerHeight}px`;
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    const galleries = document.querySelectorAll('[data-gallery-id]');
    galleries.forEach(gallery => {
      const galleryId = gallery.getAttribute('data-gallery-id');
      if (galleryId) {
        applyJustifiedLayout(galleryId);
      }
    });

    // Debounced resize handler
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        galleries.forEach(gallery => {
          const galleryId = gallery.getAttribute('data-gallery-id');
          if (galleryId) {
            applyJustifiedLayout(galleryId);
          }
        });
      }, 150);
    });
  });
</script>
```

**Script execution order:**
1. Justified layout script runs on DOMContentLoaded
2. Positions all images
3. Sets container height
4. PhotoSwipe initialization script runs (existing)
5. PhotoSwipe reads positioned elements

### Step 4: Update Gallery Utility Function

**File**: `src/utils/gallery.ts`

Update `getGalleryImages()` return type to include dimensions:

```typescript
export interface GalleryImage {
  src: ImageMetadata;
  alt: string;
  title?: string;
  width: number;   // Add
  height: number;  // Add
}

export async function getGalleryImages(
  galleryId: string,
  photos?: string[]
): Promise<GalleryImage[]> {
  // ... existing glob logic ...

  // When creating GalleryImage objects:
  return photos
    .map(filename => {
      const entry = imagesByFilename.get(filename);
      if (!entry) return null;
      return {
        src: entry.module.default,
        alt: filename.replace(/\.[^/.]+$/, ''),
        width: entry.module.default.width,   // Add
        height: entry.module.default.height, // Add
      };
    })
    .filter((img): img is GalleryImage => img !== null);
}
```

### Step 5: Update Page to Pass Dimensions

**File**: `src/pages/photos/[...id].astro`

Update to pass full image dimensions to component:

```astro
---
// ... existing imports and getStaticPaths ...

// Get gallery images with dimensions
const galleryImages = await getGalleryImages(
  gallery.id,
  gallery.data.photos
);

// Get full-size image metadata for PhotoSwipe and justified layout
const fullSizeImages = await Promise.all(
  galleryImages.map(async (img) => {
    return await getImage({
      src: img.src,
      width: Math.min(1600, img.width), // Cap at 1600px or original
      format: "webp",
    });
  })
);
---

<GalleryLayout title={title}>
  <Header
    title={title}
    subtitle={gallery.data.description}
    slot="header"
  />

  {galleryImages.length > 0 ? (
    <PhotoSwipeGallery
      images={galleryImages}
      fullSizeImages={fullSizeImages}
      galleryId={gallery.id}
    />
  ) : (
    <p>No images found in this gallery.</p>
  )}
</GalleryLayout>

<!-- Justified Layout Script -->
<script>
  // ... (from Step 3)
</script>

<!-- PhotoSwipe Script (existing) -->
<script>
  // ... existing PhotoSwipe initialization ...
</script>
```

### Step 6: Update PhotoSwipeGallery Props

**File**: `src/components/PhotoSwipeGallery.astro`

Update interface to accept full-size image data:

```astro
---
import { Image, getImage } from "astro:assets";
import type { GalleryImage } from "@utils/gallery";
import "photoswipe/style.css";
import "@css/photoswipe.css";

interface Props {
  images: GalleryImage[];
  fullSizeImages: Array<{ src: string; width: number; height: number }>;
  galleryId: string;
}

const { images, fullSizeImages, galleryId } = Astro.props;
---
```

## Validation Steps

### Step 1: Build and Visual Inspection
```bash
npm run build
npm run preview
```

**Check:**
- [ ] Gallery displays without TypeScript errors
- [ ] Images preserve natural aspect ratios (no cropping)
- [ ] Rows have consistent heights
- [ ] Layout looks balanced and professional
- [ ] Gaps between images are consistent (~8px)

### Step 2: Responsive Testing

**Mobile (< 500px):**
- [ ] ~2 images per row
- [ ] Row height ~150px
- [ ] Images load appropriately sized thumbnails
- [ ] Layout reflows on orientation change

**Tablet (500-1400px):**
- [ ] ~3 images per row
- [ ] Row height ~180-220px
- [ ] Smooth transitions when resizing

**Desktop (> 1400px):**
- [ ] ~4 images per row
- [ ] Row height ~280px
- [ ] Layout fills full width

### Step 3: PhotoSwipe Integration

**Check:**
- [ ] Clicking thumbnail opens lightbox
- [ ] Full-size image loads at 1600px max
- [ ] Navigation arrows work (next/previous)
- [ ] Keyboard navigation works (arrow keys)
- [ ] Close button works (X button, ESC key)
- [ ] Captions display correctly (if provided)
- [ ] Lightbox respects zoom settings (disabled)

### Step 4: Performance Testing

**Lazy Loading:**
- [ ] First 8 images load immediately
- [ ] Remaining images lazy load on scroll
- [ ] Network tab shows staggered image loading
- [ ] No layout shifts when images load

**Page Load:**
- [ ] Initial page load < 1MB (for typical gallery)
- [ ] Justified layout calculates quickly (< 100ms)
- [ ] No visible FOUC (Flash of Unstyled Content)

**Resize Performance:**
- [ ] Resize handler is debounced (150ms)
- [ ] Layout recalculates smoothly
- [ ] No jank or stuttering during resize

### Step 5: Large Gallery Test

Create test gallery with ~80-100 images:

- [ ] Layout calculates successfully
- [ ] Page remains responsive
- [ ] Lazy loading prevents initial page bloat
- [ ] Scrolling performance is smooth
- [ ] PhotoSwipe works with large gallery

### Step 6: Edge Cases

**Unusual aspect ratios:**
- [ ] Very tall images (portrait) display correctly
- [ ] Very wide images (panorama) display correctly
- [ ] Square images integrate well with mixed aspects

**Browser compatibility:**
- [ ] Chrome/Edge (current)
- [ ] Firefox (current)
- [ ] Safari (current - especially iOS)
- [ ] Mobile browsers

**Accessibility:**
- [ ] Images have proper alt text
- [ ] Keyboard navigation works
- [ ] Screen reader announces gallery structure

## Performance Characteristics

### Expected Performance (50-image gallery)

**Without lazy loading:**
- Initial load: ~5MB
- LCP (Largest Contentful Paint): 3-4s on 3G

**With lazy loading:**
- Initial load: ~800KB (8 images × ~100KB)
- LCP: 1-2s on 3G
- Remaining 42 images load progressively

**Layout calculation:**
- justified-layout computation: ~50-100ms for 50 images
- Negligible for user experience
- Debounced resize: 150ms delay prevents excessive recalculation

### Scaling Characteristics

| Gallery Size | Initial Load | Layout Calc | Total Assets |
|--------------|--------------|-------------|--------------|
| 20 images    | ~600KB       | ~20ms       | ~2MB         |
| 50 images    | ~800KB       | ~50ms       | ~5MB         |
| 100 images   | ~800KB       | ~100ms      | ~10MB        |

Lazy loading keeps initial load consistent regardless of gallery size.

## Future Enhancements

### Potential Improvements

1. **Configurable row height per gallery**
   - Add `targetRowHeight` to gallery.yaml frontmatter
   - Allow different galleries to have different densities

2. **Advanced lazy loading**
   - Upgrade to Intersection Observer for fine-grained control
   - Add blur-up placeholders (LQIP)
   - Show loading indicators

3. **Layout presets**
   - "Dense" mode (shorter rows, more images)
   - "Spacious" mode (taller rows, fewer images per row)
   - "Masonry" mode (for comparison)

4. **Performance optimizations**
   - Virtualize very large galleries (>200 images)
   - Add image size limits/warnings in CMS
   - Generate layouts at build time instead of client-side

5. **Visual enhancements**
   - Subtle hover effects on thumbnails
   - Image loading fade-in animation
   - Skeleton screens while layout calculates

### ImageGrid Integration (Future)

Not planned for initial implementation, but possible future convergence:

**If needed:**
- Add `enableLightbox` prop to ImageGrid
- Share justified-layout logic between components
- Provide layout mode option (`grid` vs `justified`)

**Current decision:** Keep separate per YAGNI principle. Different contexts and purposes justify separate implementations.

## Technical References

### Dependencies

**justified-layout**
- Version: ^2.1.0
- Source: https://github.com/flickr/justified-layout
- Used by: Flickr, 500px, other professional photo galleries
- Algorithm: Flickr's open-source justified layout algorithm

### Key Files

```
src/
├── components/
│   └── PhotoSwipeGallery.astro       # Update: new layout structure + CSS
├── pages/
│   └── photos/
│       └── [...id].astro              # Update: add justified layout script
├── utils/
│   └── gallery.ts                     # Update: add width/height to GalleryImage
├── css/
│   └── photoswipe.css                 # Unchanged: existing PhotoSwipe styles
└── types/
    └── gallery.ts                     # Unchanged: existing gallery schema

package.json                           # Add: justified-layout dependency
```

### Configuration Values

| Parameter | Value | Context |
|-----------|-------|---------|
| Desktop row height | 280px | Viewports > 1400px |
| Tablet row height | 220px | Viewports 800-1400px |
| Mobile row height | 150px | Viewports < 800px |
| Row height tolerance | 0.25 | ±25% flexibility |
| Box spacing | 8px | 0.5rem gap |
| Lazy load threshold | 8 images | First 8 eager, rest lazy |
| Thumbnail widths | [400, 600, 800, 1200] | Responsive breakpoints |
| Max full-size width | 1600px | PhotoSwipe lightbox |
| Resize debounce | 150ms | Window resize handler |

## Implementation Notes

### Key Decisions

1. **justified-layout library**: Proven algorithm, used by major photo sites
2. **Native lazy loading**: Simpler than custom Intersection Observer, adequate performance
3. **Responsive row heights**: Better visual balance across device sizes
4. **Absolute positioning**: Required by justified-layout algorithm
5. **Client-side calculation**: Layout depends on container width (unknown at build time)

### Potential Issues

**Issue 1: FOUC during layout calculation**
- **Symptom**: Images briefly visible in wrong positions
- **Solution**: Hide gallery with opacity: 0 until layout complete
- **Code**: Add transition class when layout applied

**Issue 2: Resize thrashing**
- **Symptom**: Layout recalculates too frequently on resize
- **Solution**: Debounce resize handler (150ms delay)
- **Already implemented**: See Step 3 script

**Issue 3: Safari height calculation**
- **Symptom**: Container height might not update properly in Safari
- **Solution**: Force reflow after setting height
- **Code**: Add `gallery.offsetHeight` read after setting height

**Issue 4: Large galleries slow layout**
- **Symptom**: 100-image gallery takes >200ms to calculate
- **Solution**: Show loading indicator if calculation takes >100ms
- **Future enhancement**: Pre-calculate at build time

### Testing Strategy

1. **Unit testing**: Not applicable (visual layout)
2. **Manual testing**: Required for all validation steps above
3. **Visual regression**: Screenshot comparison (optional, future)
4. **Performance monitoring**: Use Lighthouse, WebPageTest

### Rollback Plan

If implementation has issues:

1. **Quick rollback**: Revert to commit before Step 1
2. **Partial rollback**: Keep lazy loading, revert justified layout
3. **Fallback mode**: Detect errors, fall back to grid layout

**Code:**
```javascript
try {
  applyJustifiedLayout(galleryId);
} catch (error) {
  console.error('Justified layout failed, falling back to grid', error);
  gallery.classList.add('gallery-grid-fallback');
}
```

## Success Criteria

Implementation is successful when:

✅ Images preserve natural aspect ratios (no cropping)
✅ Layout resembles Lightroom aesthetic (justified rows)
✅ Rows have consistent heights within ±25%
✅ Responsive behavior works on mobile/tablet/desktop
✅ PhotoSwipe integration continues working
✅ Lazy loading reduces initial page weight by >5x
✅ Performance is acceptable (layout calc <100ms, resize smooth)
✅ No visual regressions or bugs
✅ Code is maintainable and well-documented

---

**Plan created**: 2025-01-03
**Status**: Ready for implementation
**Estimated effort**: 3-4 hours
**Branch**: Create new branch `justified-gallery-layout`

---

## Appendix A: justified-layout Configuration Reference

```typescript
interface JustifiedLayoutOptions {
  containerWidth: number;           // Container width in pixels
  containerPadding?: number;        // Padding around container (default: 0)
  boxSpacing?: number;              // Space between boxes (default: 10)
  targetRowHeight?: number;         // Ideal row height (default: 320)
  targetRowHeightTolerance?: number; // Flexibility 0-1 (default: 0.25)
  maxNumRows?: number;              // Maximum number of rows
  forceAspectRatio?: boolean;       // Force all boxes to same aspect
  showWidows?: boolean;             // Show incomplete last row (default: true)
  fullWidthBreakoutRowCadence?: boolean; // Every N rows full-width
}
```

## Appendix B: Image Sizing Comparison

### Current Implementation (Grid)

| Breakpoint | Container Width | Image Width | Purpose |
|------------|-----------------|-------------|---------|
| Mobile     | 400-500px       | 400px       | 1 column, full width |
| Tablet     | 500-800px       | 600px       | 2 columns, ~300px each |
| Desktop    | 800px+          | 800px       | 4 columns, ~200px each |

### Proposed Implementation (Justified)

| Breakpoint | Container Width | Image Width | Purpose |
|------------|-----------------|-------------|---------|
| Mobile     | 400-500px       | 400px       | ~2 per row, ~200px each |
| Small      | 500-800px       | 600px       | ~2-3 per row, ~250px each |
| Medium     | 800-1400px      | 800px       | ~3-4 per row, ~300px each |
| Large      | 1400px+         | 1200px      | ~4-5 per row, ~350px each |

Justified layout requires larger thumbnails because each image could be wider in its row depending on aspect ratio and packing.
