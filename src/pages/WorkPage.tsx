import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import CallToAction from "@/components/CallToAction";
import { PROJECTS, type Project } from "@/data/projects";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Development", "Automation", "SEO", "Marketing"] as const;
type Filter = (typeof FILTERS)[number];

const PATH = "/work";
const TITLE = "Our Work | Web Development, Automation, SEO & Marketing Projects | Scaltiva";
const DESCRIPTION =
  "Explore Scaltiva projects across web development, business automation, SEO and digital marketing, and the results they delivered.";

export default function WorkPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const reduce = useReducedMotion();
  const shown: Project[] = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: TITLE,
      description: DESCRIPTION,
      url: absoluteUrl(PATH),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: PROJECTS.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Work", item: absoluteUrl(PATH) },
      ],
    },
  ];

  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} path={PATH} jsonLd={jsonLd} />
      <PageHeader
        crumbs={[{ label: "Work" }]}
        title={
          <>
            Our <span className="text-primary">work</span>
          </>
        }
        intro="A selection of projects across development, automation, SEO and marketing, and the results they delivered."
      />

      <main id="main-content" className="px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div role="group" aria-label="Filter projects by service" className="flex flex-wrap justify-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "min-h-11 rounded-full border px-5 text-sm font-semibold transition",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:border-primary/50 hover:text-primary",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((p) => (
                <motion.li
                  key={p.title}
                  layout={!reduce}
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reduce ? 1 : 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <article className="group h-full overflow-hidden rounded-2xl border bg-background transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        width={1200}
                        height={900}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur">
                        {p.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="text-sm font-semibold text-primary">{p.result}</p>
                      <h2 className="mt-1 text-xl font-semibold">{p.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                    </div>
                  </article>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </main>

      <CallToAction />
    </>
  );
}
