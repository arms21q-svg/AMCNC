import type { Prisma } from "@prisma/client";

export type ProjectListItem = Prisma.ProjectGetPayload<{
  include: {
    category: {
      select: { id: true; slug: true; nameAr: true; nameEn: true };
    };
    images: {
      select: {
        id: true;
        url: true;
        altAr: true;
        altEn: true;
        isCover: true;
        order: true;
      };
    };
  };
}>;

export type CategoryItem = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
};
