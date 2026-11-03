import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { input, primaryButton, secondaryButton } from "@/components/portal/form";

export type Option = { id: string; title: string; subtitle?: string };

type Props = {
  /** Things that can still be added (already-enrolled ones filtered out by the caller). */
  options: Option[];
  noun: string;
  onEnroll: (ids: string[]) => Promise<void>;
  onClose: () => void;
};

// Searchable checkbox list for enrolling several students (or courses) at once.
export default function EnrollPicker({ options, noun, onEnroll, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const term = search.trim().toLowerCase();
  const shown = options.filter((o) => !term || `${o.title} ${o.subtitle ?? ""}`.toLowerCase().includes(term));

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function submit() {
    setSaving(true);
    await onEnroll([...selected]);
    setSaving(false);
  }

  return (
    <div className="rounded-3xl border bg-muted/50 p-4 sm:p-6">
      {options.length === 0 ? (
        <p className="text-muted-foreground">There are no more {noun}s to add.</p>
      ) : (
        <>
          <div className="relative">
            <label htmlFor="enroll-search" className="sr-only">Search {noun}s</label>
            <Search className="pointer-events-none absolute left-5 top-1/2 mt-1 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="enroll-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${noun}s...`}
              className={`${input} pl-11`}
            />
          </div>
          <ul className="mt-3 max-h-72 divide-y overflow-y-auto rounded-2xl border bg-background">
            {shown.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No matches.</li>}
            {shown.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent">
                  <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} className="size-5 shrink-0 accent-[var(--primary)]" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{o.title}</span>
                    {o.subtitle && <span className="block truncate text-sm text-muted-foreground">{o.subtitle}</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        {options.length > 0 && (
          <button type="button" onClick={submit} disabled={saving || selected.size === 0} className={primaryButton}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Enroll {selected.size || ""}
          </button>
        )}
        <button type="button" onClick={onClose} className={secondaryButton}>
          {options.length > 0 ? "Cancel" : "Close"}
        </button>
      </div>
    </div>
  );
}
