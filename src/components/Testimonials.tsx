import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
  type Variants,
} from "motion/react";
import { Pause, Play, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const portrait = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=faces&w=640&h=640&q=75`;

// Placeholder testimonials and stock portraits: replace with real clients before launch.
const TESTIMONIALS = [
  {
    title: "Enquiries doubled",
    quote: "They rebuilt our site in weeks and our enquiries doubled. Communication was clear throughout.",
    name: "Sarah Mitchell",
    role: "Founder, Brightside",
    image: portrait("photo-1494790108377-be9c29b29330"),
  },
  {
    title: "Hours back every week",
    quote: "The automation they built gives our team hours back every single week. A genuine game-changer.",
    name: "Daniel Okafor",
    role: "Ops Lead, Kinetic",
    image: portrait("photo-1507003211169-0a1dd7228f2d"),
  },
  {
    title: "Organic traffic tripled",
    quote: "Our organic traffic tripled in six months. Honest advice, no jargon, real results.",
    name: "Priya Nair",
    role: "Marketing Director, Nordic",
    image: portrait("photo-1573497019940-1c28c88b4f3e"),
  },
  {
    title: "One team, less stress",
    quote: "One team for development, SEO and campaigns made everything faster and far less stressful.",
    name: "Marcus Webb",
    role: "CEO, Apex Studio",
    image: portrait("photo-1560250097-0b93528c311a"),
  },
];

const COUNT = TESTIMONIALS.length;
const DURATION = 6000;
const EASE = [0.4, 0, 0.2, 1] as const;

const wrap = (n: number) => ((n % COUNT) + COUNT) % COUNT;

// `custom` is the direction of travel: 1 slides in from the right, -1 from the left.
const slide: Variants = {
  enter: (direction: number) => ({ x: `${direction * 100}%`, opacity: 0 }),
  center: { x: "0%", opacity: 1 },
  exit: (direction: number) => ({ x: `${direction * -100}%`, opacity: 0 }),
};

function Review({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <figure>
      <Quote aria-hidden="true" className="size-12 rotate-180 fill-white text-white" />
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="text-base">
          <span className="font-bold">{t.name}</span> <span aria-hidden="true">-</span> {t.role}
        </p>
        <span role="img" aria-label="Rated 5 out of 5" className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} aria-hidden="true" className="size-5 fill-amber-200 text-amber-200" />
          ))}
        </span>
      </figcaption>
      <h3 className="mt-4 text-2xl font-bold uppercase tracking-tight sm:text-4xl">{t.title}</h3>
      <blockquote className="mt-3 text-base leading-relaxed sm:text-xl">{t.quote}</blockquote>
      <Quote aria-hidden="true" className="ml-auto mt-4 size-12 fill-white text-white" />
    </figure>
  );
}

function Dash({
  name,
  active,
  progress,
  onSelect,
}: {
  name: string;
  active: boolean;
  progress: MotionValue<number>;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Show review from ${name}`}
      aria-current={active}
      className="grid h-11 place-items-center"
    >
      <span
        className={cn(
          "block h-1.5 overflow-hidden rounded-full bg-white/40 transition-[width] duration-500",
          active ? "w-16" : "w-6 hover:bg-white/70",
        )}
      >
        <motion.span
          style={{ scaleX: active ? progress : 0, transformOrigin: "0% 50%" }}
          className="block h-full rounded-full bg-white"
        />
      </span>
    </button>
  );
}

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion() ?? false;
  const elapsed = useMotionValue(0);
  const [{ active, direction }, setView] = useState({ active: 0, direction: 1 });
  const [stopped, setStopped] = useState(false);
  const [hovering, setHovering] = useState(false);

  const autoplay = !reduce && !stopped;

  const go = (next: number, towards: number) => {
    elapsed.set(0);
    setView({ active: wrap(next), direction: towards });
  };

  useAnimationFrame((_, delta) => {
    if (!autoplay || hovering || !inView) return;
    const next = elapsed.get() + delta / DURATION;
    if (next >= 1) go(active + 1, 1);
    else elapsed.set(next);
  });

  // Fetch every portrait up front so a slide never arrives with an empty circle.
  useEffect(() => {
    TESTIMONIALS.forEach((t) => {
      new Image().src = t.image;
    });
  }, []);

  const t = TESTIMONIALS[active];
  const transition = { duration: reduce ? 0 : 0.7, ease: EASE };

  return (
    <section ref={ref} id="testimonials" className="bg-background px-5 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Testimonials</p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Loved by <span className="text-primary">our clients</span>
          </h2>
        </motion.div>

        <motion.div
          className="mt-12 grid items-center gap-14 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-orange-700 to-orange-800 px-6 py-16 text-white shadow-2xl shadow-primary/20 sm:px-12 lg:grid-cols-[2fr_3fr] lg:gap-16 lg:px-16"
          initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocus={(e) => e.target.matches(":focus-visible") && setHovering(true)}
          onBlur={() => setHovering(false)}
        >
          <div className="relative mx-auto size-60 sm:size-72 lg:size-80">
            {/* The two bars shift a little with each slide, opposite ways. */}
            <motion.span
              aria-hidden="true"
              animate={{ y: reduce ? 0 : active % 2 ? 14 : -14 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="absolute -top-[6%] left-[3%] h-[34%] w-[13%] rounded-full bg-orange-200"
            />
            <motion.span
              aria-hidden="true"
              animate={{ y: reduce ? 0 : active % 2 ? -14 : 14 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="absolute -bottom-[14%] -top-[8%] left-[20%] w-[13%] rounded-full bg-orange-300"
            />

            <div className="absolute inset-0 overflow-hidden rounded-full bg-orange-900 shadow-xl">
              <AnimatePresence custom={direction} initial={false}>
                <motion.img
                  key={active}
                  src={t.image}
                  alt={t.name}
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  className="absolute inset-0 size-full object-cover"
                />
              </AnimatePresence>
            </div>
          </div>

          <div className="min-w-0">
            {/* The hidden copies hold the height of the longest review, so nothing jumps. */}
            <div className="relative overflow-hidden">
              <div aria-hidden="true" className="invisible grid">
                {TESTIMONIALS.map((item) => (
                  <div key={item.name} className="[grid-area:1/1]">
                    <Review t={item} />
                  </div>
                ))}
              </div>
              <AnimatePresence custom={direction} initial={false}>
                <motion.div
                  key={active}
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  className="absolute inset-0"
                >
                  <Review t={t} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((item, i) => (
                  <Dash
                    key={item.name}
                    name={item.name}
                    active={i === active}
                    progress={elapsed}
                    onSelect={() => i !== active && go(i, i > active ? 1 : -1)}
                  />
                ))}
              </div>
              {!reduce && (
                <button
                  type="button"
                  onClick={() => setStopped((s) => !s)}
                  aria-label={stopped ? "Play testimonials" : "Pause testimonials"}
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-white/40 transition hover:bg-white hover:text-primary"
                >
                  {stopped ? <Play className="size-4" /> : <Pause className="size-4" />}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
