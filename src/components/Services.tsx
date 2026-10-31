import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Code2, Megaphone, Search, Workflow, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

const SERVICES: {
  title: string;
  description: string;
  href: string;
  image: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Development",
    description: "Fast, scalable websites and web apps built with modern tech, from landing pages to full platforms.",
    href: "/services/development",
    image: photo("photo-1498050108023-c5249f4df085"),
    icon: Code2,
  },
  {
    title: "Automation",
    description: "Replace repetitive manual work with workflows and integrations that run on their own.",
    href: "/services/automation",
    image: photo("photo-1518770660439-4636190af475"),
    icon: Workflow,
  },
  {
    title: "SEO",
    description: "Technical and content SEO that gets you found by the right people on Google.",
    href: "/services/seo",
    image: photo("photo-1460925895917-afdab827c52f"),
    icon: Search,
  },
  {
    title: "Marketing",
    description: "Campaigns and content that turn attention into leads, and leads into customers.",
    href: "/services/marketing",
    image: photo("photo-1432888498266-38ffec3eaf0a"),
    icon: Megaphone,
  },
];

export default function Services() {
  // Nothing is open until a row is hovered (or tapped on touch screens).
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const canHover = () => window.matchMedia("(hover: hover)").matches;

  return (
    <section id="services" className="bg-background px-5 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center"
          initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Our services</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
              What <span className="text-primary">Services</span>
              <br />
              We&apos;re Offering
            </h2>
          </div>
        </motion.div>

        <ul className="mt-14 border-t" onMouseLeave={() => setActive(null)}>
          {SERVICES.map((s, i) => {
            const open = i === active;
            const Icon = s.icon;
            return (
              <li key={s.title} className="border-b" onMouseEnter={() => setActive(i)}>
                <button
                  type="button"
                  onClick={() => {
                    if (!canHover()) setActive(open ? null : i);
                  }}
                  onFocus={() => setActive(i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between py-6 text-left"
                >
                  <span
                    className={cn(
                      "text-3xl font-semibold tracking-tight transition-colors duration-300 sm:text-5xl",
                      open ? "text-foreground" : "text-muted-foreground/50",
                    )}
                  >
                    {s.title}
                    <span className={cn("text-primary transition-opacity", open ? "opacity-100" : "opacity-0")}>.</span>
                  </span>
                  <span
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-full border transition-all duration-300",
                      open ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    <ArrowRight className={cn("size-5 transition-transform duration-300", open && "-rotate-45")} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-8 pb-10 pt-2 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-sm">
                          <p className="leading-relaxed text-muted-foreground">{s.description}</p>
                          <Link
                            to={s.href}
                            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                          >
                            Learn more <ArrowUpRight className="size-4" />
                          </Link>
                        </div>
                        <div className="relative w-full md:w-[26rem]">
                          <img
                            src={s.image}
                            alt={`${s.title} service`}
                            loading="lazy"
                            className="h-56 w-full rounded-2xl object-cover shadow-xl shadow-primary/10 md:h-64"
                          />
                          <span className="absolute -bottom-4 left-5 grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                            <Icon className="size-7" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
