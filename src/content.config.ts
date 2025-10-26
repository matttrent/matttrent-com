// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { noteSchema } from '@mttypes/note';
import { gallerySchema } from '@mttypes/gallery';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

// 2. Define your collection(s)
const noteCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/notes" }),
  schema: noteSchema,
 });

// Custom loader for galleries that sets ID to directory name
const galleriesLoader = {
  name: 'galleries-loader',
  load: async ({ store, logger }: any) => {
    const galleriesDir = path.join(process.cwd(), 'src/assets/galleries');

    // Check if galleries directory exists
    if (!fs.existsSync(galleriesDir)) {
      logger.warn('Galleries directory not found at src/assets/galleries');
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

          // Ensure dates are Date objects (YAML parser might return them as strings or Dates)
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

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  'notes': noteCollection,
  'galleries': galleryCollection,
};
