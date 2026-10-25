import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=75`;

// Placeholder images: swap for real photos of your team and workspace.
const SLIDES = [
  {
    word: "clarity",
    text: "Plain language, clear plans and honest timelines. You always know what is happening, why, and what comes next.",
    image: photo("photo-1522071820081-009f0129c71c"),
    alt: "Team members planning together at laptops",
  },
  {
    word: "craft",
    text: "From clean code to well-written content, we sweat the details because the small things add up to a great result.",
    image: photo("photo-1504384308090-c894fdcc538d"),
    alt: "A tidy creative workspace",
  },
  {
    word: "care",
    text: "We treat your goals as our own and stay with you after launch, improving what we built with real data.",
    image: photo("photo-1497366216548-37526070297c"),
    alt: "A bright, modern office",
  },
];

export default function InsideSlider() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const slide = SLIDES[i];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="px-5 py-16 lg:py-24">
      <div className="mx-auto grid min-h-[560px] max-w-6xl overflow-hidden rounded-3xl bg-primary text-primary-foreground md:grid-cols-[5fr_6fr]">
        {/* Text panel */}
        <div className="flex flex-col justify-between p-8 sm:p-12">
          <div aria-live="polite">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">Inside Scaltiva</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={i}
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -16 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mt-5 text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
                  How we work
                  <br />
                  with <em className="text-accent">{slide.word}</em>
                </h2>
                <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/85">{slide.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="mt-10 text-6xl font-light tabular-nums sm:text-7xl" aria-label={`Slide ${i + 1} of ${SLIDES.length}`}>
            {pad(i + 1)}
            <span className="text-2xl text-white/60 sm:text-3xl">/{pad(SLIDES.length)}</span>
          </p>
        </div>

        {/* Image panel */}
        <div className="relative min-h-[340px] bg-black/10">
          <AnimatePresence initial={false}>
            <motion.img
              key={i}
              src={slide.image}
              alt={slide.alt}
              initial={{ opacity: 0, scale: reduce ? 1 : 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.7, ease: "easeOut" }}
              className="absolute inset-0 size-full object-cover"
            />
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={() => setI((n) => (n + 1) % SLIDES.length)}
            whileHover={reduce ? undefined : { scale: 1.08 }}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            aria-label="Next slide"
            className="absolute bottom-6 right-6 grid size-28 place-items-center rounded-full bg-background text-sm font-semibold uppercase tracking-wide text-primary shadow-xl sm:bottom-10 sm:right-10 sm:size-32"
          >
            <span className="flex items-center gap-1.5">
              Next <ArrowRight className="size-4" />
            </span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
