import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Services",
    links: [
      { label: "Development", href: "/services/development" },
      { label: "Automation", href: "/services/automation" },
      { label: "SEO", href: "/services/seo" },
      { label: "Marketing", href: "/services/marketing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Our Work", href: "/work" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

// lucide no longer ships brand icons, so these are drawn inline.
const SOCIALS = [
  {
    label: "Facebook",
    href: SITE.socials.facebook,
    icon: (
      <path d="M14 8h2V5h-2.5C10.9 5 10 6.600 10 8.500V10H8v3h2v7h3v-7h2.200l.5-3H13V8.700c0-.4.2-.7 1-.7z" fill="currentColor" />
    ),
  },
  {
    label: "Instagram",
    href: SITE.socials.instagram,
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.500" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="16.800" cy="7.200" r="1.100" fill="currentColor" />
      </>
    ),
  },
  {
    label: "LinkedIn",
    href: SITE.socials.linkedin,
    icon: (
      <>
        <circle cx="6" cy="6" r="2" fill="currentColor" />
        <rect x="4" y="9" width="4" height="11" fill="currentColor" />
        <path d="M10 9h4v1.600c.6-1 1.800-1.800 3.300-1.800 2.600 0 3.700 1.600 3.700 4.300V20h-4v-6c0-1.300-.5-2-1.600-2S14 12.800 14 14v6h-4z" fill="currentColor" />
      </>
    ),
  },
];

const headingClass = "text-sm font-bold uppercase tracking-wide";
const linkClass = "text-sm text-muted-foreground transition hover:text-primary";

export default function Footer() {
  const reduce = useReducedMotion();

  return (
    <footer className="overflow-hidden border-t bg-background px-5 pt-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="col-span-2 sm:col-span-1">
          <p className="text-sm font-medium">Let&apos;s grow together</p>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-primary" />
              <a href={`mailto:${SITE.email}`} className="hover:text-primary">{SITE.email}</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-primary" />
              <a href={`tel:+${SITE.whatsapp}`} className="hover:text-primary">{SITE.whatsappDisplay}</a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-4 shrink-0 text-primary" />
              <a href="#" className="hover:text-primary">Find us on Google Maps</a>
            </li>
          </ul>
        </div>

        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className={headingClass}>{c.title}</h3>
            <ul className="mt-5 space-y-3">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className={headingClass}>Follow</h3>
          <ul className="mt-5 flex gap-4">
            {SOCIALS.filter((s) => s.href).map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-11 place-items-center rounded-full text-foreground transition hover:bg-primary hover:text-primary-foreground"
                >
                  <svg viewBox="0 0 24 24" className="size-7">
                    {s.icon}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-14 max-w-7xl text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Scaltiva. All rights reserved.
      </p>

      <div className="mx-auto mt-8 max-w-7xl border-t" />

      {/* The company name, stretched edge to edge at any screen width. */}
      <motion.svg
        viewBox="0 0 1000 190"
        className="mx-auto mt-10 block w-full max-w-7xl"
        role="img"
        aria-label="Scaltiva"
        initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <text
          x="0"
          y="175"
          fontSize="230"
          fontWeight="800"
          textLength="1000"
          lengthAdjust="spacing"
          className="fill-primary"
        >
          SCALTIVA
        </text>
      </motion.svg>
    </footer>
  );
}
