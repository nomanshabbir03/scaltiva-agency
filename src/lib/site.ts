// Single source of truth for site-wide SEO values. Set SITE_URL to the real
// production domain before launch: canonicals, sitemap and schema use it.
export const SITE = {
  name: "Scaltiva",
  url: "https://scaltiva.com",
  email: "info.scaltiva@gmail.com",
  /** Phone and WhatsApp number in international format, digits only. */
  whatsapp: "923263450701",
  whatsappDisplay: "+92 326 3450701",
  /** Footer icons. A blank link hides that icon until the page exists. */
  socials: {
    facebook: "https://www.facebook.com/scaltiva/",
    instagram: "https://www.instagram.com/scaltiva.official",
    linkedin: "https://www.linkedin.com/company/145374599",
  },
  tagline: "Development, automation, SEO and marketing under one roof",
  ogImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=75",
};

export const absoluteUrl = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;
