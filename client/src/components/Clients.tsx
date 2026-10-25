import { Box, Compass, Infinity as InfinityIcon, Shield, Zap, type LucideIcon } from "lucide-react";

// Placeholder companies: replace with real clients (name + icon, or swap
// the icon for an <img> logo).
const CLIENTS: { name: string; icon: LucideIcon }[] = [
  { name: "Vortex", icon: Box },
  { name: "Kinetic", icon: Zap },
  { name: "ApexLabs", icon: Shield },
  { name: "Nordic", icon: Compass },
  { name: "Synergy", icon: InfinityIcon },
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-16 pr-16" aria-hidden={hidden}>
      {CLIENTS.map(({ name, icon: Icon }) => (
        <li
          key={name}
          className="flex items-center gap-2.5 text-2xl font-bold uppercase tracking-tight text-muted-foreground/70"
        >
          <Icon className="size-7" />
          {name}
        </li>
      ))}
    </ul>
  );
}

export default function Clients() {
  return (
    <section className="bg-background px-5 py-14">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Trusted by industry-leading innovators worldwide
      </p>
      <div
        className="mt-10 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
      >
        {/* Two identical rows; shifting by half the track loops seamlessly. */}
        <div className="flex w-max animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused]">
          <Row />
          <Row hidden />
          <Row hidden />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}
