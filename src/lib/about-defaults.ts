import type { AboutContent } from "@/lib/about-types";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80";

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  titleAr: "من نحن",
  titleEn: "About Us",
  subtitleAr: "شغف بالخشب، دقة في التنفيذ",
  subtitleEn: "Passion for wood, precision in execution",
  descriptionAr:
    "AM CNC WOOD DESIGN شركة متخصصة في تصميم ونحت الخشب باستخدام تقنية CNC المتقدمة. نجمع بين الحرفية التقليدية والتكنولوجيا الحديثة لنقدم قطعاً فريدة تلبي أعلى معايير الجودة والفخامة.",
  descriptionEn:
    "AM CNC WOOD DESIGN specializes in wood design and carving using advanced CNC technology. We combine traditional craftsmanship with modern technology to deliver unique pieces that meet the highest standards of quality and luxury.",
  heroImageUrl: DEFAULT_HERO_IMAGE,
  missionTitleAr: "رسالتنا",
  missionTitleEn: "Our Mission",
  missionTextAr:
    "تقديم حلول خشبية مبتكرة تجمع بين الجمال والوظيفة، مع الالتزام بأعلى معايير الجودة والاستدامة.",
  missionTextEn:
    "Deliver innovative wood solutions that combine beauty and function, committed to the highest standards of quality and sustainability.",
  visionTitleAr: "رؤيتنا",
  visionTitleEn: "Our Vision",
  visionTextAr: "أن نكون الخيار الأول عالمياً في مجال تصميم ونحت الخشب بالتقنية CNC.",
  visionTextEn: "To be the world's first choice in CNC wood design and carving.",
  valuesHeadingAr: "قيمنا",
  valuesHeadingEn: "Our Values",
  blocks: [
    {
      id: "quality",
      titleAr: "الجودة",
      titleEn: "Quality",
      bodyAr: "نلتزم بأعلى معايير الجودة في كل مشروع",
      bodyEn: "We commit to the highest quality standards in every project",
    },
    {
      id: "innovation",
      titleAr: "الابتكار",
      titleEn: "Innovation",
      bodyAr: "نستخدم أحدث تقنيات CNC لتحقيق دقة لا مثيل لها",
      bodyEn: "We use the latest CNC technology for unmatched precision",
    },
    {
      id: "craftsmanship",
      titleAr: "الحرفية",
      titleEn: "Craftsmanship",
      bodyAr: "خبرة عقود في فن النجارة والتصميم الخشبي",
      bodyEn: "Decades of expertise in woodworking and design",
    },
  ],
  showWhyUs: true,
  showStats: true,
  showCta: true,
};

export const ABOUT_CONTENT_SETTING_KEY = "about_content";
