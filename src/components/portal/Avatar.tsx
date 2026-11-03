import { cn } from "@/lib/utils";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Profile picture, or the person's initials when there isn't one.
export default function Avatar({ url, name, className }: { url?: string | null; name: string; className?: string }) {
  return url ? (
    <img src={url} alt="" className={cn("shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground", className)} aria-hidden>
      {initialsOf(name)}
    </span>
  );
}
