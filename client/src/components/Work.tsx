import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PROJECTS } from "@/data/projects";
import { cn } from "@/lib/utils";

// The home page shows the first four projects; the full list lives on /work.
const FEATURED = PROJECTS.slice(0, 4);

export default function Work() {
  const reduce = useReducedMotion();

  const grid: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.15 } },
  };
  const card: Variants = {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section id="work" className="bg-background px-5 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Featured work</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Results we&apos;re <span className="text-primary">proud of</span>
            </h2>
          </div>
          <Link to="/work" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            View all work <ArrowUpRight className="size-4" />
          </Link>
        </motion.div>

        <motion.ul
          className="mt-12 grid gap-6 md:grid-cols-5"
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {FEATURED.map((p) => (
            <motion.li key={p.title} variants={card} className={p.wide ? "md:col-span-3" : "md:col-span-2"}>
              <Link to="/work" className="group relative block h-80 overflow-hidden rounded-2xl bg-muted sm:h-96">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-primary/80" />

                <span className="absolute left-5 top-5 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur">
                  {p.category}
                </span>
                <span
                  className={cn(
                    "absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground",
                    "translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
                  )}
                >
                  <ArrowUpRight className="size-5" />
                </span>

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-sm font-medium text-white/80">{p.result}</p>
                  <h3 className="mt-1 text-2xl font-semibold">{p.title}</h3>
                </div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
