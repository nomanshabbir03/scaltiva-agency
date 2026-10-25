import { motion, useReducedMotion } from "motion/react";
import { Eye, Handshake, Lightbulb, MessageSquareText, Rocket, ShieldCheck, Target, User, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import CallToAction from "@/components/CallToAction";
import { TEAM } from "@/data/team";
import { absoluteUrl, SITE } from "@/lib/site";

const VALUES: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Clarity", text: "Plain language, transparent pricing and honest timelines. You always know what is happening and why.", icon: MessageSquareText },
  { title: "Quality", text: "We sweat the details, from clean code to well-written content, because the small things add up.", icon: ShieldCheck },
  { title: "Partnership", text: "We work as an extension of your team and treat your goals as our own.", icon: Handshake },
  { title: "Results", text: "Pretty is not enough. We measure what we do and focus on outcomes that matter to your business.", icon: Rocket },
  { title: "Curiosity", text: "The digital world moves fast. We keep learning so you benefit from what works now, not last year.", icon: Lightbulb },
];

const PATH = "/about";
const TITLE = "About Scaltiva | Our Mission, Vision, Values & Team";
const DESCRIPTION =
  "Meet Scaltiva, a digital agency combining web development, automation, SEO and marketing. Learn about our mission, vision, values and the team behind the work.";

export default function About() {
  const reduce = useReducedMotion();
  const fadeUp = (delay = 0) => ({
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay: reduce ? 0 : delay, ease: "easeOut" as const },
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: TITLE,
      description: DESCRIPTION,
      url: absoluteUrl(PATH),
      mainEntity: { "@type": "Organization", name: SITE.name, url: SITE.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "About", item: absoluteUrl(PATH) },
      ],
    },
  ];

  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} path={PATH} jsonLd={jsonLd} />

      {/* Hero */}
      <header className="bg-accent/50 px-5 pb-16 pt-36 lg:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <ol className="flex items-center justify-center gap-2">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="font-medium text-foreground">About</li>
            </ol>
          </nav>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            About <span className="text-primary">{SITE.name}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
            {SITE.name} is a digital agency that brings web development, business automation, SEO and marketing
            together under one roof, so your business grows online without juggling multiple agencies.
          </p>
        </div>
      </header>

      <main id="main-content">
        {/* Story */}
        <section className="px-5 py-16 lg:py-24">
          <motion.div className="mx-auto max-w-3xl" {...fadeUp()}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Who we are</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">One team for your whole digital presence</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Too many businesses end up with a developer who does not talk to the marketer, and a marketer who
              cannot change the website. We built {SITE.name} to fix that. Our team covers the full journey: the
              website, the automation behind it, the search visibility that brings visitors, and the campaigns
              that turn them into customers.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Because everything lives in one place, projects move faster, messaging stays consistent and
              nothing gets lost in hand-offs.
            </p>
          </motion.div>
        </section>

        {/* Mission & Vision */}
        <section className="px-5 pb-16 lg:pb-24">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            <motion.article
              className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12"
              {...fadeUp()}
            >
              <span aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
              <span className="relative grid size-14 place-items-center rounded-xl bg-white/20">
                <Target className="size-7" />
              </span>
              <h2 className="relative mt-6 text-3xl font-bold sm:text-4xl">Our mission</h2>
              <p className="relative mt-4 text-lg leading-relaxed text-white/90">
                To help businesses grow online by delivering practical, well-built and measurable digital
                solutions, explained in plain language and backed by honest advice.
              </p>
            </motion.article>

            <motion.article className="relative overflow-hidden rounded-3xl border bg-accent p-8 sm:p-12" {...fadeUp(0.15)}>
              <span aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/10" />
              <span className="relative grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Eye className="size-7" />
              </span>
              <h2 className="relative mt-6 text-3xl font-bold sm:text-4xl">Our vision</h2>
              <p className="relative mt-4 text-lg leading-relaxed text-muted-foreground">
                To be the digital partner businesses trust first, known for results, transparency and long-term
                relationships rather than quick wins.
              </p>
            </motion.article>
          </div>
        </section>

        {/* Values */}
        <section className="bg-accent/50 px-5 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div className="mx-auto max-w-2xl text-center" {...fadeUp()}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">What we stand for</p>
              <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Our <span className="text-primary">values</span>
              </h2>
            </motion.div>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map(({ title, text, icon: Icon }, i) => (
                <motion.li
                  key={title}
                  className="group rounded-2xl border bg-background p-7 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                  {...fadeUp((i % 3) * 0.1)}
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-accent text-primary transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="px-5 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div className="mx-auto max-w-2xl text-center" {...fadeUp()}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">The people</p>
              <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Meet our <span className="text-primary">team</span>
              </h2>
              <p className="mt-4 text-balance text-muted-foreground">
                The people behind your website, automations, rankings and campaigns.
              </p>
            </motion.div>

            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((m, i) => (
                <motion.li key={m.name} className="group" {...fadeUp((i % 4) * 0.1)}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-accent">
                    {m.photo ? (
                      <img
                        src={m.photo}
                        alt={`${m.name}, ${m.role} at ${SITE.name}`}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <span className="grid size-full place-items-center text-primary/40">
                        <User className="size-24" strokeWidth={1.25} />
                      </span>
                    )}
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        <CallToAction />
      </main>
    </>
  );
}
