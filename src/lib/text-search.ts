import type { ProjectListItem } from "@/lib/content-types";
import { getLocalizedField } from "@/lib/utils";

/** Normalize Arabic/English text for consistent matching. */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\w\s\u0600-\u06FF-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(query: string): string[] {
  return normalizeSearchText(query)
    .split(" ")
    .filter((token) => token.length >= 2);
}

/** Simple typo tolerance: one missing character in the needle. */
function fuzzyIncludes(haystack: string, needle: string): boolean {
  if (!needle || needle.length < 4) return false;
  if (haystack.includes(needle)) return true;

  for (let i = 0; i < needle.length; i++) {
    const variant = needle.slice(0, i) + needle.slice(i + 1);
    if (variant.length >= 3 && haystack.includes(variant)) return true;
  }

  return false;
}

function fieldScore(normalizedField: string, query: string, tokens: string[], weight: number): number {
  if (!normalizedField) return 0;

  let score = 0;
  if (normalizedField.includes(query)) score += weight * 2;

  for (const token of tokens) {
    if (normalizedField.includes(token)) {
      score += weight;
    } else if (fuzzyIncludes(normalizedField, token)) {
      score += weight * 0.5;
    }
  }

  return score;
}

export function scoreProjectMatch(
  project: ProjectListItem,
  query: string,
  locale: string
): number {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  const tokens = tokenize(query);
  const title = getLocalizedField(project, "title", locale);
  const description = getLocalizedField(project, "description", locale);
  const categoryName = project.category
    ? getLocalizedField(project.category, "name", locale)
    : "";

  let score = 0;
  score += fieldScore(normalizeSearchText(title), normalizedQuery, tokens, 12);
  score += fieldScore(normalizeSearchText(project.titleAr), normalizedQuery, tokens, 8);
  score += fieldScore(normalizeSearchText(project.titleEn), normalizedQuery, tokens, 8);
  score += fieldScore(normalizeSearchText(description), normalizedQuery, tokens, 4);
  score += fieldScore(normalizeSearchText(project.descriptionAr), normalizedQuery, tokens, 3);
  score += fieldScore(normalizeSearchText(project.descriptionEn), normalizedQuery, tokens, 3);
  score += fieldScore(normalizeSearchText(categoryName), normalizedQuery, tokens, 7);
  score += fieldScore(normalizeSearchText(project.category?.nameAr || ""), normalizedQuery, tokens, 5);
  score += fieldScore(normalizeSearchText(project.category?.nameEn || ""), normalizedQuery, tokens, 5);
  score += fieldScore(normalizeSearchText(project.slug), normalizedQuery, tokens, 6);
  score += fieldScore(normalizeSearchText(project.client || ""), normalizedQuery, tokens, 5);
  score += fieldScore(normalizeSearchText(project.location || ""), normalizedQuery, tokens, 4);

  return score;
}

export function filterAndRankProjects(
  projects: ProjectListItem[],
  query: string,
  locale: string
): ProjectListItem[] {
  const trimmed = query.trim();
  if (!trimmed) return projects;

  return projects
    .map((project) => ({
      project,
      score: scoreProjectMatch(project, trimmed, locale),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ project }) => project);
}
