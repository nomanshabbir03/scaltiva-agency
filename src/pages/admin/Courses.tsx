import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Loader2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { card, errorBox } from "@/components/portal/form";

type Row = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  is_published: boolean;
  lessons: { count: number }[];
  enrollments: { count: number }[];
};

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        published ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground",
      )}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function Courses() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("courses")
      .select("id, title, thumbnail_url, is_published, lessons(count), enrollments(count)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError("Couldn't load courses. Please refresh the page.");
        setRows((data as Row[] | null) ?? []);
      });
  }, []);

  return (
    <div>
      <title>Courses | Scaltiva admin</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Courses</h1>
        <Link
          to="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-95"
        >
          <Plus className="size-4" />
          New course
        </Link>
      </div>

      {error && <p role="alert" className={cn(errorBox, "mt-6")}>{error}</p>}

      <div className={cn(card, "mt-6 overflow-hidden p-0 sm:p-0")}>
        {!rows ? (
          <div className="grid place-items-center py-16" role="status" aria-label="Loading">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No courses yet. Create the first one.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((c) => (
              <li key={c.id}>
                <Link to={`/admin/courses/${c.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-accent sm:px-6">
                  {c.thumbnail_url ? (
                    <img src={c.thumbnail_url} alt="" className="aspect-video w-20 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="grid aspect-video w-20 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                      <BookOpen className="size-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {plural(c.lessons[0]?.count ?? 0, "lesson")} · {plural(c.enrollments[0]?.count ?? 0, "student")}
                    </p>
                  </div>
                  <PublishedBadge published={c.is_published} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
