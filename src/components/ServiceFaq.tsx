import FaqAccordion from "@/components/FaqAccordion";
import FaqBar from "@/components/FaqBar";

type Props = { title: string; faqs: { q: string; a: string }[] };

/** "<Service> FAQs" bar: closed by default, click to reveal the questions. */
export default function ServiceFaq({ title, faqs }: Props) {
  return (
    <FaqBar title={title}>
      <FaqAccordion
        size="md"
        items={faqs.map((f) => ({ question: f.q, answer: <p className="leading-relaxed">{f.a}</p> }))}
      />
    </FaqBar>
  );
}
