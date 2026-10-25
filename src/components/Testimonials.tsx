import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

// Placeholder testimonials: replace with real client quotes.
// Order is left to right; the photo card sits between the second and third.
const TESTIMONIALS = [
  { quote: "They rebuilt our site in weeks and our enquiries doubled. Communication was clear throughout.", name: "Sarah Mitchell", role: "Founder, Brightside" },
  { quote: "The automation they built gives our team hours back every single week. A genuine game-changer.", name: "Daniel Okafor", role: "Ops Lead, Kinetic" },
  { quote: "Our organic traffic tripled in six months. Honest advice, no jargon, real results.", name: "Priya Nair", role: "Marketing Director, Nordic" },
  { quote: "One team for development, SEO and campaigns made everything faster and far less stressful.", name: "Marcus Webb", role: "CEO, Apex Studio" },
];

// Slot offsets from the centre card: two to the left, two to the right.
const SLOTS = [-2, -1, 1, 2];

const CENTER_IMAGE =
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=75";

const cardSize =
  "h-[58vh] max-h-[480px] min-h-[360px] w-[30vw] min-w-[150px] max-w-[320px] sm:w-[18vw]";

function Quote({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const k = SLOTS[index];
  const side = Math.sign(k);
  const outer = Math.abs(k) === 2;
  const t = TESTIMONIALS[index];
  const initials = t.name.split(" ").map((n) => n[0]).join("");

  // One → fanned together → fanned wide → flat row. Outer cards travel further.
  const stops = [0.1, 0.35, 0.6, 0.85];
  const x = useTransform(progress, stops, ["0%", `${k * 55}%`, `${k * 92}%`, `${k * 104}%`]);
  const rotate = useTransform(progress, stops, [0, side * (outer ? 14 : 8), side * (outer ? 20 : 12), 0]);
  const opacity = useTransform(progress, [0.08, 0.2], [0, 1]);

  return (
    <motion.article
      style={{ x, rotate, opacity, transformOrigin: "50% 130%", zIndex: 5 - Math.abs(k) }}
      className={cn(
        "absolute flex flex-col items-center justify-center rounded-2xl border p-5 text-center shadow-lg shadow-primary/5",
        cardSize,
        outer ? "bg-muted max-sm:hidden" : "bg-accent",
      )}
    >
      <p className="text-sm leading-relaxed sm:text-base">&ldquo;{t.quote}&rdquo;</p>
      <span className="mt-6 grid size-14 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
        {initials}
      </span>
      <p className="mt-3 text-sm font-semibold">{t.name}</p>
      <p className="text-xs text-muted-foreground">{t.role}</p>
    </motion.article>
  );
}

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(1);
  // With reduced motion the finished row is shown at once instead of scrubbing.
  const progress = reduce ? still : scrollYProgress;

  return (
    <section
      ref={ref}
      id="testimonials"
      className={cn("relative bg-background", reduce ? "py-20" : "h-[400vh]")}
    >
      <div className={cn("flex flex-col items-center overflow-hidden px-4", reduce ? "" : "sticky top-0 h-screen pt-28")}>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Testimonials</p>
          <h2 className="mt-2 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Loved by <span className="text-primary">our clients</span>
          </h2>
        </div>

        <div className={cn("relative flex w-full items-center justify-center", reduce ? "mt-10 h-[480px]" : "flex-1")}>
          {SLOTS.map((_, i) => (
            <Quote key={i} index={i} progress={progress} />
          ))}
          {/* The photo card stays put in the middle while the others fan out around it. */}
          <img
            src={CENTER_IMAGE}
            alt="Our team at work"
            className={cn("absolute z-10 rounded-2xl object-cover shadow-xl shadow-primary/10", cardSize)}
          />
        </div>
      </div>
    </section>
  );
}
