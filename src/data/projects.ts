const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=75`;

export type Project = {
  title: string;
  category: "Development" | "Automation" | "SEO" | "Marketing";
  result: string;
  description: string;
  image: string;
  /** Wide card on the home page grid. */
  wide?: boolean;
};

// Placeholder case studies: replace with real projects and real results.
export const PROJECTS: Project[] = [
  {
    title: "E-commerce Platform Rebuild",
    category: "Development",
    result: "+64% conversion rate",
    description: "A faster, mobile-first store with a simpler checkout and clean product pages.",
    image: photo("photo-1607082348824-0a96f2a4b9da"),
    wide: true,
  },
  {
    title: "Sales Workflow Automation",
    category: "Automation",
    result: "20 hrs/week saved",
    description: "Lead capture, routing and follow-up connected end to end, with no manual copy-pasting.",
    image: photo("photo-1556155092-490a1ba16284"),
  },
  {
    title: "Local Search Growth",
    category: "SEO",
    result: "3x organic traffic",
    description: "Technical fixes, location pages and content that won nearby customers on Google.",
    image: photo("photo-1524813686514-a57563d77965"),
  },
  {
    title: "Product Launch Campaign",
    category: "Marketing",
    result: "+128% reach",
    description: "Paid, social and email working together to launch a new product to the right audience.",
    image: photo("photo-1611926653458-09294b3142bf"),
    wide: true,
  },
  {
    title: "Customer Portal Web App",
    category: "Development",
    result: "Support tickets down",
    description: "A secure portal where customers manage orders and invoices without contacting support.",
    image: photo("photo-1498050108023-c5249f4df085"),
  },
  {
    title: "Content-Led SEO Programme",
    category: "SEO",
    result: "Rankings up in 6 months",
    description: "A topic-cluster content plan with structured data, built to be cited by search and AI answers.",
    image: photo("photo-1504384308090-c894fdcc538d"),
  },
];
