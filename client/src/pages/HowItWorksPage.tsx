import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import ServiceFaq from "@/components/ServiceFaq";
import CallToAction from "@/components/CallToAction";
import { absoluteUrl } from "@/lib/site";

const STEPS = [
  {
    title: "Discovery call",
    text: "We start with a free conversation about your business, goals, audience and what you already have in place.",
    you: "Share your goals, any existing site or accounts, and examples you like.",
    get: "A clear understanding of where you are and what success looks like.",
  },
  {
    title: "Proposal & plan",
    text: "We turn what we learned into a written scope, timeline and itemised quote, so you know exactly what you are paying for.",
    you: "Review the proposal and ask questions. Nothing starts until you approve it.",
    get: "A fixed scope, timeline and price with no surprises.",
  },
  {
    title: "Design & strategy",
    text: "We map out the structure, look and feel, or the campaign and automation strategy, and agree it with you before building.",
    you: "Give feedback on the designs or strategy at an agreed review point.",
    get: "Approved designs or a documented strategy that guides the build.",
  },
  {
    title: "Build & test",
    text: "We build in stages, testing on real devices and with realistic data, and show you progress at every milestone.",
    you: "Check milestones and provide content or access when we ask.",
    get: "Working software, pages or campaigns you have seen and approved along the way.",
  },
  {
    title: "Launch",
    text: "We go live carefully, checking performance, tracking and links, then confirm everything works as planned.",
    you: "Give final sign-off.",
    get: "A live, tracked and tested result, plus a hand-over of what we built.",
  },
  {
    title: "Support & grow",
    text: "After launch we monitor results, fix issues and keep improving with data, through a maintenance or growth plan.",
    you: "Choose the level of ongoing support that suits you.",
    get: "Regular updates, reports and improvements that keep results compounding.",
  },
];

const FAQS = [
  { q: "Is the first consultation really free?", a: "Yes. The discovery call is free and carries no obligation. It is a chance for both of us to see whether we are a good fit." },
  { q: "Will I know the price before work starts?", a: "Yes. You receive a written, itemised quote and scope before any work begins, and we only start once you approve it." },
  { q: "How involved do I need to be?", a: "As much or as little as you like. We need your input at key points such as the brief, design review and final sign-off, and we handle the rest." },
  { q: "What if I want to change something midway?", a: "Small changes are normal and we are happy to accommodate them. If a change affects scope, timeline or cost we tell you first so you can decide." },
  { q: "Do you offer support after launch?", a: "Yes. We offer maintenance and growth plans covering updates, security, monitoring and ongoing improvements." },
];

const PATH = "/how-it-works";
const TITLE = "How It Works | Our Process from First Call to Launch | Scaltiva";
const DESCRIPTION =
  "See how working with Scaltiva works: a free discovery call, a clear proposal, design, build, launch and ongoing support, with no surprises.";

export default function HowItWorksPage() {
  const reduce = useReducedMotion();
  const fadeUp = {
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.6, ease: "easeOut" as const },
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: TITLE,
      description: DESCRIPTION,
      url: absoluteUrl(PATH),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "How It Works", item: absoluteUrl(PATH) },
      ],
    },
  ];

  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} path={PATH} jsonLd={jsonLd} />
      <PageHeader
        crumbs={[{ label: "How It Works" }]}
        title={
          <>
            How it <span className="text-primary">works</span>
          </>
        }
        intro="A simple, transparent process from the first call to launch and beyond, so you always know what happens next."
      />

      <main id="main-content" className="px-5 py-16 lg:py-24">
        <ol className="mx-auto max-w-4xl">
          {STEPS.map((s, i) => (
            <motion.li key={s.title} className="relative flex gap-5 pb-12 last:pb-0 sm:gap-8" {...fadeUp}>
              {/* Vertical line joining the numbered badges. */}
              {i < STEPS.length - 1 && (
                <span aria-hidden className="absolute bottom-0 left-6 top-14 w-0.5 bg-primary/25" />
              )}
              <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl border bg-background p-6 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 sm:p-8">
                <h2 className="text-2xl font-semibold">{s.title}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-accent/60 p-4">
                    <dt className="font-semibold">What we need from you</dt>
                    <dd className="mt-1 text-muted-foreground">{s.you}</dd>
                  </div>
                  <div className="rounded-xl bg-accent/60 p-4">
                    <dt className="flex items-center gap-1.5 font-semibold">
                      <Check className="size-4 text-primary" /> What you get
                    </dt>
                    <dd className="mt-1 text-muted-foreground">{s.get}</dd>
                  </div>
                </dl>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="mx-auto mt-20 max-w-6xl">
          <ServiceFaq title="Process FAQs" faqs={FAQS} />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Want to see it in action?{" "}
            <Link to="/work" className="font-semibold text-primary hover:underline">
              Browse our work
            </Link>
          </p>
        </div>
      </main>

      <CallToAction />
    </>
  );
}
