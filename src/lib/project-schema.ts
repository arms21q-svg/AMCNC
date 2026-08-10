import { z } from "zod";
import { slugify } from "@/lib/utils";

const optionalText = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v?.trim() ? v.trim() : ""));

export const projectInputSchema = z.object({
  slug: z.string().max(120).optional().nullable(),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionAr: optionalText,
  descriptionEn: optionalText,
  client: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  dimensionsAr: optionalText,
  dimensionsEn: optionalText,
  materialsAr: optionalText,
  materialsEn: optionalText,
  keywordsAr: optionalText,
  keywordsEn: optionalText,
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
  categoryId: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  galleryUrls: z.array(z.string()).optional(),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export type NormalizedProjectInput = Omit<
  ProjectInput,
  | "slug"
  | "dimensionsAr"
  | "dimensionsEn"
  | "materialsAr"
  | "materialsEn"
  | "keywordsAr"
  | "keywordsEn"
> & {
  slug: string;
  dimensionsAr: string | null;
  dimensionsEn: string | null;
  materialsAr: string | null;
  materialsEn: string | null;
  keywordsAr: string | null;
  keywordsEn: string | null;
};

/** Ensure DB always gets non-null description strings for display fallbacks. */
export function normalizeProjectInput(data: ProjectInput): NormalizedProjectInput {
  const slug =
    data.slug?.trim() ||
    slugify(data.titleEn || data.titleAr) ||
    slugify(data.titleAr);

  return {
    ...data,
    slug,
    descriptionAr: data.descriptionAr?.trim() || data.titleAr,
    descriptionEn: data.descriptionEn?.trim() || data.titleEn,
    client: data.client?.trim() || null,
    location: data.location?.trim() || null,
    categoryId: data.categoryId?.trim() || null,
    dimensionsAr: data.dimensionsAr?.trim() || null,
    dimensionsEn: data.dimensionsEn?.trim() || null,
    materialsAr: data.materialsAr?.trim() || null,
    materialsEn: data.materialsEn?.trim() || null,
    keywordsAr: data.keywordsAr?.trim() || null,
    keywordsEn: data.keywordsEn?.trim() || null,
  };
}
