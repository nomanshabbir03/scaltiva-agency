// Knowledge base for the Scaltive chatbot. No AI is involved: the bot scores a
// visitor's message against each entry's keywords and replies with the best
// match. To teach it something new, add an entry here.
//
// - keywords: single words match as whole words (typos tolerated for longer
//   words); phrases with spaces must appear in the message and score higher.
//   Include Roman Urdu spellings too (kitna, qeemat, banani, ...).
// - roman: optional Roman Urdu reply, used when the visitor wrote in Roman Urdu.
// - whatsapp: true adds a "Chat on WhatsApp" button (a string customises the
//   pre-filled message).
// - followUps: ids of entries offered as quick-reply buttons afterwards.
//
// Entries are checked in order, so keep specific ones above general ones.

import { SITE } from "@/lib/site";

export type Entry = {
  id: string;
  /** Text of the quick-reply button for this entry. */
  label: string;
  keywords: string[];
  answer: string;
  roman?: string;
  links?: { label: string; to: string }[];
  whatsapp?: boolean | string;
  followUps?: string[];
};

export const START_CHIPS = ["services", "pricing", "process", "timeline", "contact"];

export const GREETING =
  "Hi, I'm Scaltive, the Scaltiva assistant. Ask me about our services, pricing, process or how to get started, or pick an option below.";
export const GREETING_ROMAN =
  "Salam! Main Scaltive hoon, Scaltiva ka assistant. Aap humari services, pricing, process ya shuru karne ke bare mein pooch sakte hain. Neechay se option chunein ya apna sawal likhein.";

export const FALLBACK =
  "I'm not sure I can answer that one. Please talk to our team directly on WhatsApp and they will help you.";
export const FALLBACK_ROMAN =
  "Mujhe is sawal ka jawab nahi pata. Behtar hoga ke aap hamari team se seedha WhatsApp par baat karein, wo aap ki poori madad karenge.";

export const KB: Entry[] = [
  // ---- Pricing, payment, timing ----
  {
    id: "pricing",
    label: "Pricing",
    keywords: ["price", "prices", "pricing", "cost", "costs", "charges", "charge", "fees", "fee", "quote", "estimate", "rate", "rates", "budget", "package", "packages", "affordable", "cheap", "how much", "kitna", "kitne", "kitni", "qeemat", "kharcha", "kharcha", "paisay", "paise", "rupay", "kitne paise"],
    answer:
      "Our pricing depends on the scope, features and channels involved, so every project gets a custom, itemised quote before any work starts. Tell us about your project and we'll send a clear price.",
    roman:
      "Humari pricing project ke scope aur features par depend karti hai, is liye har project ka kaam shuru hone se pehle ek alag, tafseeli quote diya jata hai. Aap apne project ke bare mein batayein, hum clear price bhej denge.",
    links: [{ label: "Get a free quote", to: "/contact" }],
    whatsapp: "Hi Scaltiva, I'd like a quote for my project.",
    followUps: ["free-consultation", "timeline", "payment"],
  },
  {
    id: "payment",
    label: "Payment terms",
    keywords: ["payment", "payments", "pay", "paying", "invoice", "advance", "deposit", "installment", "installments", "instalment", "bank transfer", "payment method", "payment terms", "milestone payments", "paisay kese", "payment kese"],
    answer:
      "Payment terms are agreed up front in your proposal, so there are no surprises. For details on methods and schedules, please ask our team on WhatsApp.",
    roman:
      "Payment ki shartein proposal mein pehle hi tay ho jati hain, is liye baad mein koi surprise nahi hota. Methods aur schedule ki tafseel ke liye hamari team se WhatsApp par baat karein.",
    whatsapp: "Hi Scaltiva, I have a question about payment terms.",
  },
  {
    id: "timeline",
    label: "How long does it take?",
    keywords: ["timeline", "how long", "deadline", "delivery", "turnaround", "duration", "how fast", "how quickly", "when ready", "kitna time", "kitni der", "kitne din", "kab tak", "time lagega", "time lagta"],
    answer:
      "It depends on scope. A focused business website often takes a few weeks, while a custom web app or online store can take a few months. You get a realistic timeline in your plan before work begins.",
    roman:
      "Ye scope par depend karta hai. Ek simple business website aam taur par kuch hafton mein ban jati hai, jab ke custom web app ya online store mein kuch mahine lag sakte hain. Kaam shuru hone se pehle aap ko realistic timeline mil jati hai.",
    whatsapp: "Hi Scaltiva, I'd like to know the timeline for my project.",
    followUps: ["process", "pricing", "free-consultation"],
  },
  {
    id: "free-consultation",
    label: "Free consultation",
    keywords: ["free", "consultation", "consult", "get started", "start", "begin", "kick off", "free call", "book a call", "meeting", "shuru", "shuru karna", "free consultation", "free quote"],
    answer:
      "Yes, the first consultation is free with no obligation. Send us a message about your project, we'll book a call, then send a clear proposal and quote.",
    roman:
      "Ji haan, pehli consultation bilkul free hai aur is ki koi pabandi nahi. Apne project ke bare mein message bhejein, hum call tay karenge aur phir clear proposal aur quote bhejenge.",
    links: [{ label: "Contact us", to: "/contact" }],
    whatsapp: "Hi Scaltiva, I'd like a free consultation.",
    followUps: ["process", "pricing"],
  },
  {
    id: "process",
    label: "How it works",
    keywords: ["process", "how it works", "how do you work", "steps", "procedure", "workflow of work", "approach", "kaise kaam", "kaam kaise", "tareeqa", "kaise karte"],
    answer:
      "It's simple: 1) a free discovery call, 2) a written proposal and quote, 3) design and strategy, 4) build and test with regular updates, 5) launch, 6) ongoing support and improvements.",
    roman:
      "Process asaan hai: 1) free discovery call, 2) likhi hui proposal aur quote, 3) design aur strategy, 4) build aur testing (regular updates ke saath), 5) launch, 6) launch ke baad support aur improvements.",
    links: [{ label: "See the full process", to: "/how-it-works" }],
    followUps: ["timeline", "free-consultation"],
  },
  {
    id: "revisions",
    label: "Changes & revisions",
    keywords: ["revision", "revisions", "changes", "change", "edit", "edits", "modify", "feedback", "tweak", "update my site", "badalna", "tabdeeli"],
    answer:
      "Small changes during a project are normal and we're happy to make them. If a change affects scope, timeline or cost, we tell you first so you can decide.",
    whatsapp: "Hi Scaltiva, I have a question about changes during a project.",
  },
  {
    id: "combine",
    label: "Combine services",
    keywords: ["combine", "bundle", "all services", "all in one", "together", "multiple services", "more than one", "ek saath", "sab services"],
    answer:
      "Yes, many clients combine services, such as a new website with SEO, or automation with marketing. One team means consistent results and no hand-offs between agencies.",
    links: [{ label: "View services", to: "/#services" }],
  },
  {
    id: "choose",
    label: "Help me choose",
    keywords: ["not sure", "which service", "recommend", "suggest", "suggestion", "confused", "what do i need", "help me choose", "best for me", "kaunsi service", "samajh nahi", "konsi service", "mashwara"],
    answer:
      "Quick guide: need a new or better website, go for Development. Want to save time on repetitive work, choose Automation. Want more organic visitors, pick SEO. Want leads quickly, try Marketing. Tell us your goal and we'll recommend the right mix.",
    roman:
      "Mukhtasar guide: nayi ya behtar website chahiye to Development, repetitive kaam ka waqt bachana hai to Automation, organic visitors barhane hain to SEO, jaldi leads chahiye to Marketing. Apna goal batayein, hum sahi combination suggest karenge.",
    links: [{ label: "Talk to us", to: "/contact" }],
    followUps: ["services", "free-consultation"],
  },

  // ---- Development ----
  {
    id: "ecommerce",
    label: "Online stores",
    keywords: ["ecommerce", "e-commerce", "online store", "online shop", "shop", "store", "sell online", "selling online", "cart", "checkout", "products online", "online dukaan"],
    answer:
      "Yes, we build online stores with product management, secure checkout and payment integrations, designed to load fast and convert visitors into buyers.",
    links: [{ label: "Development service", to: "/services/development" }],
    followUps: ["pricing", "timeline"],
  },
  {
    id: "web-app",
    label: "Web apps",
    keywords: ["web app", "web application", "dashboard", "portal", "saas", "custom software", "admin panel", "crm software", "internal tool", "management system", "software banana"],
    answer:
      "We build custom web applications such as dashboards, customer portals and internal tools on the MERN stack (MongoDB, Express, React, Node.js).",
    links: [{ label: "Development service", to: "/services/development" }],
    followUps: ["pricing", "timeline"],
  },
  {
    id: "mobile-app",
    label: "Mobile apps",
    keywords: ["mobile app", "android", "ios", "iphone", "flutter", "react native", "play store", "app store", "app development", "mobile application"],
    answer:
      "Our focus is websites and web applications that work great on phones and desktops. For native mobile apps, please ask our team on WhatsApp and they'll tell you what's possible.",
    roman:
      "Humara focus websites aur web applications par hai jo phone aur desktop dono par acha chalti hain. Native mobile apps ke liye hamari team se WhatsApp par poochh lein.",
    whatsapp: "Hi Scaltiva, I'd like to ask about a mobile app.",
  },
  {
    id: "other-platforms",
    label: "WordPress / Shopify",
    keywords: ["wordpress", "shopify", "wix", "woocommerce", "magento", "squarespace", "webflow", "elementor", "cms", "template"],
    answer:
      "We specialise in custom builds with React, Node.js and MongoDB. If you need a specific platform such as WordPress or Shopify, please ask our team on WhatsApp.",
    roman:
      "Hum React, Node.js aur MongoDB ke saath custom builds mein maharat rakhte hain. Agar aap ko WordPress ya Shopify jaisa koi khaas platform chahiye to hamari team se WhatsApp par poochh lein.",
    whatsapp: "Hi Scaltiva, I'd like to ask about a specific platform for my website.",
  },
  {
    id: "redesign",
    label: "Redesign my site",
    keywords: ["redesign", "revamp", "rebuild", "existing website", "old website", "improve my website", "fix my website", "refresh", "new look", "purani website"],
    answer:
      "Yes. We can audit your current site, fix speed or usability problems, or rebuild it entirely while keeping the search rankings you've already earned.",
    links: [{ label: "Development service", to: "/services/development" }],
  },
  {
    id: "tech-stack",
    label: "Technologies used",
    keywords: ["tech", "technology", "technologies", "tech stack", "stack", "react", "node", "nodejs", "mongodb", "mern", "tailwind", "javascript", "typescript", "framework", "language used"],
    answer:
      "We build with the MERN stack: MongoDB, Express, React and Node.js, styled with Tailwind CSS. We choose the right tools for each project rather than forcing one approach.",
    links: [{ label: "Development service", to: "/services/development" }],
  },
  {
    id: "responsive",
    label: "Mobile friendly",
    keywords: ["responsive", "mobile friendly", "mobile-friendly", "phone", "tablet", "all devices", "mobile view", "mobile par"],
    answer:
      "Every site we build is mobile-first, designed for phones first and then scaled up to tablets and desktops, and tested on real devices.",
  },
  {
    id: "speed",
    label: "Website speed",
    keywords: ["speed", "fast", "faster", "slow", "performance", "loading", "load time", "core web vitals", "pagespeed", "lighthouse", "sust", "tez"],
    answer:
      "Speed is built in: lightweight code, optimised images and modern tooling help pages load quickly, which supports both conversions and search rankings.",
  },
  {
    id: "security",
    label: "Security",
    keywords: ["secure", "security", "ssl", "https", "hack", "hacked", "safe", "safety", "vulnerability", "mehfooz"],
    answer:
      "We follow secure coding practices, use secure connections and keep access limited to what's needed. Maintenance plans also cover updates and security patches.",
  },
  {
    id: "hosting",
    label: "Hosting & domain",
    keywords: ["hosting", "host", "domain", "server", "deploy", "deployment", "vercel", "dns", "go live", "domain name"],
    answer:
      "We take care of launching your site and can advise on hosting and domains. For specifics on your setup, please ask our team on WhatsApp.",
    whatsapp: "Hi Scaltiva, I have a question about hosting and domains.",
  },
  {
    id: "maintenance",
    label: "Support after launch",
    keywords: ["maintenance", "support after launch", "after launch", "post launch", "bug", "bugs", "fixes", "ongoing support", "updates", "maintain", "support plan", "launch ke baad"],
    answer:
      "Yes, we offer maintenance and growth plans covering updates, security, monitoring, backups and ongoing improvements after launch.",
    roman:
      "Ji haan, hum maintenance aur growth plans dete hain jin mein updates, security, monitoring, backups aur launch ke baad ki improvements shamil hain.",
  },
  {
    id: "ownership",
    label: "Do I own the code?",
    keywords: ["ownership", "own the code", "source code", "my code", "lock in", "lock-in", "own my website", "rights", "copyright"],
    answer:
      "Yes. You keep the source code and your data, with no lock-in to a proprietary platform.",
  },
  {
    id: "branding",
    label: "Design & branding",
    keywords: ["logo", "branding", "brand", "graphic", "graphics", "design", "designer", "ui", "ux", "figma", "creative"],
    answer:
      "Web design is part of our development work. For separate branding or logo projects, please ask our team on WhatsApp to see what's possible.",
    whatsapp: "Hi Scaltiva, I'd like to ask about design and branding.",
  },
  {
    id: "development",
    label: "Web development",
    keywords: ["development", "developer", "developers", "website", "websites", "web development", "web design", "build a website", "make a website", "landing page", "business website", "website banani", "website banwani", "website chahiye", "website banana"],
    answer:
      "We design and build custom websites, web apps and online stores that load fast, work on every device and are structured to rank in search.",
    roman:
      "Hum custom websites, web apps aur online stores design aur develop karte hain jo tez chalte hain, har device par theek dikhte hain aur search mein rank karne ke liye structured hote hain.",
    links: [{ label: "Development service", to: "/services/development" }],
    followUps: ["pricing", "timeline", "tech-stack"],
  },

  // ---- Automation ----
  {
    id: "automation-examples",
    label: "What can be automated?",
    keywords: ["what can be automated", "examples", "tasks", "repetitive", "manual work", "data entry", "invoicing", "reports", "reminders", "onboarding", "save time"],
    answer:
      "Typical examples: capturing and routing leads, sending follow-ups, syncing data between tools, invoicing, reports, notifications, onboarding steps and appointment reminders.",
    links: [{ label: "Automation service", to: "/services/automation" }],
  },
  {
    id: "integrations",
    label: "CRM & integrations",
    keywords: ["crm", "integration", "integrations", "integrate", "api", "connect tools", "sync", "google sheets", "zapier", "hubspot", "zoho", "salesforce", "airtable", "slack", "webhook"],
    answer:
      "We connect the tools you already use, such as your CRM, email platform, forms and spreadsheets, and build custom API integrations when off-the-shelf connectors don't fit.",
    links: [{ label: "Automation service", to: "/services/automation" }],
  },
  {
    id: "ai-assistants",
    label: "AI assistants & chatbots",
    keywords: ["ai", "chatbot", "chat bot", "assistant", "ai assistant", "artificial intelligence", "bot", "whatsapp bot", "gpt", "machine learning"],
    answer:
      "Yes, we build AI assistants and chatbots that answer common questions and hand over to your team when needed, as part of our automation service.",
    links: [{ label: "Automation service", to: "/services/automation" }],
    whatsapp: "Hi Scaltiva, I'm interested in an AI assistant or chatbot.",
  },
  {
    id: "lead-capture",
    label: "Lead capture",
    keywords: ["lead", "leads", "lead capture", "follow up", "follow-up", "followup", "lead generation", "enquiries", "inquiries"],
    answer:
      "We can capture new leads instantly, route them to the right person and send timely follow-up messages automatically, so no enquiry goes cold.",
    links: [{ label: "Automation service", to: "/services/automation" }],
  },
  {
    id: "automation",
    label: "Automation",
    keywords: ["automation", "automate", "automated", "automatic", "workflow", "workflows", "business process", "auto"],
    answer:
      "We automate repetitive tasks like lead capture, follow-ups, invoicing, reporting and data entry by connecting your tools and building custom workflows, giving you fewer errors and more time.",
    roman:
      "Hum repetitive kaam jaise lead capture, follow-ups, invoicing, reporting aur data entry ko aap ke tools jor kar aur custom workflows bana kar automate karte hain. Is se ghaltiyan kam aur waqt zyada bachta hai.",
    links: [{ label: "Automation service", to: "/services/automation" }],
    followUps: ["automation-examples", "integrations", "pricing"],
  },

  // ---- SEO ----
  {
    id: "seo-timeline",
    label: "How long does SEO take?",
    keywords: ["how long seo", "seo results", "seo timeline", "rank time", "when will i see", "seo take", "seo kitna time", "results kab", "ranking kab", "how long does seo"],
    answer:
      "SEO is a long-term investment. Many businesses see movement within a few months, with stronger results building over six to twelve months, depending on competition and your starting point.",
    roman:
      "SEO ek long-term investment hai. Aksar businesses ko kuch mahino mein farq nazar aane lagta hai, aur mazboot results competition aur starting point ke hisaab se 6 se 12 mahino mein banate hain.",
    links: [{ label: "SEO service", to: "/services/seo" }],
  },
  {
    id: "seo-guarantee",
    label: "Guaranteed ranking?",
    keywords: ["guarantee", "guaranteed", "number one", "#1", "first page", "top ranking", "rank first", "promise", "page one", "top of google"],
    answer:
      "No one outside the search engine can ethically guarantee a specific ranking. What we promise is transparent, best-practice work and clear reporting on your progress.",
    roman:
      "Search engine ke bahar koi bhi insaan imaandari se kisi khaas ranking ki guarantee nahi de sakta. Hum shaffaf, best-practice kaam aur progress ki saaf reporting ka wada karte hain.",
    links: [{ label: "SEO service", to: "/services/seo" }],
  },
  {
    id: "local-seo",
    label: "Local SEO",
    keywords: ["local seo", "local", "google business", "google business profile", "maps", "near me", "google maps", "listing", "citations", "nearby"],
    answer:
      "Yes, we optimise your Google Business Profile, local listings and location pages so you appear when nearby customers search.",
    links: [{ label: "SEO service", to: "/services/seo" }],
  },
  {
    id: "ai-search",
    label: "AI search (GEO/AEO)",
    keywords: ["geo", "aeo", "generative engine", "answer engine", "chatgpt", "perplexity", "ai search", "ai overviews", "llm", "ai visibility", "gemini", "ai answers"],
    answer:
      "We optimise your content so AI assistants like ChatGPT, Perplexity and Google AI Overviews can find, understand and cite it: answer-first writing, clear structure and structured data.",
    links: [{ label: "SEO service", to: "/services/seo" }],
  },
  {
    id: "seo-audit",
    label: "SEO audit",
    keywords: ["audit", "technical seo", "crawl", "crawling", "indexing", "indexed", "site audit", "seo audit", "backlinks", "schema", "structured data"],
    answer:
      "We start with a technical audit covering crawlability, indexing, site speed, Core Web Vitals, mobile usability and site structure, then fix issues in priority order.",
    links: [{ label: "SEO service", to: "/services/seo" }],
  },
  {
    id: "content",
    label: "Content writing",
    keywords: ["content", "blog", "blogs", "article", "articles", "writing", "copywriting", "copy", "content marketing", "write for me"],
    answer:
      "We plan and write helpful, accurate content that answers real customer questions and supports both SEO and marketing goals.",
    links: [{ label: "SEO service", to: "/services/seo" }],
  },
  {
    id: "seo",
    label: "SEO",
    keywords: ["seo", "search engine", "google ranking", "ranking", "rankings", "organic", "organic traffic", "rank on google", "keywords", "search engine optimization", "traffic", "google par"],
    answer:
      "We help you get found on Google and in AI answers through technical SEO, content, local SEO and structured data, so your site ranks for the searches your customers make.",
    roman:
      "Hum technical SEO, content, local SEO aur structured data ke zariye aap ko Google aur AI answers mein dhoondne layak banate hain, taake aap ki site wo searches par rank kare jo aap ke customers karte hain.",
    links: [{ label: "SEO service", to: "/services/seo" }],
    followUps: ["seo-timeline", "seo-guarantee", "ai-search"],
  },

  // ---- Marketing ----
  {
    id: "paid-ads",
    label: "Paid ads",
    keywords: ["ads", "ad", "ppc", "google ads", "facebook ads", "meta ads", "instagram ads", "linkedin ads", "paid", "advertising", "advertisement", "sponsored", "ad spend", "ads chalana"],
    answer:
      "We manage Google, Meta and LinkedIn campaigns for qualified leads at a sustainable cost. Ad spend is paid directly to the platforms so you always see where your money goes.",
    links: [{ label: "Marketing service", to: "/services/marketing" }],
  },
  {
    id: "social-media",
    label: "Social media",
    keywords: ["social media", "instagram", "facebook", "tiktok", "linkedin", "twitter", "posting", "posts", "community", "social"],
    answer:
      "We handle social media planning, publishing and community management that fits your brand and supports your marketing goals.",
    links: [{ label: "Marketing service", to: "/services/marketing" }],
  },
  {
    id: "email-marketing",
    label: "Email marketing",
    keywords: ["email marketing", "newsletter", "newsletters", "email campaign", "email campaigns", "mailing list", "drip", "mailchimp"],
    answer:
      "We create newsletters, nurture sequences and automated email campaigns that keep customers engaged and bring them back.",
    links: [{ label: "Marketing service", to: "/services/marketing" }],
  },
  {
    id: "reporting",
    label: "Reports & tracking",
    keywords: ["report", "reports", "reporting", "analytics", "tracking", "measure", "kpi", "google analytics", "results report", "roi", "performance report"],
    answer:
      "You get regular, plain-language reports covering traffic, leads, conversions and cost per lead, along with recommendations for the next steps.",
  },
  {
    id: "conversion",
    label: "More conversions",
    keywords: ["conversion", "conversions", "cro", "convert", "conversion rate", "more sales", "increase sales", "more customers", "sales barhana"],
    answer:
      "We improve conversion rates with tracking, landing page testing and clearer calls to action, so more of your visitors become leads and customers.",
    links: [{ label: "Marketing service", to: "/services/marketing" }],
  },
  {
    id: "marketing",
    label: "Marketing",
    keywords: ["marketing", "digital marketing", "promotion", "promote", "campaign", "campaigns", "brand awareness", "grow my business", "business grow", "advertise", "marketing karwani"],
    answer:
      "We plan and run digital marketing that turns attention into leads and customers: strategy, paid ads, social media, email and content, all tracked so you can see what works.",
    roman:
      "Hum digital marketing plan karte aur chalate hain jo attention ko leads aur customers mein badalti hai: strategy, paid ads, social media, email aur content, sab kuch track hota hai taake aap dekh sakein kya kaam kar raha hai.",
    links: [{ label: "Marketing service", to: "/services/marketing" }],
    followUps: ["paid-ads", "social-media", "pricing"],
  },

  // ---- Company ----
  {
    id: "services",
    label: "Services",
    keywords: ["services", "service", "what do you offer", "what do you do", "offer", "offerings", "what can you do", "capabilities", "solutions", "kya services", "kya karte", "kaun si services", "services kya"],
    answer:
      "We offer four services under one roof: Web Development, Business Automation, SEO and Digital Marketing. Which one would you like to know more about?",
    roman:
      "Hum aik hi chhat ke neechay chaar services dete hain: Web Development, Business Automation, SEO aur Digital Marketing. Aap kis ke bare mein jaanna chahenge?",
    links: [
      { label: "Development", to: "/services/development" },
      { label: "Automation", to: "/services/automation" },
      { label: "SEO", to: "/services/seo" },
      { label: "Marketing", to: "/services/marketing" },
    ],
    followUps: ["development", "automation", "seo", "marketing"],
  },
  {
    id: "work",
    label: "Our work",
    keywords: ["portfolio", "work", "projects", "case studies", "case study", "previous work", "past work", "samples", "examples of work", "show me", "pichla kaam"],
    answer:
      "You can browse selected projects and results on our Work page.",
    links: [{ label: "View our work", to: "/work" }],
  },
  {
    id: "about",
    label: "About Scaltiva",
    keywords: ["about", "about us", "about scaltiva", "company", "who are you", "tell me about", "agency", "apke bare", "company ke bare"],
    answer:
      "Scaltiva is a digital agency that brings web development, business automation, SEO and marketing together under one roof, so your business grows online without juggling multiple agencies.",
    roman:
      "Scaltiva ek digital agency hai jo web development, business automation, SEO aur marketing ko aik jagah jama karti hai, taake aap ka business online barhay aur aap ko kai agencies ke peechay na bhagna paray.",
    links: [{ label: "About us", to: "/about" }],
  },
  {
    id: "team",
    label: "Our team",
    keywords: ["team", "staff", "who works", "experts", "founder", "ceo", "people behind", "employees"],
    answer: "You can meet the people behind Scaltiva on our About page.",
    links: [{ label: "Meet the team", to: "/about#team" }],
  },
  {
    id: "values",
    label: "Mission & values",
    keywords: ["mission", "vision", "values", "principles", "philosophy"],
    answer:
      "Our mission is to help businesses grow online with practical, well-built and measurable digital solutions, explained in plain language. Our values are clarity, quality, partnership, results and curiosity.",
    links: [{ label: "About us", to: "/about" }],
  },
  {
    id: "remote",
    label: "Working remotely",
    keywords: ["international", "abroad", "overseas", "worldwide", "remote", "remotely", "outside pakistan", "usa", "uk", "canada", "dubai", "uae", "saudi", "australia", "europe", "countries", "bahar"],
    answer:
      "Yes, we work with clients remotely using video calls, email and shared project updates, so location is rarely an issue.",
    roman:
      "Ji haan, hum clients ke saath remotely kaam karte hain (video calls, email aur shared project updates ke zariye), is liye location aam taur par masla nahi hoti.",
  },
  {
    id: "location",
    label: "Office & location",
    keywords: ["location", "address", "office", "where are you", "based", "visit", "kahan", "kidhar", "city"],
    answer:
      "We mainly work remotely. For office or meeting details, please ask our team on WhatsApp.",
    roman:
      "Hum zyada tar remotely kaam karte hain. Office ya meeting ki tafseel ke liye hamari team se WhatsApp par poochh lein.",
    whatsapp: "Hi Scaltiva, I'd like to ask about your office or meeting options.",
  },
  {
    id: "hours",
    label: "Working hours",
    keywords: ["hours", "working hours", "timing", "timings", "open", "available", "availability", "time zone", "timezone", "office time", "kab available"],
    answer:
      "We aim to reply to messages within one business day. For quick questions, WhatsApp is the fastest way to reach us.",
    roman:
      "Hum messages ka jawab aam taur par aik business din ke andar dene ki koshish karte hain. Jaldi sawalon ke liye WhatsApp sab se tez zariya hai.",
    whatsapp: "Hi Scaltiva, I have a quick question.",
  },
  {
    id: "careers",
    label: "Careers",
    keywords: ["job", "jobs", "career", "careers", "hiring", "vacancy", "vacancies", "internship", "join your team", "work with you", "apply", "naukri"],
    answer:
      "Thanks for your interest in joining us! Please message our team on WhatsApp or email us your details and they'll get back to you.",
    whatsapp: "Hi Scaltiva, I'm interested in working with you.",
  },
  {
    id: "privacy",
    label: "Privacy & NDA",
    keywords: ["privacy", "confidential", "confidentiality", "nda", "data protection", "my data", "personal data", "gdpr"],
    answer:
      "We only use the details you share to respond to your enquiry and run your project. If you need an NDA, please ask our team on WhatsApp.",
    whatsapp: "Hi Scaltiva, I have a question about privacy or an NDA.",
  },
  {
    id: "language",
    label: "Languages",
    keywords: ["language", "languages", "urdu", "english", "arabic", "hindi", "speak", "zubaan"],
    answer:
      "I can chat in English and Roman Urdu. For other languages, please ask our team on WhatsApp.",
    roman:
      "Main English aur Roman Urdu mein baat kar sakta hoon. Doosri zubanon ke liye hamari team se WhatsApp par poochh lein.",
  },
  {
    id: "discount",
    label: "Offers & discounts",
    keywords: ["discount", "discounts", "offer price", "deal", "deals", "promo", "coupon", "special price", "sasta", "kam price", "negotiate"],
    answer: "For any current offers or custom pricing, please ask our team directly on WhatsApp.",
    roman: "Maujooda offers ya custom pricing ke liye hamari team se seedha WhatsApp par baat karein.",
    whatsapp: "Hi Scaltiva, are there any offers or discounts available?",
  },
  {
    id: "refund",
    label: "Refunds & cancellation",
    keywords: ["refund", "refunds", "cancel", "cancellation", "money back", "terminate", "paisay wapas"],
    answer:
      "Refund and cancellation terms are set out in your agreement. For details, please ask our team on WhatsApp.",
    whatsapp: "Hi Scaltiva, I have a question about refunds and cancellation.",
  },

  // ---- Contact (before small talk so "talk to you" lands here) ----
  {
    id: "contact",
    label: "Contact us",
    keywords: ["contact", "contact us", "reach", "talk to", "speak to", "call", "call you", "phone", "number", "email", "mail", "whatsapp", "human", "agent", "real person", "representative", "support", "help me", "rabta", "raabta", "baat karni", "baat karna", "number chahiye"],
    answer:
      `You can reach us on WhatsApp at ${SITE.whatsappDisplay}, through the contact form, or by email at ${SITE.email}. We aim to reply within one business day.`,
    roman:
      `Aap humse WhatsApp par ${SITE.whatsappDisplay} par, contact form ke zariye, ya ${SITE.email} par email se rabta kar sakte hain. Hum aam taur par aik business din mein jawab dene ki koshish karte hain.`,
    links: [{ label: "Contact form", to: "/contact" }],
    whatsapp: "Hi Scaltiva, I'd like to get in touch.",
  },

  // ---- Small talk (kept last so real questions win ties) ----
  {
    id: "bot",
    label: "Who are you?",
    keywords: ["who are you", "your name", "are you a bot", "are you human", "are you real", "scaltive", "kaun ho", "aap kaun", "tumhara naam", "aap ka naam"],
    answer:
      "I'm Scaltive, the Scaltiva website assistant. I answer questions about our services and process, and point you to our team on WhatsApp for anything else.",
    roman:
      "Main Scaltive hoon, Scaltiva website ka assistant. Main services aur process ke sawalon ke jawab deta hoon, aur baqi cheezon ke liye aap ko hamari team ke WhatsApp par bhejta hoon.",
  },
  {
    id: "thanks",
    label: "Thanks",
    keywords: ["thanks", "thank you", "thankyou", "thx", "appreciate", "shukriya", "shukria", "jazakallah", "jazak", "mehrbani"],
    answer: "You're welcome! Is there anything else I can help you with?",
    roman: "Aap ka shukriya! Kya main aap ki aur kisi cheez mein madad kar sakta hoon?",
    followUps: ["services", "pricing", "contact"],
  },
  {
    id: "bye",
    label: "Bye",
    keywords: ["bye", "goodbye", "see you", "allah hafiz", "khuda hafiz", "good night", "take care"],
    answer: "Goodbye! Feel free to come back any time, or message us on WhatsApp whenever you're ready.",
    roman: "Khuda hafiz! Jab dil chahe wapas aayein, ya jab tayyar hon to hamein WhatsApp par message karein.",
    whatsapp: "Hi Scaltiva!",
  },
  {
    id: "greeting",
    label: "Hello",
    keywords: ["hello", "hi", "hey", "hii", "heyy", "salam", "salaam", "assalam", "assalamualaikum", "aoa", "slam", "good morning", "good afternoon", "good evening", "howdy", "yo"],
    answer: GREETING,
    roman: GREETING_ROMAN,
    followUps: START_CHIPS,
  },
];
