import { z } from 'astro:content';
import type { ImageMetadata } from 'astro';

export const gallerySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
  modifiedAt: z.coerce.date().optional(),
  isDraft: z.boolean().default(false),
  imageDir: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export type Gallery = z.infer<typeof gallerySchema>;

/**
 * Image representation for gallery rendering
 */
export interface GalleryImage {
  src: ImageMetadata;
  alt: string;
  title?: string;
  width: number;
  height: number;
}

// Justified layout types

/**
 * Position and dimensions for a single image in the justified layout
 */
export interface LayoutBox {
  /** Distance from container top (pixels) */
  top: number;
  /** Distance from container left (pixels) */
  left: number;
  /** Image width (pixels) */
  width: number;
  /** Image height (pixels) */
  height: number;
}

/**
 * Complete layout geometry returned by justified-layout algorithm
 */
export interface LayoutGeometry {
  /** Total container height needed for all images (pixels) */
  containerHeight: number;
  /** Array of positioned boxes, one per image */
  boxes: LayoutBox[];
}

/**
 * Responsive breakpoint thresholds for layout adjustments
 */
export interface Breakpoints {
  /** Mobile breakpoint (pixels) */
  mobile: number;
  /** Tablet breakpoint (pixels) */
  tablet: number;
  /** Desktop breakpoint (pixels) */
  desktop: number;
}

/**
 * Target row heights at different breakpoints for justified layout
 */
export interface RowHeights {
  /** Row height for mobile viewports (pixels) */
  mobile: number;
  /** Row height for tablet viewports (pixels) */
  tablet: number;
  /** Row height for medium viewports (pixels) */
  medium: number;
  /** Row height for desktop viewports (pixels) */
  desktop: number;
}
