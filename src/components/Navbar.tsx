import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { SERVICES } from "@/data/services";
import { cn } from "@/lib/utils";

// Section links use "/#id" so they also work from inner pages.
const LINKS = [
  { label: "Work", href: "/work" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const linkClass =
  "text-sm font-semibold uppercase tracking-wide text-foreground/80 transition hover:text-primary";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Scaltiva home">
      <span className="grid size-10 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
        S
      </span>
      <span className="text-2xl font-light uppercase tracking-[0.2em]">Scaltiva</span>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-3 top-4 z-50 mx-auto max-w-7xl rounded-2xl border bg-background/85 backdrop-blur-md transition-shadow sm:inset-x-5",
        scrolled ? "shadow-md shadow-primary/10" : "shadow-sm",
      )}
    >
      <nav className="flex h-16 items-center justify-between px-4 lg:px-6" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-9 lg:flex">
          <li className="group relative">
            <button type="button" className={cn(linkClass, "flex items-center gap-1 py-5")}>
              Services
              <ChevronDown className="size-4 transition group-has-[:focus-visible]:rotate-180 group-hover:rotate-180" />
            </button>
            {/* Mega menu: pops in with a small scale, then the cards stagger up. */}
            <div className="invisible absolute left-1/2 top-full w-[34rem] -translate-x-1/2 origin-top scale-95 overflow-hidden rounded-2xl border bg-background opacity-0 shadow-2xl shadow-primary/15 transition duration-200 group-has-[:focus-visible]:visible group-has-[:focus-visible]:scale-100 group-has-[:focus-visible]:opacity-100 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
              <ul className="grid grid-cols-2 gap-2 p-3">
                {SERVICES.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li
                      key={s.slug}
                      className="translate-y-3 opacity-0 transition duration-300 group-has-[:focus-visible]:translate-y-0 group-has-[:focus-visible]:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
                      style={{ transitionDelay: `${60 + i * 60}ms` }}
                    >
                      <Link
                        to={`/services/${s.slug}`}
                        className="group/item flex items-start gap-3 rounded-xl p-3 transition hover:bg-accent"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-primary transition duration-300 group-hover/item:-rotate-6 group-hover/item:scale-110 group-hover/item:bg-primary group-hover/item:text-primary-foreground">
                          <Icon className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1 text-sm font-semibold normal-case tracking-normal text-foreground">
                            {s.name}
                            <ArrowRight className="size-3.5 -translate-x-1 text-primary opacity-0 transition duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                          </span>
                          <span className="mt-0.5 block text-xs font-normal normal-case leading-snug tracking-normal text-muted-foreground">
                            {s.blurb}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                to="/contact"
                className="flex items-center justify-between bg-accent px-6 py-3.5 text-sm font-medium normal-case tracking-normal text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
              >
                Not sure what you need? Get a free consultation
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </li>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link to={l.href} className={linkClass}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            to="/contact"
            className="hidden rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:opacity-90 lg:inline-block"
          >
            Get a Quote
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg hover:bg-accent lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t px-4 pb-5 pt-3 lg:hidden">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Services</p>
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              onClick={close}
              className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent"
            >
              {s.name}
            </Link>
          ))}
          <div className="my-2 border-t" />
          {LINKS.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={close}
              className="block rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-accent"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={close}
            className="mt-3 block rounded-lg bg-primary px-5 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground"
          >
            Get a Quote
          </Link>
        </div>
      )}
    </header>
  );
}
