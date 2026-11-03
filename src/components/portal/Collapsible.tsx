import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { card } from "@/components/portal/form";

// A card that starts closed and opens when its header is clicked.
export default function Collapsible({ title, meta, children }: { title: string; meta?: ReactNode; children: ReactNode }) {
  return (
    <details className={`${card} group mt-4 p-0 sm:p-0`}>
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-[2rem] px-6 py-5 transition hover:bg-accent/60 sm:px-8 [&::-webkit-details-marker]:hidden">
        <h2 className="flex-1 text-xl font-semibold">{title}</h2>
        {meta && <span className="text-sm text-muted-foreground">{meta}</span>}
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t px-6 pb-6 pt-2 sm:px-8 sm:pb-8">{children}</div>
    </details>
  );
}
