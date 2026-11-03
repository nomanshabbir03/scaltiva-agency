import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, ClipboardCheck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { card } from "@/components/portal/form";

type Row = {
  id: string;
  submitted_at: string;
  user_id: string;
  exercise_id: string;
  profiles: { full_name: string } | null;
  exercises: { title: string; due_at: string | null; courses: { title: string } | null } | null;
};

const daysAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
};

// Every submission still waiting for marks, across all courses, oldest first.
export default function Reviews() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    supabase
      .from("exercise_submissions")
      .select("id, submitted_at, user_id, exercise_id, profiles(full_name), exercises(title, due_at, courses(title))")
      .is("reviewed_at", null)
      .order("submitted_at")
      .then(({ data }) => setRows((data ?? []) as unknown as Row[]));
  }, []);

  return (
    <div className="max-w-4xl">
      <title>To review | Scaltiva admin</title>
      <h1 className="text-3xl font-semibold">To review</h1>
      <p className="mt-2 text-muted-foreground">Exercise submissions waiting for marks, oldest first.</p>

      <div className={`${card} mt-6 overflow-hidden p-0 sm:p-0`}>
        {!rows ? (
          <div className="grid place-items-center py-16" role="status" aria-label="Loading">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="mx-auto size-12 text-green-600" />
            <p className="mt-3 text-lg font-medium">All caught up</p>
            <p className="mt-1 text-muted-foreground">Every submission has been reviewed.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/admin/exercises/${r.exercise_id}?student=${r.user_id}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-accent sm:px-6"
                >
                  <ClipboardCheck className="size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.profiles?.full_name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {r.exercises?.title} · {r.exercises?.courses?.title}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">{daysAgo(r.submitted_at)}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
