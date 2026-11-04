import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { SITE } from "@/lib/site";

type Section = { heading: string; body: string };

type Page = {
  path: string;
  title: string;
  description: string;
  intro: string;
  sections: Section[];
  faq?: boolean;
};

const PAGES = {
  privacy: {
    path: "/privacy",
    title: "Privacy Policy | Scaltiva",
    description: "How Scaltiva collects, uses and protects your personal information.",
    intro: "Last updated: November 2026. This policy explains what we collect when you use our website and how we use it.",
    sections: [
      { heading: "Information we collect", body: "When you fill in our contact form or message us, we collect your name, email address, phone number and the details you share about your project. We may also collect basic usage data such as pages visited and device type." },
      { heading: "How we use it", body: "We use your information to reply to your enquiries, prepare quotes, deliver our services and improve our website. We do not sell your personal information." },
      { heading: "Sharing", body: "We only share information with trusted providers that help us run the website and our services (for example hosting and email), and when the law requires it." },
      { heading: "Cookies", body: "We use essential cookies and basic analytics to keep the site working and understand how it is used. You can block cookies in your browser settings." },
      { heading: "Your rights", body: `You can ask us to access, correct or delete your personal information at any time by emailing ${SITE.email}.` },
      { heading: "Contact", body: `Questions about this policy? Email us at ${SITE.email}.` },
    ],
  },
  terms: {
    path: "/terms",
    title: "Terms of Service | Scaltiva",
    description: "The terms that apply when you use the Scaltiva website and services.",
    intro: "Last updated: November 2026. By using our website or hiring us, you agree to these terms.",
    sections: [
      { heading: "Our services", body: "Scaltiva provides web development, business automation, SEO and digital marketing. The scope, timeline and price of each project are agreed in writing before work begins." },
      { heading: "Payments", body: "Payment terms are set out in each project quote or agreement. Work may be paused if an invoice is overdue." },
      { heading: "Client responsibilities", body: "You agree to provide accurate information, content and timely feedback, and to hold the rights to any material you give us." },
      { heading: "Ownership", body: "Once a project is fully paid for, you own the final deliverables made for you. We keep ownership of our own tools, code libraries and know-how." },
      { heading: "Results", body: "We work hard to deliver strong results, but we cannot guarantee specific search rankings, traffic or sales, as these depend on factors outside our control." },
      { heading: "Liability", body: "To the extent permitted by law, Scaltiva is not liable for indirect or consequential losses arising from the use of our website or services." },
      { heading: "Changes", body: "We may update these terms from time to time. The latest version is always on this page." },
      { heading: "Contact", body: `Questions about these terms? Email us at ${SITE.email}.` },
    ],
  },
  faq: {
    path: "/faq",
    title: "FAQ | Scaltiva",
    description: "Answers to common questions about working with Scaltiva: services, pricing, timelines and support.",
    intro: "Quick answers to the questions we hear most. Can't find yours? Get in touch.",
    faq: true,
    sections: [
      { heading: "What services do you offer?", body: "Web development, business automation, SEO and digital marketing, all under one roof." },
      { heading: "How much does a project cost?", body: "It depends on scope. Tell us what you need and we will send a clear, fixed quote after a free consultation." },
      { heading: "How long does a project take?", body: "A typical business website takes a few weeks. Larger web apps and automation projects take longer. We give you a timeline before we start." },
      { heading: "Do you offer support after launch?", body: "Yes. We offer maintenance and support plans so your site and systems stay fast, secure and up to date." },
      { heading: "Can you improve my existing website?", body: "Yes. We can redesign, speed up, fix or add features to a site you already have." },
      { heading: "How do I get started?", body: "Book a free consultation from the contact page. We will talk through your goals and propose a plan." },
    ],
  },
} satisfies Record<string, Page>;

export type InfoSlug = keyof typeof PAGES;

export default function InfoPage({ slug }: { slug: InfoSlug }) {
  const page: Page = PAGES[slug];
  const jsonLd = page.faq
    ? [
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.sections.map((s) => ({
            "@type": "Question",
            name: s.heading,
            acceptedAnswer: { "@type": "Answer", text: s.body },
          })),
        },
      ]
    : [];

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-5 pb-20 pt-32">
      <Seo title={page.title} description={page.description} path={page.path} jsonLd={jsonLd} />
      <h1 className="text-4xl font-bold">{page.title.replace(" | Scaltiva", "")}</h1>
      <p className="mt-4 text-muted-foreground">{page.intro}</p>
      <div className="mt-10 space-y-8">
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            <p className="mt-2 text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
      <Link to="/contact" className="mt-12 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground">
        Contact us
      </Link>
    </main>
  );
}
