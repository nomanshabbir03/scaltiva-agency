import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  const reduce = useReducedMotion();

  return (
    <section id="contact" className="bg-background px-5 py-20 lg:py-28">
      <motion.div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-24"
        initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 40, scale: reduce ? 1 : 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Drifting decorative circles. */}
        <motion.span
          aria-hidden
          className="absolute -left-24 -top-24 size-80 rounded-full bg-white/10"
          animate={reduce ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          aria-hidden
          className="absolute -bottom-32 -right-20 size-96 rounded-full bg-white/10"
          animate={reduce ? undefined : { x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative">
          <h2 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Ready to grow your business?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-white/85">
            Tell us about your project and get a free consultation and quote within 24 hours.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.a
              href="/contact"
              whileHover={reduce ? undefined : { scale: 1.05 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-background px-8 py-4 text-sm font-bold uppercase tracking-wide text-primary shadow-lg"
            >
              Get a free quote <ArrowRight className="size-4" />
            </motion.a>
            <a
              href="mailto:hello@scaltiva.com"
              className="text-sm font-semibold underline-offset-4 hover:underline"
            >
              or email hello@scaltiva.com
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
