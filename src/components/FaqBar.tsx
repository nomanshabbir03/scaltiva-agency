import { useId, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A single bar, closed by default. Clicking it reveals `children` in the
 * right half of the page. The content stays in the DOM while closed (collapsed
 * with a CSS grid transition), so crawlers and AI can still read it.
 */
export default function FaqBar({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div>
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl bg-primary px-6 py-8 text-left text-primary-foreground transition hover:opacity-95 sm:px-10"
        >
          <span className="text-3xl font-medium tracking-tight sm:text-5xl">{title}</span>
          <Plus className={cn("size-7 shrink-0 transition-transform duration-300", open && "rotate-45")} />
        </button>
      </h2>

      <div
        id={panelId}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="lg:ml-[50%]">{children}</div>
        </div>
      </div>
    </div>
  );
}
