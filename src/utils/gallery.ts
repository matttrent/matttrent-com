import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import { isPublished } from "@utils/content";

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

/**
 * Get images for a specific gallery, respecting photos array if present
 *
 * @param galleryId - Directory name of the gallery (e.g., "eastern-sierra-test")
 * @param photos - Optional array of filenames for manual ordering
 * @returns Array of images ready for PhotoSwipeGallery component
 */
export async function getGalleryImages(
  galleryId: string,
  photos?: string[]
): Promise<GalleryImage[]> {
  // Glob all images from gallery directory
  const allImages = import.meta.glob<{ default: ImageMetadata }>(
    "@assets/gallery/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
    { eager: true }
  );

  // Filter images that belong to this gallery
  const galleryImageEntries = Object.entries(allImages)
    .filter(([path]) => path.includes(`/gallery/${galleryId}/`))
    .filter(([path]) => !path.endsWith('gallery.yaml'));

  // If photos array specified, use that for ordering
  if (photos && photos.length > 0) {
    const imagesByFilename = new Map(
      galleryImageEntries.map(([path, module]) => [
        path.split('/').pop() || '',
        { path, module }
      ])
    );

    return photos
      .map(filename => {
        const entry = imagesByFilename.get(filename);
        if (!entry) return null;
        return {
          src: entry.module.default,
          alt: filename.replace(/\.[^/.]+$/, ''),
          width: entry.module.default.width,
          height: entry.module.default.height,
        };
      })
      .filter((img): img is GalleryImage => img !== null);
  }

  // Default: alphabetical by filename
  return galleryImageEntries
    .map(([path, module]) => ({
      src: module.default,
      alt: path.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Gallery image',
      width: module.default.width,
      height: module.default.height,
    }))
    .sort((a, b) => a.alt.localeCompare(b.alt));
}

/**
 * Filter galleries based on draft status and environment
 *
 * @param galleries - Array of gallery collection entries
 * @returns Filtered array (excludes drafts in production)
 */
export function filterPublishedGalleries<T extends CollectionEntry<"galleries">>(
  galleries: T[]
): T[] {
  return galleries.filter(isPublished);
}
