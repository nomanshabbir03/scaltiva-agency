# Scaltiva website

Marketing site for Scaltiva (web development, automation, SEO and marketing).
One project: a React + Vite + Tailwind CSS front end, plus a serverless function in `api/` for the contact form (MongoDB).

## Run locally

```bash
npm install
cp .env.example .env     # then set MONGO_URI (local MongoDB or Atlas)
npm run dev              # site + API on http://localhost:5173
```

`npm run build` type-checks and builds to `dist/`.

## Deploy (Vercel)

1. Import the repository in Vercel. It detects Vite automatically; no build settings needed.
2. Add the environment variable `MONGO_URI` (use a MongoDB Atlas connection string).
3. Deploy. `vercel.json` makes every page route work on refresh, and `api/` is served as functions.

## Structure

```
api/                 Serverless functions (contact form) and shared DB code in api/_lib
public/              robots.txt, sitemap.xml, llms.txt, team photos (public/team)
src/
  pages/             Home, About, Work, How It Works, Contact, Service pages
  components/        Sections, navbar, footer, shared UI (components/ui)
  data/              Content: services, projects, team, FAQs
  lib/site.ts        Site name, domain and email used in SEO and schema
```

## Before launch

- Set the real domain in `src/lib/site.ts`, `public/sitemap.xml`, `public/robots.txt` and `public/llms.txt`.
- Replace placeholder content: testimonials (`src/components/Testimonials.tsx`), projects (`src/data/projects.ts`), team (`src/data/team.ts`), contact details and social links (`src/components/Footer.tsx`, `src/pages/Contact.tsx`).
- Add Privacy, Terms, Careers and FAQ pages (linked in the footer).
