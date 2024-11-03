import { z } from "astro:content";

export const noteSchema = z.object({
  title: z.string(),
  date: z.date(),
  isDraft: z.boolean().optional(),
  createdAt: z.date().optional(),
  modifiedAt: z.date().optional(),
});

export type Note = z.infer<typeof noteSchema>; 
