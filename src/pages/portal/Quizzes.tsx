import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ListChecks, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type Quiz = { id: string; title: string; courses: { title: string } | null };
type Attempt = { quiz_id: string; score: number; total: number };

export default function Quizzes() {
  const { profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});

  useEffect(() => {
    if (!profile) return;
    // RLS only returns quizzes of published courses this student is enrolled in.
    Promise.all([
      supabase.from("quizzes").select("id, title, courses(title)").order("created_at"),
      supabase.from("quiz_attempts").select("quiz_id, score, total").eq("user_id", profile.id),
    ]).then(([q, a]) => {
      setQuizzes(((q.data ?? []) as unknown as Quiz[]).filter((x) => x.courses));
      setAttempts(Object.fromEntries(((a.data ?? []) as Attempt[]).map((x) => [x.quiz_id, x])));
    });
  }, [profile]);

  if (!quizzes) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const groups = new Map<string, Quiz[]>();
  quizzes.forEach((q) => groups.set(q.courses!.title, [...(groups.get(q.courses!.title) ?? []), q]));

  return (
    <div className="max-w-4xl">
      <title>Quizzes | Scaltiva Student Portal</title>
      <h1 className="text-2xl font-semibold">Quizzes</h1>

      {quizzes.length === 0 ? (
        <div className="mt-5 bg-background py-16 text-center shadow-sm">
          <ListChecks className="mx-auto size-12 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">No quizzes yet</h2>
          <p className="mt-2 text-muted-foreground">When Scaltiva adds quizzes to your courses, they will show up here.</p>
        </div>
      ) : (
        [...groups].map(([course, list]) => (
          <section key={course} className="mt-5 overflow-hidden bg-background shadow-sm">
            <h2 className="bg-primary px-5 py-3.5 text-lg font-semibold text-primary-foreground">{course}</h2>
            <ul className="divide-y">
              {list.map((q) => {
                const a = attempts[q.id];
                return (
                  <li key={q.id}>
                    <Link to={`/portal/quizzes/${q.id}`} className="flex items-center gap-3 px-5 py-4 transition hover:bg-accent">
                      <ListChecks className="size-5 shrink-0 text-primary" />
                      <p className="min-w-0 flex-1 truncate font-medium">{q.title}</p>
                      {a ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          {a.score}/{a.total} · {Math.round((a.score / a.total) * 100)}%
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Not attempted</span>
                      )}
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
