import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import type { GalleryImage } from "@mttypes/gallery";
import { isPublished } from "@utils/content";

/**
 * Get images for a specific gallery, respecting photos array if present
 *
 * @param galleryId - ID of the gallery (from YAML filename)
 * @param photos - Optional array of filenames for manual ordering
 * @param imageDir - Optional image directory name (defaults to galleryId if not specified)
 * @returns Array of images ready for PhotoSwipeGallery component
 */
export async function getGalleryImages(
  galleryId: string,
  photos?: string[],
  imageDir?: string
): Promise<GalleryImage[]> {
  // Use imageDir if provided, otherwise fall back to galleryId
  const imageDirPath = imageDir || galleryId;

  // Glob all images from gallery directory
  const allImages = import.meta.glob<{ default: ImageMetadata }>(
    "@assets/gallery/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
    { eager: true }
  );

  // Filter images that belong to this gallery
  const galleryImageEntries = Object.entries(allImages)
    .filter(([path]) => path.includes(`/gallery/${imageDirPath}/`))
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
