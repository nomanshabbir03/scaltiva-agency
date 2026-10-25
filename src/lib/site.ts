// Single source of truth for site-wide SEO values. Set SITE_URL to the real
// production domain before launch: canonicals, sitemap and schema use it.
export const SITE = {
  name: "Scaltiva",
  url: "https://scaltiva.com",
  email: "hello@scaltiva.com",
  tagline: "Development, automation, SEO and marketing under one roof",
  ogImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=75",
};

export const absoluteUrl = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;
