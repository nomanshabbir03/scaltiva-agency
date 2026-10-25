import { useState, type FormEvent } from "react";
import axios from "axios";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { SERVICES } from "@/data/services";
import { absoluteUrl, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const PATH = "/contact";
const TITLE = "Contact Scaltiva | Get a Free Quote & Consultation";
const DESCRIPTION =
  "Contact Scaltiva for a free consultation and quote on web development, automation, SEO or digital marketing. Tell us about your project.";

type Status = "idle" | "sending" | "success" | "error";

const field =
  "mt-2 w-full rounded-xl border bg-background px-4 py-3 text-base outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30";

export default function Contact() {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // Hidden "website" field: real people leave it empty, many bots fill it in.
    if (data.get("website")) {
      setStatus("success");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await axios.post("/api/contact", {
        name: data.get("name"),
        email: data.get("email"),
        service: data.get("service"),
        message: data.get("message"),
      });
      setStatus("success");
      form.reset();
    } catch (err) {
      const apiMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(apiMessage ?? `Something went wrong. Please try again or email us at ${SITE.email}.`);
      setStatus("error");
    }
  }

  const fadeUp = (delay = 0) => ({
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: reduce ? 0 : delay, ease: "easeOut" as const },
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: TITLE,
      description: DESCRIPTION,
      url: absoluteUrl(PATH),
      mainEntity: { "@type": "Organization", name: SITE.name, url: SITE.url, email: SITE.email },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Contact", item: absoluteUrl(PATH) },
      ],
    },
  ];

  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} path={PATH} jsonLd={jsonLd} />
      <PageHeader
        crumbs={[{ label: "Contact" }]}
        title={
          <>
            Let&apos;s <span className="text-primary">talk</span>
          </>
        }
        intro="Tell us about your project and get a free consultation and a clear quote. No pressure, no obligation."
      />

      <main id="main-content" className="px-5 py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <motion.div className="rounded-3xl border bg-background p-6 shadow-xl shadow-primary/5 sm:p-10" {...fadeUp()}>
            {status === "success" ? (
              <div role="status" className="py-10 text-center">
                <CheckCircle2 className="mx-auto size-16 text-primary" />
                <h2 className="mt-5 text-3xl font-bold">Thank you, we got your message</h2>
                <p className="mt-3 text-muted-foreground">
                  We will review your details and get back to you soon. You can also reach us at{" "}
                  <a href={`mailto:${SITE.email}`} className="font-semibold text-primary hover:underline">
                    {SITE.email}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-8 rounded-lg border px-6 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate={false} className="space-y-6">
                <h2 className="text-2xl font-semibold">Send us a message</h2>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="text-sm font-semibold">Your name</label>
                    <input id="name" name="name" required autoComplete="name" placeholder="Jane Smith" className={field} />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-semibold">Email address</label>
                    <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={field} />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="text-sm font-semibold">What do you need help with?</label>
                  <select id="service" name="service" defaultValue="other" className={field}>
                    {SERVICES.map((s) => (
                      <option key={s.slug} value={s.slug}>{s.name}</option>
                    ))}
                    <option value="other">Something else / not sure yet</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="text-sm font-semibold">Tell us about your project</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    minLength={10}
                    placeholder="What are you trying to achieve? Any deadlines or budget in mind?"
                    className={cn(field, "resize-y")}
                  />
                </div>

                {/* Honeypot: hidden from people and screen readers. */}
                <div aria-hidden className="absolute -left-[9999px]">
                  <label htmlFor="website">Leave this empty</label>
                  <input id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                {status === "error" && (
                  <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "sending" ? "Sending..." : "Send message"} <Send className="size-4" />
                </button>
              </form>
            )}
          </motion.div>

          {/* Details */}
          <motion.aside className="space-y-6" {...fadeUp(0.15)}>
            <ul className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
                { icon: Phone, label: "Phone", value: "+1 (000) 000-0000", href: "tel:+10000000000" },
                { icon: MapPin, label: "Location", value: "Your city, Country" },
                { icon: Clock, label: "Response time", value: "We aim to reply within one business day" },
              ].map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4 rounded-2xl border bg-background p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                    {href ? (
                      <a href={href} className="mt-0.5 block break-words font-medium hover:text-primary">{value}</a>
                    ) : (
                      <p className="mt-0.5 font-medium">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl bg-accent p-6">
              <h2 className="text-lg font-semibold">What happens next?</h2>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "We read your message and reply to book a free consultation.",
                  "We learn about your goals and send a clear proposal and quote.",
                  "You approve, and we get started.",
                ].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            </div>
          </motion.aside>
        </div>
      </main>
    </>
  );
}
