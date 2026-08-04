import "server-only";
import { getSettingsMap } from "@/lib/site-settings.server";
import {
  DEFAULT_HERO_SLIDES,
  type HeroSlide,
} from "@/lib/hero-slides";

export type { HeroSlide };
export { HERO_SLIDE_SETTING_KEYS } from "@/lib/hero-slides";

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const settings = await getSettingsMap();
  const slides: HeroSlide[] = [];

  for (let i = 1; i <= 5; i++) {
    const url = settings[`hero_slide_${i}_url`]?.trim();
    if (!url) continue;
    slides.push({
      src: url,
      altAr:
        settings[`hero_slide_${i}_alt_ar`]?.trim() ||
        DEFAULT_HERO_SLIDES[i - 1]?.altAr ||
        "صورة",
      altEn:
        settings[`hero_slide_${i}_alt_en`]?.trim() ||
        DEFAULT_HERO_SLIDES[i - 1]?.altEn ||
        "Image",
    });
  }

  return slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
}
