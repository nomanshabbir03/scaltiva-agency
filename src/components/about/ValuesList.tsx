import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=500&q=70`;

// Placeholder images: swap for your own.
const VALUES = [
  { title: "Clarity", text: "Plain language, transparent pricing and honest timelines.", image: photo("photo-1519389950473-47ba0277781c") },
  { title: "Quality", text: "We sweat the details, from clean code to well-written content.", image: photo("photo-1498050108023-c5249f4df085") },
  { title: "Partnership", text: "We work as an extension of your team and treat your goals as our own.", image: photo("photo-1522071820081-009f0129c71c") },
  { title: "Results", text: "We measure what we do and focus on outcomes that matter to your business.", image: photo("photo-1460925895917-afdab827c52f") },
  { title: "Curiosity", text: "We keep learning, so you benefit from what works now, not last year.", image: photo("photo-1518770660439-4636190af475") },
];

function Pill({ src, side }: { src: string; side: "left" | "right" }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      className={cn(
        "absolute top-1/2 hidden h-16 w-36 -translate-y-1/2 rounded-full object-cover sm:block lg:h-20 lg:w-44",
        side === "left" ? "left-0" : "right-0",
      )}
    />
  );
}

/** Large centred titles; hovering (or focusing) one turns it italic and pops in two pill images. */
export default function ValuesList() {
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <section className="bg-accent/50 px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Our values</p>

        <ul className="mt-8 border-t" onMouseLeave={() => setActive(null)}>
          {VALUES.map((v, i) => {
            const open = active === i;
            return (
              <li key={v.title} className="relative border-b" onMouseEnter={() => setActive(i)}>
                <button
                  type="button"
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(open ? null : i)}
                  aria-expanded={open}
                  className="relative block w-full px-4 py-7 text-center sm:py-9"
                >
                  <span
                    className={cn(
                      "block text-4xl font-light tracking-tight transition-all duration-300 sm:text-6xl",
                      open ? "italic text-primary" : "text-foreground",
                    )}
                  >
                    {v.title}
                  </span>
                  {/* Kept in the page for everyone; revealed on hover or tap. */}
                  <span
                    className={cn(
                      "mx-auto grid max-w-md transition-[grid-template-rows,opacity] duration-300",
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <span className="overflow-hidden">
                      <span className="block pt-3 text-sm text-muted-foreground">{v.text}</span>
                    </span>
                  </span>
                </button>

                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-full"
                  initial={false}
                  animate={{ opacity: open ? 1 : 0, scaleX: open || reduce ? 1 : 0.6 }}
                  transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
                >
                  <Pill src={v.image} side="left" />
                  <Pill src={v.image} side="right" />
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
