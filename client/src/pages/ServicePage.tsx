import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import CallToAction from "@/components/CallToAction";
import ServiceFaq from "@/components/ServiceFaq";
import { absoluteUrl, SITE } from "@/lib/site";
import { getService, SERVICES } from "@/data/services";

const fadeUp = (reduce: boolean | null) => ({
  initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut" as const },
});

export default function ServicePage() {
  const { slug = "" } = useParams();
  const service = getService(slug);
  const reduce = useReducedMotion();

  if (!service) return <Navigate to="/404" replace />;

  const path = `/services/${service.slug}`;
  const Icon = service.icon;
  const related = SERVICES.filter((s) => service.related.includes(s.slug));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.h1,
      serviceType: service.name,
      description: service.summary,
      url: absoluteUrl(path),
      image: service.image,
      provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
      areaServed: "Worldwide",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: service.faqs.map((f) => ({
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
        { "@type": "ListItem", position: 2, name: "Services", item: absoluteUrl("/#services") },
        { "@type": "ListItem", position: 3, name: service.name, item: absoluteUrl(path) },
      ],
    },
  ];

  return (
    <>
      <Seo
        title={service.metaTitle}
        description={service.metaDescription}
        path={path}
        image={service.image}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <header className="bg-accent/50 px-5 pb-16 pt-36 lg:pb-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-2">
                <li><Link to="/" className="hover:text-primary">Home</Link></li>
                <li aria-hidden>/</li>
                <li><Link to="/#services" className="hover:text-primary">Services</Link></li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="font-medium text-foreground">{service.name}</li>
              </ol>
            </nav>
            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl">{service.h1}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{service.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:opacity-90"
              >
                Get a free quote <ArrowRight className="size-4" />
              </Link>
              <a
                href="#faq"
                className="inline-flex items-center rounded-lg border bg-background px-6 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary"
              >
                Read the FAQ
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src={service.image}
              alt={`${service.name} services by ${SITE.name}`}
              width={1200}
              height={800}
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl shadow-primary/10"
            />
            <span className="absolute -bottom-4 left-5 grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Icon className="size-7" />
            </span>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* Definition */}
        <section className="px-5 py-16 lg:py-24">
          <motion.div className="mx-auto max-w-3xl" {...fadeUp(reduce)}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{service.definitionTitle}</h2>
            {service.definition.map((p) => (
              <p key={p} className="mt-5 text-lg leading-relaxed text-muted-foreground">{p}</p>
            ))}
          </motion.div>
        </section>

        {/* What's included */}
        <section className="bg-accent/50 px-5 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div className="max-w-2xl" {...fadeUp(reduce)}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What&apos;s included in our {service.name.toLowerCase()} service
              </h2>
            </motion.div>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {service.included.map((item, i) => (
                <motion.li
                  key={item.title}
                  className="rounded-2xl border bg-background p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
                  {...fadeUp(reduce)}
                  transition={{ duration: 0.5, delay: reduce ? 0 : (i % 3) * 0.1, ease: "easeOut" }}
                >
                  <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Benefits */}
        <section className="px-5 py-16 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr]">
            <motion.div {...fadeUp(reduce)}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why choose Scaltiva for <span className="text-primary">{service.name.toLowerCase()}</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                One team for development, automation, SEO and marketing means everything works together.
              </p>
            </motion.div>
            <ul className="divide-y border-y">
              {service.benefits.map((b) => (
                <motion.li key={b.title} className="py-6" {...fadeUp(reduce)}>
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Process */}
        <section className="bg-accent/50 px-5 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <motion.h2 className="text-3xl font-bold tracking-tight sm:text-4xl" {...fadeUp(reduce)}>
              How our {service.name.toLowerCase()} process works
            </motion.h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-4">
              {service.process.map((step, i) => (
                <motion.li key={step.title} className="rounded-2xl border bg-background p-6" {...fadeUp(reduce)}>
                  <span className="text-5xl font-light text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ: one closed bar; click to reveal the questions. Answers stay in the HTML for crawlers and AI. */}
        <section id="faq" className="px-5 py-16 lg:py-24">
          <motion.div className="mx-auto max-w-6xl" {...fadeUp(reduce)}>
            <ServiceFaq title={`${service.name} FAQs`} faqs={service.faqs} />
          </motion.div>
        </section>

        {/* Related services: internal links */}
        <section className="bg-accent/50 px-5 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold tracking-tight">Related services</h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/services/${r.slug}`}
                    className="group flex items-center justify-between rounded-2xl border bg-background p-6 transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <span>
                      <span className="block text-lg font-semibold">{r.name}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{r.metaDescription.split(".")[0]}.</span>
                    </span>
                    <ArrowUpRight className="size-5 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CallToAction />
      </main>
    </>
  );
}
