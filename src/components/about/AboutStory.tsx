import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { SITE } from "@/lib/site";

const IMAGE =
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1800&q=75";

/** Big title, tagline and a wide image that grows to full width as you scroll to it. */
export default function AboutStory() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.82, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [reduce ? 24 : 64, 24]);

  return (
    <section ref={ref} className="px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-5xl font-semibold uppercase tracking-tight sm:text-7xl lg:text-8xl">Who we are</h2>
          <p className="max-w-xs text-muted-foreground">
            One team for your whole digital presence, where growth and craft come together.
          </p>
        </div>

        <motion.div
          style={{ scale, borderRadius: radius }}
          className="mt-10 overflow-hidden bg-accent shadow-xl shadow-primary/10"
        >
          <img
            src={IMAGE}
            alt={`The ${SITE.name} team working together`}
            loading="lazy"
            width={1800}
            height={900}
            className="aspect-[16/8] w-full object-cover"
          />
        </motion.div>

        <div className="mx-auto mt-14 max-w-3xl">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Too many businesses end up with a developer who does not talk to the marketer, and a marketer who
            cannot change the website. We built {SITE.name} to fix that. Our team covers the full journey: the
            website, the automation behind it, the search visibility that brings visitors, and the campaigns
            that turn them into customers.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Because everything lives in one place, projects move faster, messaging stays consistent and
            nothing gets lost in hand-offs.
          </p>
        </div>
      </div>
    </section>
  );
}
