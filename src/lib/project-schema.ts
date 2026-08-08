import { z } from "zod";

const optionalText = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v?.trim() ? v.trim() : ""));

export const projectInputSchema = z.object({
  slug: z.string().min(1).max(120),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionAr: optionalText,
  descriptionEn: optionalText,
  client: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
  categoryId: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  galleryUrls: z.array(z.string()).optional(),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

/** Ensure DB always gets non-null description strings for display fallbacks. */
export function normalizeProjectInput(data: ProjectInput): ProjectInput {
  return {
    ...data,
    descriptionAr: data.descriptionAr?.trim() || data.titleAr,
    descriptionEn: data.descriptionEn?.trim() || data.titleEn,
    client: data.client?.trim() || null,
    location: data.location?.trim() || null,
    categoryId: data.categoryId?.trim() || null,
  };
}
