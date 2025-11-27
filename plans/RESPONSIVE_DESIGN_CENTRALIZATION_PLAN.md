# Responsive Design Centralization Plan

## Problem Statement

The site currently has **inconsistent breakpoints** and **duplicated image sizing logic** across multiple components and CSS files. This creates:

- Maintenance burden (update values in 7+ places)
- Inconsistent user experience (different breakpoints for CSS vs images)
- Code duplication (same logic repeated in 4+ components)
- Risk of drift (values already inconsistent: 500px vs 760px)

## Current State Analysis

### Breakpoints (Inconsistent)

**JavaScript/TypeScript (Image Components):**
- `500px` - mobile (ImageGrid, PhotoSwipeGallery, BasicImage, SidenoteImage)
- `800px` - tablet (ImageGrid, PhotoSwipeGallery, BasicImage, SidenoteImage)
- `1400px` - desktop (ImageGrid, PhotoSwipeGallery)

**CSS Media Queries:**
- `760px` - mobile breakpoint (ProseWrapper, Header, CVList, BaseFigure, photoswipe.css)
- `1360px` - grid layout change (shared.css)

**Problem:** Image components think "mobile" ends at 500px, but CSS layout changes at 760px. This creates a 260px gap where image sizing doesn't match layout behavior.

### Image Width Configurations (Duplicated)

**PhotoSwipeGallery.astro:**
```typescript
const IMAGE_WIDTHS = [400, 600, 800, 1200];
const MAX_FULL_SIZE_WIDTH = 1600;
```

**ImageGrid.astro:**
```typescript
const IMAGE_WIDTHS = {
  normal: [500, 800],
  full: [500, 800, 1220],
  fullscreen: [500, 800, 1600],
};
const DEFAULT_WIDTHS = { normal: 800, full: 1220, fullscreen: 1600 };
```

**BasicImage.astro:**
```typescript
// Inline in functions:
return [500, 800]; // normal
return [500, 800, 1220]; // full
```

**SidenoteImage.astro:**
```typescript
return [500, 800];
```

**Problem:** Same concepts (prose width, full width, screen width) expressed differently in each component. No single source of truth.

## Finalized Decisions

Based on user feedback, the following design decisions have been confirmed:

1. **Three breakpoints:** 760px (mobile), 1024px (tablet), 1400px (wide)
2. **Naming convention:** `BREAK`, `CONTENT`, `IMG` for better template string legibility
3. **CSS grid breakpoint:** Keep separate at 1360px (different concern - grid structure vs content width)
4. **PhotoSwipeGallery viewport checks:** Use shared `BREAK` constants instead of component-specific values

## Design Decisions

### 1. Unified Breakpoint Strategy

**Decision: Three-breakpoint system (760px, 1024px, 1400px)**

**Rationale:**
- CSS breakpoint (760px) is already dominant across the site
- Matches Tufte CSS conventions for prose/sidenote layout changes
- 1024px fills the gap for tablets and medium-sized screens
- Better granularity for responsive image sizing

**New breakpoints:**
- **Mobile:** `≤ 760px` - Narrow screens, sidenotes collapse, single column
- **Tablet:** `> 760px and ≤ 1024px` - Tablets, medium screens
- **Desktop:** `> 1024px and ≤ 1400px` - Standard desktop width
- **Wide:** `> 1400px` - Extra-wide screens, full-width content possible

**Note:** CSS grid breakpoint (1360px) in shared.css remains separate - it controls grid column sizing, not content breakpoints.

### 2. Naming Convention for Constants

**Decision: Use short, readable names (BREAK, CONTENT, IMG)**

**Rationale:**
- Improves legibility in template strings: `${BREAK.mobile}` vs `${BREAKPOINT.mobile}`
- Balances brevity with clarity
- Reduces line length in complex responsive strings

**Naming scheme:**
- `BREAK.mobile` / `BREAK.tablet` / `BREAK.wide` - Viewport breakpoints
- `CONTENT.prose` / `CONTENT.full` / `CONTENT.screen` - Content width constraints
- `IMG.thumb` / `IMG.small` / `IMG.medium` / `IMG.large` / `IMG.xlarge` - Image widths

### 3. Semantic Width Constants

**Decision: Replace magic numbers with semantic names**

Instead of arbitrary pixel values, use names that describe *purpose*:

- `CONTENT.prose` = 800px (normal article width)
- `CONTENT.full` = 1220px (full column, edge-to-edge in grid)
- `CONTENT.screen` = 1600px (full viewport width)

**Rationale:** Makes code self-documenting. `CONTENT.prose` is clearer than `800`.

### 4. Eliminate DEFAULT_WIDTHS Duplication

**Decision: Remove DEFAULT_WIDTHS entirely, derive from arrays**

Current problem:
```typescript
const IMAGE_WIDTHS = { normal: [500, 800] };
const DEFAULT_WIDTHS = { normal: 800 }; // Duplicate of last value!
```

Solution:
```typescript
// Just use the array directly
IMAGE_WIDTHS.normal.at(-1)  // Returns 800
```

**Rationale:** Eliminates maintenance burden. Update array once, default is automatically the largest value.

### 5. Shared Utilities Over Duplicated Logic

**Decision: Create shared constants and helper functions**

All components should import from:
- `@constants/responsive` - Breakpoints and content widths
- `@utils/responsive-images` - Helper functions for sizes/widths attributes

**Rationale:** Single source of truth. Change once, applies everywhere.

## Implementation Plan

### Step 1: Create Shared Constants

**Create: `src/constants/responsive.ts`**

```typescript
/**
 * Site-wide responsive breakpoints (pixels)
 * Aligned with CSS media queries for consistent behavior
 */
export const BREAK = {
  /** Mobile breakpoint: sidenotes collapse, narrow layout */
  mobile: 760,
  /** Tablet breakpoint: medium screens, tablets */
  tablet: 1024,
  /** Wide breakpoint: extra-wide layouts possible */
  wide: 1400,
} as const;

/**
 * Standard content width constraints
 */
export const CONTENT = {
  /** Normal prose/article width */
  prose: 800,
  /** Full column width (edge-to-edge in grid) */
  full: 1220,
  /** Maximum screen width for images */
  screen: 1600,
} as const;

/**
 * Standard image widths for srcset generation
 * Chosen to align with typical device pixel densities and content widths
 */
export const IMG = {
  thumb: 400,   // Gallery thumbnails, very small screens
  small: 600,   // Phones, small tablets
  medium: 800,  // Tablets, prose images
  large: 1200,  // Desktops, gallery images
  xlarge: 1600, // High-DPI desktops, fullscreen images
} as const;
```

### Step 2: Create Responsive Image Utilities

**Create: `src/utils/responsive-images.ts`**

```typescript
import { BREAK, CONTENT, IMG } from '@constants/responsive';

/**
 * Layout context for image sizing
 */
export type ImageLayout =
  | 'prose'      // Normal article images (width: 800px)
  | 'full'       // Full-width in grid (width: 1220px)
  | 'fullscreen' // Edge-to-edge fullscreen (width: 1600px)
  | 'gallery';   // Gallery thumbnails (variable, optimized for rows)

/**
 * Generates responsive sizes attribute for <Image> component
 *
 * @param layout - The layout context for the image
 * @returns sizes attribute string (e.g., "(max-width: 760px) 100vw, 800px")
 */
export function getImageSizes(layout: ImageLayout): string {
  switch (layout) {
    case 'prose':
      return `(max-width: ${BREAK.mobile}px) 100vw, ${CONTENT.prose}px`;

    case 'full':
      return `(max-width: ${BREAK.mobile}px) 100vw, (max-width: ${BREAK.tablet}px) ${CONTENT.prose}px, ${CONTENT.full}px`;

    case 'fullscreen':
      return `(max-width: ${BREAK.mobile}px) 100vw, (max-width: ${BREAK.tablet}px) ${CONTENT.prose}px, (max-width: ${BREAK.wide}px) ${CONTENT.full}px, ${CONTENT.screen}px`;

    case 'gallery':
      // Gallery thumbnails: smaller on mobile, larger on desktop
      return `(max-width: ${BREAK.mobile}px) ${IMG.thumb}px, (max-width: ${BREAK.tablet}px) ${IMG.small}px, (max-width: ${BREAK.wide}px) ${IMG.medium}px, ${IMG.large}px`;

    default:
      return `${CONTENT.prose}px`;
  }
}

/**
 * Generates widths array for image optimization (srcset)
 *
 * @param layout - The layout context for the image
 * @returns Array of pixel widths for Astro's Image component
 */
export function getImageWidths(layout: ImageLayout): number[] {
  switch (layout) {
    case 'prose':
      return [IMG.small, IMG.medium];

    case 'full':
      return [IMG.small, IMG.medium, CONTENT.full];

    case 'fullscreen':
      return [IMG.small, IMG.medium, CONTENT.full, CONTENT.screen];

    case 'gallery':
      return [IMG.thumb, IMG.small, IMG.medium, IMG.large];

    default:
      return [IMG.medium];
  }
}
```

### Step 3: Update Image Components

Migrate components from simplest to most complex to validate approach early.

#### 3a. Update SidenoteImage.astro

**Before:**
```typescript
const getImageSizes = () => {
  return "(max-width: 500px) 500px, (max-width: 800px) 800px, 800px";
};
const getImageWidths = () => {
  return [500, 800];
};
```

**After:**
```typescript
import { getImageSizes, getImageWidths } from '@utils/responsive-images';
// In template:
sizes={getImageSizes('prose')}
widths={getImageWidths('prose')}
```

#### 3b. Update BasicImage.astro

**Before:**
```typescript
const getImageSizes = (layoutType: "normal" | "full") => {
  if (layoutType === "full") {
    return "(max-width: 500px) 500px, (max-width: 800px) 800px, 1220px";
  }
  return "(max-width: 500px) 500px, (max-width: 800px) 800px, 800px";
};
// etc...
```

**After:**
```typescript
import { getImageSizes, getImageWidths, type ImageLayout } from '@utils/responsive-images';

// Map component's layout prop to utility's layout type
const layoutMap: Record<'normal' | 'full', ImageLayout> = {
  normal: 'prose',
  full: 'full',
};

const imageLayout = layoutMap[layout];
```

#### 3c. Update ImageGrid.astro

**Remove:**
```typescript
const BREAKPOINTS = { mobile: 500, tablet: 800, desktop: 1400 };
const IMAGE_WIDTHS = { normal: [500, 800], full: [...], fullscreen: [...] };
const DEFAULT_WIDTHS = { normal: 800, full: 1220, fullscreen: 1600 };
```

**Replace with:**
```typescript
import { getImageSizes, getImageWidths } from '@utils/responsive-images';
import { BREAK } from '@constants/responsive';

// Map ImageGrid's layout prop to ImageLayout type
const layoutMap = {
  normal: 'prose',
  full: 'full',
  fullscreen: 'fullscreen',
} as const;
```

**Update functions:**
```typescript
const getImageSizes = (layoutWidth: typeof layout) => {
  return getImageSizes(layoutMap[layoutWidth]);
};

const getImageWidths = (layoutWidth: typeof layout) => {
  return getImageWidths(layoutMap[layoutWidth]);
};
```

**Note:** Keep BREAK import for potential use in future responsive features. Not immediately used but available.

#### 3d. Update PhotoSwipeGallery.astro

**Remove:**
```typescript
const BREAKPOINTS = { mobile: 500, tablet: 800, desktop: 1400 };
const IMAGE_WIDTHS = [400, 600, 800, 1200];
const MAX_FULL_SIZE_WIDTH = 1600;
```

**Replace with:**
```typescript
import { getImageSizes, getImageWidths } from '@utils/responsive-images';
import { BREAK, CONTENT } from '@constants/responsive';

// Use shared constants
const MAX_FULL_SIZE_WIDTH = CONTENT.screen;
```

**Update script section:**
```typescript
// In applyJustifiedLayout function:
const viewportWidth = window.innerWidth;
let targetRowHeight: number;
if (viewportWidth <= BREAK.mobile) {
  targetRowHeight = rowHeights.mobile;
} else if (viewportWidth <= BREAK.tablet) {
  targetRowHeight = rowHeights.tablet;
} else if (viewportWidth <= BREAK.wide) {
  targetRowHeight = rowHeights.desktop;
} else {
  targetRowHeight = rowHeights.wide;
}
```

**Note:** TARGET_ROW_HEIGHTS stays component-specific (gallery layout concern, not site-wide responsive concern). Values would be:
- `mobile`: 150px (≤760px)
- `tablet`: 180px (761-1024px)
- `desktop`: 220px (1025-1400px)
- `wide`: 280px (>1400px)

### Step 4: Validation

For each component update:

1. **Build check:** `npm run build` - no TypeScript errors
2. **Visual check:** `npm run dev` - inspect at breakpoints (760px, 1024px, 1400px)
3. **Network tab:** Verify correct image sizes load at each breakpoint
4. **DevTools responsive mode:** Test across viewport sizes

**Key checkpoints:**
- 760px: mobile → tablet transition
- 1024px: tablet → desktop transition
- 1400px: desktop → wide transition

### Step 5: Documentation Updates

Update CLAUDE.md to reference new constants:

```markdown
### Responsive Design

The site uses consistent breakpoints defined in `src/constants/responsive.ts`:
- Mobile: ≤ 760px (narrow screens, matches CSS media queries)
- Tablet: 761-1024px (medium screens, tablets)
- Desktop: 1025-1400px (standard desktop width)
- Wide: > 1400px (extra-wide layouts)

Image components use shared utilities from `src/utils/responsive-images.ts` for consistent sizing:
- Import constants: `BREAK`, `CONTENT`, `IMG`
- Use helper functions: `getImageSizes()`, `getImageWidths()`
```

## Migration Notes

### Breaking Changes

**None for users.** This is internal refactoring.

**For developers:**
- Don't hardcode breakpoint values - import from `@constants/responsive`
- Use `getImageSizes()` and `getImageWidths()` utilities instead of manual sizing
- Layout types: 'normal' → 'prose', keep 'full' and 'fullscreen'

### Backward Compatibility

All components maintain existing props and APIs. Only internal implementation changes.

### Rollback Strategy

Each component update is independent. If issues arise:
1. Revert individual component commit
2. Shared utilities remain available for other components
3. No cascade failures

## Benefits

### Immediate

- **Single source of truth:** Update breakpoints in one place
- **Consistency:** Images and layout change at same viewport widths
- **Type safety:** TypeScript ensures correct usage
- **Self-documenting:** `CONTENT_WIDTH.prose` clearer than `800`

### Long-term

- **Easier maintenance:** Add/change breakpoints without hunting values
- **Future-proof:** New components automatically use correct values
- **Testing:** Can mock constants for responsive behavior tests
- **Refactoring:** Easier to adjust responsive strategy globally

## Future Enhancements

### Potential Improvements (Not in Scope)

1. **CSS variable integration:** Export constants as CSS custom properties
   ```typescript
   // Could generate: --breakpoint-mobile: 760px
   ```

2. **Grid breakpoint alignment:** Evaluate whether 1360px should align with 1400px

3. **Responsive utilities expansion:** Add more helpers (e.g., `isWideViewport()`, `getColumnCount()`)

4. **Build-time optimization:** Pre-calculate sizes strings at build time

## Success Criteria

✅ All image components use shared constants
✅ No hardcoded breakpoint values in components
✅ Breakpoints aligned between CSS and image sizing
✅ No DEFAULT_WIDTHS duplication
✅ All builds pass TypeScript checks
✅ Visual rendering unchanged (internal refactor only)
✅ Documentation updated

---

**Plan created:** 2025-01-04
**Plan finalized:** 2025-01-04
**Status:** Finalized, ready for implementation
**Branch:** `gallery`
