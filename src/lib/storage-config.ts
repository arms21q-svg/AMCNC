/** Single Supabase Storage bucket for all project/media images. */
export const STORAGE_BUCKET = "project-images";

/** Path prefixes inside the bucket (not separate buckets). */
export const STORAGE_FOLDERS = {
  library: "library",
  projects: "projects",
  hero: "hero",
} as const;

export type StorageFolderKey = keyof typeof STORAGE_FOLDERS;

/** Map legacy/client folder names to storage path prefixes. */
export function resolveStorageFolder(folder?: string): string {
  switch (folder) {
    case "projects":
      return STORAGE_FOLDERS.projects;
    case "hero":
      return STORAGE_FOLDERS.hero;
    case "library":
    case "uploads":
    default:
      return STORAGE_FOLDERS.library;
  }
}

export const ALLOWED_UPLOAD_FOLDERS = new Set([
  "library",
  "uploads",
  "projects",
  "hero",
]);
