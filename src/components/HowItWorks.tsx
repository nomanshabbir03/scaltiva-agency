import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CornerDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=75`;

const STEPS = [
  {
    title: "Discover & Research",
    description:
      "We begin by understanding your business goals, target audience and current challenges. This phase involves research, analysis and strategic planning to identify opportunities.",
    image: photo("photo-1552664730-d307ca884978"),
  },
  {
    title: "Strategy & Planning",
    description:
      "Based on our findings, we develop a comprehensive strategy that aligns with your objectives. This includes defining the approach, timeline and key milestones for success.",
    image: photo("photo-1531403009284-440f080d1e12"),
  },
  {
    title: "Execute & Develop",
    description:
      "We bring the strategy to life through careful implementation and development. Our team works collaboratively to ensure every detail meets your requirements and standards.",
    image: photo("photo-1517694712202-14dd9538aa97"),
  },
  {
    title: "Launch & Grow",
    description:
      "We go live, then keep measuring and optimising with real data so your results keep compounding long after launch.",
    image: photo("photo-1551434678-e076c223a692"),
  },
];

export default function HowItWorks() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  // A step becomes active while it crosses the middle of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Load every sticky image up front so a swap never fades in an empty box.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    STEPS.forEach((s) => {
      new Image().src = s.image;
    });
  }, []);

  return (
    <section id="process" className="bg-accent/50 px-5 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Our <span className="text-primary">Process</span>
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          A simple, transparent process, so you always know what happens next, from the first call to
          launch and beyond.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: stays in view while the steps scroll past. */}
          <div className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <div className="relative aspect-[4/3] max-w-lg overflow-hidden rounded-xl bg-muted shadow-xl shadow-primary/10">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={active}
                  src={STEPS[active].image}
                  alt={STEPS[active].title}
                  initial={{ opacity: 0, scale: reduce ? 1 : 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.6, ease: "easeOut" }}
                  className="absolute inset-0 size-full object-cover"
                />
              </AnimatePresence>
            </div>

            <Link
              to="/contact"
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold transition hover:text-primary"
            >
              <CornerDownRight className="size-4 text-primary" /> Get in touch
            </Link>
          </div>

          {/* Right: the steps. */}
          <ol>
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                data-index={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={cn(
                  "border-b py-10 transition-opacity duration-500 last:border-b-0 lg:min-h-[60vh] lg:py-16 lg:first:pt-0",
                  i === active ? "opacity-100" : "lg:opacity-35",
                )}
              >
                <span className="block text-7xl font-light tracking-tight sm:text-8xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                {/* On small screens the sticky image is hidden, so each step carries its own. */}
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="mt-6 aspect-[4/3] w-full rounded-xl object-cover lg:hidden"
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
