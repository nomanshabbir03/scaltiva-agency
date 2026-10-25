import { useId, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = { question: string; answer: ReactNode };

type Props = {
  items: FaqItem[];
  /** "lg" for big section rows, "md" for a question list, "sm" for nested lists. */
  size?: "lg" | "md" | "sm";
  className?: string;
};

/**
 * Click-to-open accordion, everything closed by default. Answers stay in the
 * DOM while closed (collapsed with a CSS grid transition, not unmounted), so
 * crawlers and AI engines can still read them.
 */
export default function FaqAccordion({ items, size = "lg", className }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const uid = useId();

  return (
    <div className={cn("divide-y border-y", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-panel-${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  "group flex w-full items-center justify-between gap-6 text-left",
                  size === "lg" ? "py-7" : size === "md" ? "py-8" : "py-5",
                )}
              >
                <span
                  className={cn(
                    "transition-colors group-hover:text-primary",
                    size === "lg" && "text-2xl font-medium tracking-tight sm:text-4xl",
                    size === "md" && "text-lg font-medium sm:text-xl",
                    size === "sm" && "text-lg font-semibold",
                    isOpen && "text-primary",
                  )}
                >
                  {item.question}
                </span>
                <Plus
                  className={cn(
                    "shrink-0 text-primary transition-transform duration-300",
                    size === "lg" ? "size-7" : size === "md" ? "size-6" : "size-5",
                    isOpen && "rotate-45",
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className={cn("text-muted-foreground", size === "lg" ? "pb-8" : "pb-5 leading-relaxed")}>
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
