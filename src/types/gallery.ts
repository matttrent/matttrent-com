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

// Justified layout types
export interface LayoutBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface LayoutGeometry {
  containerHeight: number;
  boxes: LayoutBox[];
}

export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface RowHeights {
  mobile: number;
  tablet: number;
  medium: number;
  desktop: number;
}
