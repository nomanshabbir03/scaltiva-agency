import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronRight, X, type LucideIcon } from "lucide-react";

type Props = { title: string; description: string; icon: LucideIcon; meta?: ReactNode; children: ReactNode };

// A card that opens its content in a scrollable pop-up window.
// The content only mounts while the window is open, so it loads on demand.
export default function SectionCard({ title, description, icon: Icon, meta, children }: Props) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const button = trigger.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    // Keep the page behind still while the window scrolls.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      button?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-4 bg-background p-5 text-left shadow-xl shadow-primary/5 transition hover:-translate-y-0.5 hover:shadow-primary/15 sm:p-6"
      >
        <span className="grid size-12 shrink-0 place-items-center bg-accent text-primary">
          <Icon className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold">{title}</span>
          <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
          {meta && <span className="mt-1.5 block text-sm font-medium text-primary">{meta}</span>}
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-3 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="flex max-h-[90vh] w-full max-w-3xl flex-col bg-background shadow-2xl outline-none"
          >
            <div className="flex items-center gap-3 border-b px-5 py-4 sm:px-6">
              <Icon className="size-5 shrink-0 text-primary" />
              <h2 id={titleId} className="flex-1 text-xl font-semibold">{title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full transition hover:bg-accent hover:text-primary"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 pb-6 pt-2 sm:px-6">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
