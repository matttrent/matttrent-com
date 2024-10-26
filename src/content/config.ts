// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';

// 2. Define your collection(s)
const noteCollection = defineCollection({ 
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    isDraft: z.boolean().optional(),
  }),
 });

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  'notes': noteCollection,
};
