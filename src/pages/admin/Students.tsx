import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { card, errorBox, input } from "@/components/portal/form";

type Row = {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  enrollments: { count: number }[];
};

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        active ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground",
      )}
    >
      {active ? "Active" : "Disabled"}
    </span>
  );
}

export default function Students() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name, email, is_active, enrollments(count)")
      .eq("role", "student")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError("Couldn't load students. Please refresh the page.");
        setRows((data as Row[] | null) ?? []);
      });
  }, []);

  const term = search.trim().toLowerCase();
  const shown = rows?.filter((r) => !term || r.full_name.toLowerCase().includes(term) || r.email.includes(term));

  return (
    <div>
      <title>Students | Scaltiva admin</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Students</h1>
        <Link
          to="/admin/students/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-95"
        >
          <Plus className="size-4" />
          New student
        </Link>
      </div>

      <div className="relative mt-6 max-w-md">
        <label htmlFor="search" className="sr-only">Search students</label>
        <Search className="pointer-events-none absolute left-5 top-1/2 mt-1 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className={cn(input, "pl-11")}
        />
      </div>

      {error && <p role="alert" className={cn(errorBox, "mt-6")}>{error}</p>}

      <div className={cn(card, "mt-6 p-0 sm:p-0 overflow-hidden")}>
        {!shown ? (
          <div className="grid place-items-center py-16" role="status" aria-label="Loading">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : shown.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            {rows?.length ? "No students match your search." : "No students yet. Create the first one."}
          </p>
        ) : (
          <ul className="divide-y">
            {shown.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/admin/students/${s.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4 transition hover:bg-accent sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.full_name}</p>
                    <p className="truncate text-sm text-muted-foreground">{s.email}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {s.enrollments[0]?.count ?? 0} course{s.enrollments[0]?.count === 1 ? "" : "s"}
                    </span>
                    <StatusBadge active={s.is_active} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
