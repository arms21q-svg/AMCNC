import "server-only";
import { prisma } from "@/lib/prisma";
import { syncContactFloatingLinks, upsertSettings } from "@/lib/site-settings.server";

export async function seedDemoData() {
  const categories = [
    { slug: "decorations", nameAr: "ديكورات", nameEn: "Decorations", order: 1 },
    { slug: "furniture", nameAr: "أثاث", nameEn: "Furniture", order: 2 },
    { slug: "art", nameAr: "فن", nameEn: "Art", order: 3 },
    { slug: "commercial", nameAr: "تجاري", nameEn: "Commercial", order: 4 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map(
      (c) => [c.slug, c.id]
    )
  );

  await upsertSettings({
    hero_eyebrow_ar: "دقة عالية • جودة مميزة • تصميم إبداعي",
    hero_eyebrow_en: "High Precision • Premium Quality",
    hero_title_ar: "تصميم وتنفيذ",
    hero_title_en: "Design & Craft",
    hero_title_highlight_ar: "الأخشاب",
    hero_title_highlight_en: "Wood",
    hero_title_end_ar: "بأعلى دقة",
    hero_title_end_en: "With Precision",
    hero_subtitle_ar:
      "نستخدم أحدث تقنيات CNC لتقديم منتجات خشبية استثنائية تجمع بين الدقة والجمال والمتانة",
    hero_subtitle_en:
      "Latest CNC technology for exceptional wood products",
    phone: "+9647700000000",
    whatsapp: "9647700000000",
    address_ar: "بغداد، العراق",
    address_en: "Baghdad, Iraq",
    maps_url: "",
  });

  await syncContactFloatingLinks({
    phone: "+9647700000000",
    whatsapp: "9647700000000",
    addressAr: "بغداد، العراق",
    addressEn: "Baghdad, Iraq",
    mapsUrl: "",
  });

  const demoProjects = [
    {
      slug: "luxury-wooden-ceiling",
      titleAr: "سقف خشبي فاخر",
      titleEn: "Luxury Wooden Ceiling",
      descriptionAr: "تصميم وتنفيذ سقف خشبي فاخر بتقنية CNC.",
      descriptionEn: "Luxury CNC wooden ceiling design.",
      featured: true,
      order: 1,
      categorySlug: "decorations",
      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    },
    {
      slug: "custom-kitchen-cabinets",
      titleAr: "مطبخ خشبي مخصص",
      titleEn: "Custom Kitchen",
      descriptionAr: "مطبخ خشبي كامل حسب الطلب.",
      descriptionEn: "Complete custom wood kitchen.",
      featured: true,
      order: 2,
      categorySlug: "furniture",
      image:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
    },
    {
      slug: "cnc-wall-art",
      titleAr: "فن جداري CNC",
      titleEn: "CNC Wall Art",
      descriptionAr: "لوحة فنية جدارية من الخشب المنحوت.",
      descriptionEn: "Carved wooden wall art panel.",
      featured: true,
      order: 3,
      categorySlug: "art",
      image:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    },
    {
      slug: "executive-office-desk",
      titleAr: "مكتب تنفيذي",
      titleEn: "Executive Desk",
      descriptionAr: "مكتب تنفيذي فاخر من الخشب الطبيعي.",
      descriptionEn: "Luxury executive wood desk.",
      featured: true,
      order: 4,
      categorySlug: "furniture",
      image:
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=80",
    },
  ];

  let projectsAdded = 0;
  for (const p of demoProjects) {
    const { categorySlug, image, ...data } = p;
    const existing = await prisma.project.findUnique({ where: { slug: p.slug } });
    if (existing) continue;

    const project = await prisma.project.create({
      data: {
        ...data,
        categoryId: categoryMap[categorySlug],
        images: {
          create: {
            url: image,
            isCover: true,
            order: 1,
            altAr: data.titleAr,
            altEn: data.titleEn,
          },
        },
      },
    });
    if (project) projectsAdded++;
  }

  const services = [
    {
      slug: "cnc-carving",
      titleAr: "نحت CNC",
      titleEn: "CNC Carving",
      descriptionAr: "خدمات نحت خشبي دقيقة بتقنية CNC.",
      descriptionEn: "Precision CNC wood carving.",
      order: 1,
    },
    {
      slug: "custom-furniture",
      titleAr: "أثاث مخصص",
      titleEn: "Custom Furniture",
      descriptionAr: "تصميم وتصنيع أثاث خشبي فاخر.",
      descriptionEn: "Luxury custom furniture.",
      order: 2,
    },
  ];

  let servicesAdded = 0;
  for (const s of services) {
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (existing) continue;
    await prisma.service.create({ data: s });
    servicesAdded++;
  }

  return {
    projectsAdded,
    servicesAdded,
    categories: categories.length,
  };
}
