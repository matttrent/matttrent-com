import { z } from "astro/zod";

export const noteSchema = z.object({
  title: z.string(),
  isDraft: z.boolean().optional(),
  createdAt: z.date(),
  modifiedAt: z.date().optional(),
});

export type Note = z.infer<typeof noteSchema>; 
