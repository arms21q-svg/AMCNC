export interface HeroSlide {
  src: string;
  altAr: string;
  altEn: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85&fit=crop",
    altAr: "تصميم خشبي فاخر",
    altEn: "Luxury wood design",
  },
  {
    src: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1920&q=85&fit=crop",
    altAr: "نحت CNC دقيق",
    altEn: "Precision CNC carving",
  },
  {
    src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=85&fit=crop",
    altAr: "ديكورات خشبية",
    altEn: "Wood decorations",
  },
  {
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=85&fit=crop",
    altAr: "أثاث مخصص",
    altEn: "Custom furniture",
  },
  {
    src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=85&fit=crop",
    altAr: "ألواح جدارية",
    altEn: "Wall panels",
  },
];

export const HERO_SLIDE_SETTING_KEYS = Array.from({ length: 5 }, (_, i) => {
  const n = i + 1;
  return [
    `hero_slide_${n}_url`,
    `hero_slide_${n}_alt_ar`,
    `hero_slide_${n}_alt_en`,
  ];
}).flat();
