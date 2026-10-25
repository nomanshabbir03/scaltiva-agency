import ServiceFaq from "@/components/ServiceFaq";
import FaqBar from "@/components/FaqBar";
import { GENERAL_FAQS, SUPPORT_TEXT } from "@/data/faqs";

export default function Faq() {
  return (
    <section id="faq" className="bg-background px-5 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl space-y-4">
        <ServiceFaq title="Frequently asked questions" faqs={GENERAL_FAQS} />
        <FaqBar title="24/7 Support">
          <p className="py-8 leading-relaxed text-muted-foreground">{SUPPORT_TEXT}</p>
        </FaqBar>
      </div>
    </section>
  );
}
