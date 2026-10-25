import { Code2, Megaphone, Search, Workflow, type LucideIcon } from "lucide-react";

export type Service = {
  slug: string;
  name: string;
  /** Short line shown in the navbar menu. */
  blurb: string;
  icon: LucideIcon;
  image: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Answer-first summary: the 40–60 words a search or AI engine can quote directly. */
  summary: string;
  definitionTitle: string;
  definition: string[];
  included: { title: string; text: string }[];
  benefits: { title: string; text: string }[];
  process: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
};

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=75`;

const process = (build: string): Service["process"] => [
  { title: "Discovery", text: "We learn your goals, audience and current setup in a free consultation, then agree what success looks like." },
  { title: "Plan", text: "You receive a clear scope, timeline and quote before any work starts, so there are no surprises." },
  { title: "Build", text: build },
  { title: "Launch & improve", text: "We go live, measure the results and keep refining based on real data." },
];

export const SERVICES: Service[] = [
  {
    slug: "development",
    name: "Development",
    blurb: "Websites, web apps and online stores",
    icon: Code2,
    image: photo("photo-1498050108023-c5249f4df085"),
    metaTitle: "Custom Web Development Services | Scaltiva",
    metaDescription:
      "Scaltiva builds fast, secure, SEO-ready websites and web apps with React, Node.js and MongoDB. Get a free consultation and a clear quote.",
    h1: "Custom Web Development Services",
    summary:
      "Scaltiva designs and builds custom websites, web applications and online stores that load fast, work on every device and are structured to rank in search. We use modern technologies such as React, Node.js and MongoDB, and handle everything from planning to launch and ongoing support.",
    definitionTitle: "What is custom web development?",
    definition: [
      "Web development is the process of designing, building and maintaining websites and web applications. It covers what visitors see (the front end), the servers and databases behind it (the back end), and the integrations that connect your site to other tools such as payment providers and CRMs.",
      "Custom development means your site is built around your business instead of being forced into a generic template. That gives you better performance, more flexibility as you grow, and full ownership of your code and data.",
    ],
    included: [
      { title: "Business websites", text: "Fast, professional sites that explain what you do and turn visitors into enquiries." },
      { title: "Web applications", text: "Dashboards, portals and internal tools built on the MERN stack (MongoDB, Express, React, Node.js)." },
      { title: "E-commerce stores", text: "Online shops with secure checkout, product management and payment integrations." },
      { title: "Landing pages", text: "Focused pages built to convert traffic from ads, email and search." },
      { title: "API & integrations", text: "Connections to your CRM, payment gateway, email platform and other tools." },
      { title: "Maintenance & support", text: "Updates, security patches, backups and improvements after launch." },
    ],
    benefits: [
      { title: "Built to load fast", text: "Lightweight code and optimised images help pages load quickly, which supports both conversions and search rankings." },
      { title: "Mobile-first design", text: "Every layout is designed for phones first, then scaled up to tablets and desktops." },
      { title: "SEO-ready foundations", text: "Clean semantic HTML, sensible URLs, structured data and Core Web Vitals in mind from day one." },
      { title: "Secure and scalable", text: "Secure coding practices and an architecture that can grow with your traffic and features." },
      { title: "You own everything", text: "You keep the source code and your data. No lock-in to a proprietary platform." },
    ],
    process: process("We design and develop in stages, testing on real devices and sharing progress at every milestone."),
    faqs: [
      { q: "How long does it take to build a website?", a: "It depends on scope. A focused business website often takes a few weeks, while a custom web application or online store can take a few months. We give you a realistic timeline in the plan before work begins." },
      { q: "How much does custom web development cost?", a: "Cost depends on the number of pages, features and integrations. After a free consultation we send a fixed, itemised quote so you know the price before you commit." },
      { q: "What technologies do you use?", a: "We specialise in the MERN stack: MongoDB, Express, React and Node.js, styled with Tailwind CSS. We choose the right tools for each project rather than forcing one approach." },
      { q: "Will my website be optimised for SEO?", a: "Yes. Every site is built with semantic HTML, fast load times, mobile responsiveness, clean URLs and structured data. If you want ongoing ranking work, it pairs naturally with our SEO service." },
      { q: "Do you offer support after launch?", a: "Yes. We offer maintenance plans covering updates, security, backups and improvements, so your site stays fast and secure." },
      { q: "Can you redesign or fix my existing website?", a: "Yes. We can audit your current site, fix performance or usability problems, or rebuild it entirely while keeping the search rankings you have already earned." },
    ],
    related: ["seo", "automation"],
  },
  {
    slug: "automation",
    name: "Automation",
    blurb: "Workflows that run themselves",
    icon: Workflow,
    image: photo("photo-1518770660439-4636190af475"),
    metaTitle: "Business Process Automation Services | Scaltiva",
    metaDescription:
      "Cut manual work with workflow automation, CRM and API integrations, and AI assistants. Scaltiva builds automations that save your team hours every week.",
    h1: "Business Process Automation Services",
    summary:
      "Scaltiva automates repetitive business tasks such as lead capture, follow-ups, invoicing, reporting and data entry by connecting your tools and building custom workflows. The result is fewer errors, faster response times and more hours for your team to spend on work that grows the business.",
    definitionTitle: "What is business process automation?",
    definition: [
      "Business process automation uses software to carry out repetitive, rule-based tasks without manual effort. Typical examples include sending a follow-up email when a lead fills in a form, syncing customer data between your CRM and accounting tool, or generating a weekly report automatically.",
      "Automation does not mean replacing your team. It removes the routine work that slows them down, so people can focus on conversations, decisions and creative problems that software cannot handle.",
    ],
    included: [
      { title: "Workflow automation", text: "Multi-step workflows that run on their own when a trigger happens, such as a new order or enquiry." },
      { title: "CRM & tool integrations", text: "Connect your CRM, email, forms, spreadsheets, accounting and messaging apps so data flows between them." },
      { title: "Lead capture & follow-up", text: "Instantly route new leads, notify the right person and send timely follow-up messages." },
      { title: "Reporting & data sync", text: "Automatic dashboards and reports so numbers are always current without copy-pasting." },
      { title: "Custom API development", text: "Bespoke integrations when off-the-shelf connectors do not cover your tools." },
      { title: "AI assistants & chatbots", text: "AI-powered assistants that answer common questions and hand off to your team when needed." },
    ],
    benefits: [
      { title: "Save hours every week", text: "Repetitive tasks run in the background instead of taking up your team's day." },
      { title: "Fewer manual errors", text: "Automated steps follow the same rules every time, reducing typos and missed follow-ups." },
      { title: "Faster customer response", text: "Enquiries are acknowledged and routed immediately, even outside working hours." },
      { title: "Scale without extra headcount", text: "Handle more leads and orders without proportionally increasing admin work." },
      { title: "Clear visibility", text: "Know what ran, when, and what needs attention, with monitoring built in." },
    ],
    process: process("We build and test each automation with realistic data, then document how it works so your team can trust it."),
    faqs: [
      { q: "What kinds of tasks can be automated?", a: "Any repetitive, rule-based task is a candidate: lead capture and follow-up, invoicing, data entry between systems, report generation, notifications, onboarding steps and appointment reminders." },
      { q: "Do I need to replace the tools I already use?", a: "No. We connect the tools you already use, such as your CRM, email platform and spreadsheets, so you keep your existing setup." },
      { q: "What is the difference between automation and AI?", a: "Automation follows fixed rules to complete tasks. AI can interpret text, answer questions or make suggestions. We often combine them, for example an AI assistant that answers a question and then triggers an automated workflow." },
      { q: "Is my business data kept secure?", a: "Yes. We use secure connections, limit access to only what each workflow needs and avoid storing data we do not need." },
      { q: "How do I know what to automate first?", a: "In the free consultation we review your day-to-day processes and recommend the tasks that save the most time for the least effort." },
      { q: "What happens if an automation breaks?", a: "We build in monitoring and error alerts, and our support plans cover fixes and updates when your tools change." },
    ],
    related: ["development", "marketing"],
  },
  {
    slug: "seo",
    name: "SEO",
    blurb: "Get found on Google and in AI answers",
    icon: Search,
    image: photo("photo-1460925895917-afdab827c52f"),
    metaTitle: "SEO Services for Search & AI Visibility | Scaltiva",
    metaDescription:
      "Technical SEO, content, local SEO and AI search optimization to grow organic traffic and get cited by Google and AI assistants. Free SEO consultation.",
    h1: "SEO Services That Grow Organic Traffic",
    summary:
      "Scaltiva helps businesses get found on Google and in AI answers such as ChatGPT, Perplexity and Google AI Overviews. We combine technical SEO, content, local SEO and structured data so your site ranks for the searches your customers make and is easy for AI systems to understand and cite.",
    definitionTitle: "What is SEO and AI search optimization?",
    definition: [
      "Search engine optimization (SEO) is the practice of improving a website so it appears higher in unpaid search results. It covers technical health (speed, crawlability, mobile usability), content that answers real questions, and signals of trust such as quality links and reviews.",
      "AI search optimization, sometimes called generative engine optimization (GEO) or answer engine optimization (AEO), adapts that work so AI assistants can find, understand and cite your content. That means clear answer-first writing, well-structured pages, structured data and demonstrable expertise.",
    ],
    included: [
      { title: "Technical SEO audit & fixes", text: "Crawlability, indexing, site speed, Core Web Vitals, mobile usability and site architecture." },
      { title: "Keyword & intent research", text: "Find the searches your customers actually make and map each one to the right page." },
      { title: "On-page optimization", text: "Titles, headings, internal links and content structure that match search intent." },
      { title: "Content strategy & writing", text: "Helpful, accurate pages and articles written to answer questions better than competitors." },
      { title: "Local SEO", text: "Google Business Profile, local citations and location pages to win nearby customers." },
      { title: "Structured data & AI visibility", text: "Schema markup, FAQ and entity optimization so search and AI systems can interpret and cite your site." },
      { title: "Reporting", text: "Clear monthly reports on rankings, traffic and leads, with the next steps explained in plain language." },
    ],
    benefits: [
      { title: "Compounding, lower-cost traffic", text: "Unlike ads, well-ranked pages keep attracting visitors without paying for every click." },
      { title: "Higher-intent visitors", text: "People searching for your service are already looking to buy or enquire." },
      { title: "Visible in AI answers too", text: "Answer-first, well-structured content gives you a chance to be cited by AI assistants, not just listed in search results." },
      { title: "Trust and credibility", text: "Ranking well signals authority and helps people choose you over competitors." },
      { title: "Measurable results", text: "We track rankings, traffic and enquiries so you can see what the work delivers." },
    ],
    process: process("We fix technical issues first, then create and optimise content in priority order, publishing steadily."),
    faqs: [
      { q: "How long does SEO take to work?", a: "SEO is a long-term investment. Many businesses start to see movement within a few months, with stronger results building over six to twelve months, depending on competition, your starting point and how much content is needed." },
      { q: "Can you guarantee a number one ranking?", a: "No. Nobody outside the search engine can ethically guarantee a specific ranking. What we guarantee is transparent, best-practice work and clear reporting on progress." },
      { q: "What is GEO or AEO, and do I need it?", a: "Generative engine optimization and answer engine optimization help your content get found and cited by AI assistants. It builds on good SEO, so we include it as part of our approach rather than as a separate gimmick." },
      { q: "Do you do local SEO?", a: "Yes. We optimise your Google Business Profile, local listings and location pages so you appear when nearby customers search." },
      { q: "Do I need a new website for SEO?", a: "Not always. We start with an audit of your current site. If it is slow or poorly structured we will say so, and we can fix it or rebuild it through our development service." },
      { q: "How do you measure SEO success?", a: "We track organic traffic, rankings for target keywords, enquiries and conversions, and report on them in plain language each month." },
    ],
    related: ["development", "marketing"],
  },
  {
    slug: "marketing",
    name: "Marketing",
    blurb: "Campaigns that bring in leads",
    icon: Megaphone,
    image: photo("photo-1432888498266-38ffec3eaf0a"),
    metaTitle: "Digital Marketing Services | Scaltiva",
    metaDescription:
      "Full-funnel digital marketing: strategy, paid ads, social media, email and content that turns attention into leads and customers. Book a free consultation.",
    h1: "Digital Marketing Services That Drive Leads",
    summary:
      "Scaltiva plans and runs digital marketing that turns attention into leads and customers. We combine strategy, paid advertising, social media, email and content marketing, and we track every channel so you can see what is working and put your budget behind it.",
    definitionTitle: "What is digital marketing?",
    definition: [
      "Digital marketing is the use of online channels such as search engines, social media, email and websites to reach potential customers and encourage them to act. It includes both paid channels, like pay-per-click advertising, and organic channels, like content and email.",
      "Effective digital marketing is measurable. Each channel is tracked from first click to enquiry or sale, so spending can move towards what works and away from what does not.",
    ],
    included: [
      { title: "Marketing strategy", text: "A clear plan covering audience, positioning, channels, budget and goals." },
      { title: "Paid advertising", text: "Google, Meta and LinkedIn campaigns managed for qualified leads at a sustainable cost." },
      { title: "Social media marketing", text: "Content planning, publishing and community management that fits your brand." },
      { title: "Email marketing", text: "Newsletters, nurture sequences and automated campaigns that keep customers engaged." },
      { title: "Content marketing", text: "Articles, guides and case studies that attract and educate your ideal customers." },
      { title: "Analytics & conversion optimization", text: "Tracking, reporting and landing page testing to turn more visitors into leads." },
    ],
    benefits: [
      { title: "Reach the right people", text: "Targeting by interest, intent and location puts your message in front of likely customers." },
      { title: "Measurable return", text: "Every campaign is tracked so you can see cost per lead and which channels perform." },
      { title: "Flexible budgets", text: "Start small, learn quickly and scale what works. You stay in control of spend." },
      { title: "Joined-up with your site", text: "Because we also build websites and automation, leads move smoothly from ad to follow-up." },
      { title: "Consistent brand voice", text: "One team keeps your messaging consistent across ads, social, email and content." },
    ],
    process: process("We launch campaigns in stages, test creative and audiences, and report on results in plain language."),
    faqs: [
      { q: "Which marketing channels are right for my business?", a: "It depends on your audience and goals. B2B services often lean on search, LinkedIn and email, while consumer brands may favour social and paid social. We recommend a focused mix rather than being everywhere at once." },
      { q: "How much should I spend on marketing?", a: "There is no single number. We help you set a budget based on your goals and typical customer value, then start modestly and scale what performs." },
      { q: "How soon will I see results?", a: "Paid campaigns can generate traffic and leads within days of launch, though they usually need a few weeks of testing to optimise. Content and email build value over a longer period." },
      { q: "Do you manage ad spend and creative?", a: "Yes. We handle strategy, setup, creative, ongoing optimisation and reporting. Ad spend is paid directly to the platforms so you always see where your money goes." },
      { q: "How do you report on results?", a: "You get regular reports covering spend, leads, cost per lead and conversions, along with recommendations for the next steps." },
      { q: "Can marketing work together with SEO?", a: "Yes. Paid ads give quick traffic while SEO builds long-term organic visibility. We coordinate both so they support each other." },
    ],
    related: ["seo", "automation"],
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
