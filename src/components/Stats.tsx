import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 150, suffix: "+", progress: 100, label: "Projects delivered" },
  { value: 95, suffix: "%", progress: 100, label: "Client satisfaction" },
  { value: 20, suffix: "+", progress: 100, label: "Countries served" },
];

const DURATION = 2000;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function useCountUp(target: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(target);
      return;
    }
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      setCount(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active]);

  return count;
}

function Stat({ value, suffix, label, progress, active }: (typeof STATS)[number] & { active: boolean }) {
  const count = useCountUp(value, active);
  // The ring fills in step with the number, up to `progress` percent.
  const filled = (count / value) * progress;
  const offset = CIRCUMFERENCE * (1 - filled / 100);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative size-40 sm:size-44">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="8" className="stroke-primary/15" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="stroke-primary"
          />
        </svg>
        <p className="absolute inset-0 grid place-items-center text-4xl font-bold tabular-nums tracking-tight">
          <span>
            {count}
            <span className="text-primary">{suffix}</span>
          </span>
        </p>
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  // Toggles on every enter/leave, so the count replays each time the
  // section scrolls back into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="stats" className="bg-background px-5 py-14 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="mx-auto max-w-2xl text-balance text-center text-base text-muted-foreground sm:text-lg">
          Join the businesses that trusted us with their development,
          automation, SEO and marketing.
        </p>
        <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STATS.map((s) => (
            <Stat key={s.label} {...s} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
