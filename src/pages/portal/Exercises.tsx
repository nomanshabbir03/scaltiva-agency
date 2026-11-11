import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ClipboardList, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { NewDot, useUnseen } from "@/lib/seen";
import { STATUS_CLASS, STATUS_LABEL, exerciseStatus, formatDue, type Exercise, type Submission } from "@/lib/exercises";

type Row = Exercise & { courses: { title: string } | null };

export default function Exercises() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  // New exercise, or newly marked work.
  const unseen = new Set(useUnseen().map((u) => u.exerciseId));

  useEffect(() => {
    if (!profile) return;
    // RLS only returns exercises of published courses this student is enrolled in.
    Promise.all([
      supabase.from("exercises").select("*, courses(title)").order("due_at", { ascending: true, nullsFirst: false }),
      supabase.from("exercise_submissions").select("*").eq("user_id", profile.id),
    ]).then(([e, s]) => {
      setRows(((e.data ?? []) as unknown as Row[]).filter((r) => r.courses));
      setSubmissions(Object.fromEntries(((s.data ?? []) as Submission[]).map((x) => [x.exercise_id, x])));
    });
  }, [profile]);

  if (!rows) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group by course, keeping the due-date order inside each group.
  const groups = new Map<string, Row[]>();
  rows.forEach((r) => groups.set(r.courses!.title, [...(groups.get(r.courses!.title) ?? []), r]));

  return (
    <div className="max-w-4xl">
      <title>Exercises | Scaltiva Student Portal</title>
      <h1 className="text-2xl font-semibold">Exercises</h1>

      {rows.length === 0 ? (
        <div className="mt-5 bg-background py-16 text-center shadow-sm">
          <ClipboardList className="mx-auto size-12 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">No exercises yet</h2>
          <p className="mt-2 text-muted-foreground">When Scaltiva adds exercises to your courses, they will show up here.</p>
        </div>
      ) : (
        [...groups].map(([course, list]) => (
          <section key={course} className="mt-5 overflow-hidden bg-background shadow-sm">
            <h2 className="bg-primary px-5 py-3.5 text-lg font-semibold text-primary-foreground">{course}</h2>
            <ul className="divide-y">
              {list.map((x) => {
                const sub = submissions[x.id];
                const status = exerciseStatus(x, sub);
                return (
                  <li key={x.id}>
                    <Link to={`/portal/exercises/${x.id}`} className="flex items-center gap-3 px-5 py-4 transition hover:bg-accent">
                      <ClipboardList className="size-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 font-medium">
                          <span className="truncate">{x.title}</span>
                          {unseen.has(x.id) && <NewDot />}
                        </p>
                        <p className="text-sm text-muted-foreground">Due: {formatDue(x.due_at)}</p>
                      </div>
                      {sub?.marks != null && (
                        <span className="text-sm font-semibold">
                          {sub.marks}
                          {x.max_marks ? `/${x.max_marks}` : ""}
                        </span>
                      )}
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_CLASS[status])}>{STATUS_LABEL[status]}</span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
