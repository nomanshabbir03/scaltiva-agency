import { useState, type FormEvent } from "react";
import axios from "axios";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Seo from "@/components/Seo";
import ServiceFaq from "@/components/ServiceFaq";
import { SERVICES } from "@/data/services";
import { absoluteUrl, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const PATH = "/contact";
const TITLE = "Contact Scaltiva | Get a Free Quote & Consultation";
const DESCRIPTION =
  "Contact Scaltiva for a free consultation and quote on web development, automation, SEO or digital marketing. Tell us about your project.";

const FAQS = [
  { q: "How quickly will you reply?", a: "We aim to reply within one business day. If your project is urgent, mention it in your message and we will prioritise it." },
  { q: "What should I include in my message?", a: "A few lines about your business, what you want to achieve and any deadline or budget in mind. The more detail you share, the more useful our first reply will be." },
  { q: "Is the first consultation free?", a: "Yes. The first consultation is free and carries no obligation. It is a chance for both of us to see whether we are a good fit." },
  { q: "I am not sure which service I need. Can you help?", a: "Absolutely. Choose 'Something else / not sure yet' in the form and describe your goal. We will recommend the right mix of development, automation, SEO and marketing." },
  { q: "Can I get a quote without a call?", a: "Yes. Send us the details in the form and we can prepare an initial quote by email. For larger projects we usually suggest a short call to get the scope right." },
];

type Status = "idle" | "sending" | "success" | "error";

const input =
  "mt-2 w-full rounded-full border bg-background px-5 py-3.5 text-base outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30";
const label = "text-sm font-medium";

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
        name: `${data.get("firstName") ?? ""} ${data.get("lastName") ?? ""}`.trim(),
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
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
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

      <main id="main-content">
        {/* Get in touch */}
        <section className="bg-muted px-5 pb-20 pt-36 lg:pb-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div {...fadeUp()}>
              <h1 className="text-5xl font-medium leading-[1.05] tracking-tight sm:text-7xl">
                Get in
                <span aria-hidden className="mx-4 inline-block h-1 w-12 rounded-full bg-primary align-middle sm:w-20" />
                <br />
                touch <span className="text-primary">with us</span>
              </h1>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-foreground/80">
                We&apos;re here to help! Whether you have a question about our services, want a quote for a
                project, or just want to talk through an idea, our team is ready to assist you.
              </p>

              <dl className="mt-8 space-y-6">
                <div>
                  <dt className="text-foreground/70">Email:</dt>
                  <dd className="mt-1 text-2xl">
                    <a href={`mailto:${SITE.email}`} className="transition hover:text-primary">{SITE.email}</a>
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/70">Phone:</dt>
                  <dd className="mt-1 text-2xl">
                    <a href={`tel:+${SITE.whatsapp}`} className="transition hover:text-primary">{SITE.whatsappDisplay}</a>
                  </dd>
                  <dd className="mt-1 text-sm text-muted-foreground">Available Monday to Friday, 9 AM - 6 PM</dd>
                </div>
              </dl>

              <a
                href={`mailto:${SITE.email}`}
                className="group mt-10 inline-flex items-center gap-4 rounded-full bg-primary py-2 pl-6 pr-2 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition hover:opacity-95"
              >
                Email us
                <span className="grid size-10 place-items-center rounded-full bg-background text-primary transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="size-5" />
                </span>
              </a>
            </motion.div>

            {/* Form card */}
            <motion.div className="rounded-[2rem] bg-background p-6 shadow-xl shadow-primary/5 sm:p-10" {...fadeUp(0.15)}>
              {status === "success" ? (
                <div role="status" className="py-16 text-center">
                  <CheckCircle2 className="mx-auto size-16 text-primary" />
                  <h2 className="mt-5 text-3xl font-semibold">Thank you, we got your message</h2>
                  <p className="mt-3 text-muted-foreground">
                    We will review your details and get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-8 rounded-full border px-6 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className={label}>First name</label>
                      <input id="firstName" name="firstName" required autoComplete="given-name" placeholder="Enter your first name..." className={input} />
                    </div>
                    <div>
                      <label htmlFor="lastName" className={label}>Last name</label>
                      <input id="lastName" name="lastName" autoComplete="family-name" placeholder="Enter your last name..." className={input} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className={label}>Email</label>
                    <input id="email" name="email" type="email" required autoComplete="email" placeholder="Enter your email address..." className={input} />
                  </div>

                  <div>
                    <label htmlFor="service" className={label}>What do you need?</label>
                    <select id="service" name="service" defaultValue="other" className={input}>
                      {SERVICES.map((s) => (
                        <option key={s.slug} value={s.slug}>{s.name}</option>
                      ))}
                      <option value="other">Something else / not sure yet</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className={label}>How can we help you?</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      minLength={10}
                      placeholder="Enter your message..."
                      className={cn(input, "resize-y rounded-3xl")}
                    />
                  </div>

                  {/* Honeypot: hidden from people and screen readers. */}
                  <div aria-hidden className="absolute -left-[9999px]">
                    <label htmlFor="website">Leave this empty</label>
                    <input id="website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>

                  {status === "error" && (
                    <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </p>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group inline-flex items-center gap-4 rounded-full bg-primary py-2 pl-6 pr-2 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "sending" ? "Sending..." : "Send Message"}
                      <span className="grid size-10 place-items-center rounded-full bg-background text-primary transition-transform group-hover:translate-x-0.5">
                        <ArrowRight className="size-5" />
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </section>

        {/* FAQs: same click-to-open bar as the rest of the site */}
        <section className="px-5 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <ServiceFaq title="Contact FAQs" faqs={FAQS} />
          </div>
        </section>
      </main>
    </>
  );
}
