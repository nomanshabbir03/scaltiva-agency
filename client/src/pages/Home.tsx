import Seo from "@/components/Seo";
import Hero from "@/components/Hero";
// import Stats from "@/components/Stats";
import Clients from "@/components/Clients";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Work from "@/components/Work";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import CallToAction from "@/components/CallToAction";
import { GENERAL_FAQS } from "@/data/faqs";
import { SERVICES } from "@/data/services";
import { SITE } from "@/lib/site";

export default function Home() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      email: SITE.email,
      description: `${SITE.name} is a digital agency offering ${SERVICES.map((s) => s.name.toLowerCase()).join(", ")}.`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: GENERAL_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <Seo
        title="Scaltiva | Web Development, Automation, SEO & Marketing Agency"
        description="Scaltiva is a digital agency delivering web development, business automation, SEO and digital marketing under one roof. Get a free consultation."
        path="/"
        jsonLd={jsonLd}
      />
      <main id="main-content">
        <Hero />
        {/* <Stats /> */}
        <Clients />
        <Services />
        <HowItWorks />
        <Work />
        <Testimonials />
        <Faq />
        <CallToAction />
      </main>
    </>
  );
}
