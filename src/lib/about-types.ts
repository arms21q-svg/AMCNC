export type AboutBlock = {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
};

export type AboutContent = {
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  heroImageUrl: string;
  missionTitleAr: string;
  missionTitleEn: string;
  missionTextAr: string;
  missionTextEn: string;
  visionTitleAr: string;
  visionTitleEn: string;
  visionTextAr: string;
  visionTextEn: string;
  valuesHeadingAr: string;
  valuesHeadingEn: string;
  blocks: AboutBlock[];
  showWhyUs: boolean;
  showStats: boolean;
  showCta: boolean;
};

export type AboutPageView = {
  title: string;
  subtitle: string;
  description: string;
  heroImageUrl: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesHeading: string;
  blocks: Array<{
    id: string;
    title: string;
    body: string;
  }>;
  showWhyUs: boolean;
  showStats: boolean;
  showCta: boolean;
};
