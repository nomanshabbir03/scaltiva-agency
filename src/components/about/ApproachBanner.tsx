import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";

const IMAGE =
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1800&q=75";

/** Full-width photo with a big heading, two text columns and a round call-to-action. */
export default function ApproachBanner() {
  const reduce = useReducedMotion();

  return (
    <section className="px-5 py-16 lg:py-24">
      <motion.div
        className="relative mx-auto flex min-h-[620px] max-w-6xl flex-col justify-between overflow-hidden rounded-3xl p-8 text-white sm:p-12"
        initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <img src={IMAGE} alt="" aria-hidden loading="lazy" className="absolute inset-0 size-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

        <div className="relative flex items-start justify-between gap-6">
          <h2 className="text-5xl font-medium leading-[1.05] tracking-tight sm:text-7xl">
            Our clear
            <br />
            <em className="text-accent">approach</em>
          </h2>
          <Link
            to="/contact"
            className="grid size-24 shrink-0 -rotate-12 place-items-center rounded-full bg-primary text-center text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-xl transition duration-300 hover:rotate-0 hover:scale-110 sm:size-32 sm:text-sm"
          >
            Get in
            <br />
            touch
          </Link>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-[1fr_2fr] md:items-end">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">Clarity &amp; craft</p>
          <div className="grid gap-6 text-sm leading-relaxed text-white/90 sm:grid-cols-2">
            <p>
              Practical solutions designed around your goals. We explain every step in plain language and agree
              the plan with you before we build anything.
            </p>
            <p>
              The result is a digital presence that is fast, easy to find and built to grow. We focus on
              measurable improvements you can see in your enquiries and sales.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
