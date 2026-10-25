import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

const IMAGES = [
  { src: unsplash("photo-1498050108023-c5249f4df085"), alt: "Developer coding on a laptop" },
  { src: unsplash("photo-1460925895917-afdab827c52f"), alt: "Analytics dashboard on a desk" },
  { src: unsplash("photo-1518770660439-4636190af475"), alt: "Circuit board close-up" },
  { src: unsplash("photo-1551288049-bebda4e38f71"), alt: "Data charts on a screen" },
  { src: unsplash("photo-1519389950473-47ba0277781c"), alt: "Team working together" },
  { src: unsplash("photo-1432888498266-38ffec3eaf0a"), alt: "Marketing planning workspace" },
  { src: unsplash("photo-1504384308090-c894fdcc538d"), alt: "Creative office workspace" },
  { src: unsplash("photo-1486312338219-ce68d2c6f44d"), alt: "Laptop and notes on a table" },
];

export default function Hero() {
  return (
    <TiltedGridHero
      images={IMAGES}
      className="h-[640px] w-full bg-background"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between pb-14 pt-28 text-center">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-6xl">
            Digital growth,
            <br />
            <span className="text-primary">built end to end.</span>
          </h1>
        </div>
        <div className="flex flex-col items-center gap-5 px-6">
          <p className="max-w-md text-balance text-sm text-muted-foreground">
            Development, automation, SEO and marketing, delivered by one team.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Start a project <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </TiltedGridHero>
  );
}
