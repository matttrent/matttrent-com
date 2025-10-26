import { z } from 'astro:content';

export const gallerySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
  modifiedAt: z.coerce.date().optional(),
  isDraft: z.boolean().default(false),
});

export type Gallery = z.infer<typeof gallerySchema>;
