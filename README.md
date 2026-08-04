# AM CNC WOOD DESIGN

Luxury, minimal, bilingual website for AM CNC WOOD DESIGN — CNC wood design and carving company.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript (Strict)
- **Tailwind CSS 4** + shadcn/ui components
- **Framer Motion** — subtle animations
- **Supabase** + **Prisma ORM** + PostgreSQL
- **next-intl** — Arabic (RTL) / English (LTR)
- **React Hook Form** + **Zod** validation
- **Lucide React** icons

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `JWT_SECRET` — Secret for admin JWT tokens

### 3. Set up database

```bash
npm run db:push
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000/ar](http://localhost:3000/ar) (Arabic) or [http://localhost:3000/en](http://localhost:3000/en) (English).

## Pages

| Page | Route |
|------|-------|
| Home | `/[locale]` |
| Portfolio | `/[locale]/portfolio` |
| Project Detail | `/[locale]/portfolio/[slug]` |
| Services | `/[locale]/services` |
| About | `/[locale]/about` |
| Contact | `/[locale]/contact` |
| Admin Dashboard | `/admin` |
| Admin Login | `/admin/login` |

## Admin Access

Default credentials (after seeding):
- **Email:** admin@amcncwood.com
- **Password:** admin123

## Features

- Dark / Light mode with gold accent (#C89B3C)
- Full Arabic RTL / English LTR support
- Image similarity search (dHash algorithm, no external API)
- SEO: metadata, Open Graph, JSON-LD, sitemap, robots.txt
- Contact form with validation
- Lightbox gallery on project pages
- WhatsApp floating button
- Back to top button
- Responsive design for all devices
- Admin panel with RBAC

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed initial data
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Public pages (i18n)
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Footer, etc.
│   ├── home/              # Home page sections
│   ├── portfolio/         # Portfolio components
│   └── contact/           # Contact form
├── lib/                   # Utilities, Prisma, Auth
├── i18n/                  # Internationalization config
└── messages/              # Translation files (ar.json, en.json)
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed script
```

## License

Private — AM CNC WOOD DESIGN
