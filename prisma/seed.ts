import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString =
  process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL is required for seeding");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@amcncwood.com" },
    update: {},
    create: {
      email: "admin@amcncwood.com",
      name: "Admin",
      password: passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  await prisma.admin.upsert({
    where: { email: "admin@amcncwood.com" },
    update: {},
    create: {
      email: "admin@amcncwood.com",
      name: "Admin",
      role: "SUPER_ADMIN",
    },
  });

  const categories = [
    {
      slug: "decorations",
      nameAr: "ديكورات",
      nameEn: "Decorations",
      order: 1,
    },
    { slug: "furniture", nameAr: "أثاث", nameEn: "Furniture", order: 2 },
    { slug: "art", nameAr: "فن", nameEn: "Art", order: 3 },
    { slug: "commercial", nameAr: "تجاري", nameEn: "Commercial", order: 4 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const services = [
    {
      slug: "cnc-carving",
      titleAr: "نحت CNC",
      titleEn: "CNC Carving",
      descriptionAr:
        "نقدم خدمات نحت خشبي دقيقة باستخدام أحدث تقنيات CNC. نحول أي تصميم إلى واقع ملموس بدقة تصل إلى أجزاء من المليمتر.",
      descriptionEn:
        "We offer precision wood carving services using the latest CNC technology with millimeter accuracy.",
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
      icon: "settings",
      order: 1,
    },
    {
      slug: "custom-furniture",
      titleAr: "أثاث مخصص",
      titleEn: "Custom Furniture",
      descriptionAr:
        "تصميم وتصنيع أثاث خشبي فاخر حسب الطلب. من غرف النوم والمطابخ إلى المكاتب وغرف المعيشة.",
      descriptionEn:
        "Design and manufacture luxury custom wood furniture for every space.",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      icon: "home",
      order: 2,
    },
    {
      slug: "wall-panels",
      titleAr: "ألواح جدارية",
      titleEn: "Wall Panels",
      descriptionAr:
        "ألواح جدارية خشبية بتصاميم فريدة تضيف لمسة فاخرة للفنادق والمطاعم والمنازل.",
      descriptionEn:
        "Unique wooden wall panels for hotels, restaurants, and luxury homes.",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
      icon: "layout",
      order: 3,
    },
    {
      slug: "decorative-elements",
      titleAr: "عناصر ديكور",
      titleEn: "Decorative Elements",
      descriptionAr:
        "قطع ديكورية خشبية فاخرة تشمل أعمدة وأقواس وشاشات وقطع فنية.",
      descriptionEn:
        "Luxury decorative wood pieces including columns, arches, screens, and art.",
      image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=80",
      icon: "sparkles",
      order: 4,
    },
    {
      slug: "commercial-projects",
      titleAr: "مشاريع تجارية",
      titleEn: "Commercial Projects",
      descriptionAr:
        "حلول متكاملة للمشاريع التجارية: فنادق، مطاعم، مكاتب، ومراكز تجارية.",
      descriptionEn:
        "Complete solutions for hotels, restaurants, offices, and commercial spaces.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      icon: "building",
      order: 5,
    },
    {
      slug: "3d-design",
      titleAr: "تصميم ثلاثي الأبعاد",
      titleEn: "3D Design",
      descriptionAr:
        "خدمة تصميم ثلاثي الأبعاد لمعاينة مشروعك قبل التنفيذ باستخدام أحدث البرامج.",
      descriptionEn:
        "3D design service to preview your project before execution.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
      icon: "box",
      order: 6,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  const categoryMap = Object.fromEntries(
    (
      await prisma.category.findMany({
        select: { id: true, slug: true },
      })
    ).map((c) => [c.slug, c.id])
  );

  const projects = [
    {
      slug: "luxury-wooden-ceiling",
      titleAr: "سقف خشبي فاخر",
      titleEn: "Luxury Wooden Ceiling",
      descriptionAr:
        "تصميم وتنفيذ سقف خشبي فاخر بتقنية CNC لقاعة استقبال فاخرة بتفاصيل ونقوش دقيقة.",
      descriptionEn:
        "Luxury CNC wooden ceiling for an upscale reception hall with intricate carved details.",
      client: "Private Villa",
      location: "Baghdad, Iraq",
      year: 2025,
      featured: true,
      order: 1,
      categorySlug: "decorations",
      images: [
        {
          url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
          altAr: "سقف خشبي",
          altEn: "Wooden ceiling",
          isCover: true,
          order: 1,
        },
        {
          url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
          altAr: "تفاصيل النحت",
          altEn: "Carving details",
          isCover: false,
          order: 2,
        },
      ],
    },
    {
      slug: "custom-kitchen-cabinets",
      titleAr: "مطبخ خشبي مخصص",
      titleEn: "Custom Kitchen Cabinets",
      descriptionAr:
        "مطبخ خشبي كامل مصمم ومُنفّذ حسب الطلب بتقنية CNC بمواد خام فاخرة.",
      descriptionEn:
        "Complete custom CNC kitchen combining function and beauty with premium materials.",
      client: "Residential Client",
      location: "Basra, Iraq",
      year: 2024,
      featured: true,
      order: 2,
      categorySlug: "furniture",
      images: [
        {
          url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
          altAr: "مطبخ",
          altEn: "Kitchen",
          isCover: true,
          order: 1,
        },
      ],
    },
    {
      slug: "cnc-wall-art",
      titleAr: "فن جداري CNC",
      titleEn: "CNC Wall Art",
      descriptionAr: "لوحة فنية جدارية من الخشب المنحوت بتصميم هندسي معاصر.",
      descriptionEn: "CNC-carved wooden wall art with contemporary geometric design.",
      client: "Art Gallery",
      location: "Erbil, Iraq",
      year: 2025,
      featured: true,
      order: 3,
      categorySlug: "art",
      images: [
        {
          url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
          altAr: "فن جداري",
          altEn: "Wall art",
          isCover: true,
          order: 1,
        },
      ],
    },
    {
      slug: "executive-office-desk",
      titleAr: "مكتب تنفيذي",
      titleEn: "Executive Office Desk",
      descriptionAr: "مكتب تنفيذي فاخر من الخشب الطبيعي مع تفاصيل CNC دقيقة.",
      descriptionEn: "Luxury executive desk with precise CNC details.",
      client: "Corporate Client",
      location: "Baghdad, Iraq",
      year: 2024,
      featured: true,
      order: 4,
      categorySlug: "furniture",
      images: [
        {
          url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=80",
          altAr: "مكتب",
          altEn: "Desk",
          isCover: true,
          order: 1,
        },
      ],
    },
    {
      slug: "hotel-lobby-panels",
      titleAr: "ألواح لوبي فندق",
      titleEn: "Hotel Lobby Panels",
      descriptionAr: "ألواح جدارية خشبية فاخرة للوبي فندق بتصميم CNC مميز.",
      descriptionEn: "Luxury CNC wall panels for a hotel lobby.",
      client: "Hotel Group",
      location: "Najaf, Iraq",
      year: 2025,
      featured: false,
      order: 5,
      categorySlug: "commercial",
      images: [
        {
          url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
          altAr: "لوبي فندق",
          altEn: "Hotel lobby",
          isCover: true,
          order: 1,
        },
      ],
    },
    {
      slug: "restaurant-interior",
      titleAr: "ديكور مطعم",
      titleEn: "Restaurant Interior",
      descriptionAr: "تصميم وتنفيذ ديكور خشبي متكامل لمطعم فاخر.",
      descriptionEn: "Complete luxury wood interior design for a restaurant.",
      client: "Restaurant Owner",
      location: "Karbala, Iraq",
      year: 2024,
      featured: false,
      order: 6,
      categorySlug: "commercial",
      images: [
        {
          url: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80",
          altAr: "ديكور مطعم",
          altEn: "Restaurant interior",
          isCover: true,
          order: 1,
        },
      ],
    },
  ];

  for (const project of projects) {
    const { categorySlug, images, ...data } = project;
    const categoryId = categoryMap[categorySlug];

    const saved = await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        ...data,
        categoryId,
      },
      create: {
        ...data,
        categoryId,
      },
    });

    const imageCount = await prisma.image.count({
      where: { projectId: saved.id },
    });

    if (imageCount === 0) {
      await prisma.image.createMany({
        data: images.map((img) => ({ ...img, projectId: saved.id })),
      });
    }
  }

  const faqs = [
    {
      questionAr: "ما هي مدة تنفيذ المشروع؟",
      questionEn: "How long does a project take?",
      answerAr: "تختلف المدة حسب حجم وتعقيد المشروع، وعادة بين أسبوع إلى 4 أسابيع.",
      answerEn: "Duration varies by size and complexity, typically 1–4 weeks.",
      order: 1,
    },
    {
      questionAr: "هل تقدمون خدمة التوصيل؟",
      questionEn: "Do you offer delivery?",
      answerAr: "نعم، نوصل إلى جميع محافظات العراق.",
      answerEn: "Yes, we deliver across all Iraqi governorates.",
      order: 2,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({
      where: { questionAr: faq.questionAr },
    });
    if (!existing) {
      await prisma.fAQ.create({ data: faq });
    }
  }

  const settings = [
    { key: "phone", value: "+9647700000000", type: "text" },
    { key: "whatsapp", value: "9647700000000", type: "text" },
    { key: "email", value: "info@amcncwood.com", type: "text" },
    { key: "address_ar", valueAr: "بغداد، العراق", type: "text" },
    { key: "address_en", valueEn: "Baghdad, Iraq", type: "text" },
    { key: "maps_url", value: "", type: "text" },
    { key: "hero_eyebrow_ar", valueAr: "دقة عالية • جودة مميزة • تصميم إبداعي", type: "text" },
    { key: "hero_title_ar", valueAr: "تصميم وتنفيذ", type: "text" },
    { key: "hero_title_highlight_ar", valueAr: "الأخشاب", type: "text" },
    { key: "hero_title_end_ar", valueAr: "بأعلى دقة", type: "text" },
    { key: "hero_subtitle_ar", valueAr: "نستخدم أحدث تقنيات CNC لتقديم منتجات خشبية استثنائية", type: "text" },
    { key: "hero_eyebrow_en", valueEn: "High Precision • Premium Quality", type: "text" },
    { key: "hero_title_en", valueEn: "Design & Craft", type: "text" },
    { key: "hero_title_highlight_en", valueEn: "Wood", type: "text" },
    { key: "hero_title_end_en", valueEn: "With Precision", type: "text" },
    { key: "hero_subtitle_en", valueEn: "Latest CNC technology for exceptional wood products", type: "text" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  await prisma.sEO.upsert({
    where: { page: "home" },
    update: {},
    create: {
      page: "home",
      titleAr: "AM CNC WOOD DESIGN | تصميم ونحت الخشب",
      titleEn: "AM CNC WOOD DESIGN | CNC Wood Design",
      descriptionAr: "شركة متخصصة في تصميم ونحت الخشب بتقنية CNC",
      descriptionEn: "Specialized in CNC wood design and carving",
    },
  });

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "966500000000";
  const existingFloating = await prisma.floatingLink.count();
  if (existingFloating === 0) {
    await prisma.floatingLink.createMany({
      data: [
        {
          labelAr: "واتساب",
          labelEn: "WhatsApp",
          url: `https://wa.me/${phone}?text=${encodeURIComponent("Hello AM CNC WOOD DESIGN")}`,
          icon: "whatsapp",
          color: "whatsapp",
          order: 1,
          active: true,
          openInNewTab: true,
        },
        {
          labelAr: "اتصل بنا",
          labelEn: "Call Us",
          url: `tel:+${phone}`,
          icon: "phone",
          color: "gold",
          order: 2,
          active: true,
          openInNewTab: false,
        },
        {
          labelAr: "نموذج التواصل",
          labelEn: "Contact Form",
          url: "/contact",
          icon: "mail",
          color: "green",
          order: 3,
          active: true,
          openInNewTab: false,
        },
      ],
    });
  }

  console.log("Seed completed!");
  console.log("Admin: admin@amcncwood.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
