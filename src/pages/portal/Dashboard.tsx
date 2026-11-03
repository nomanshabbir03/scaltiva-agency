import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Loader2, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { card } from "@/components/portal/form";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  lessons: { id: string }[];
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!profile) return;
    // RLS only returns published courses this student is enrolled in.
    Promise.all([
      supabase.from("courses").select("id, title, slug, description, thumbnail_url, lessons(id)").order("title"),
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", profile.id).eq("completed", true),
    ]).then(([c, p]) => {
      if (c.error) return setLoadError(true);
      setCourses((c.data as Course[] | null) ?? []);
      setCompleted(new Set((p.data ?? []).map((r) => r.lesson_id)));
    });
  }, [profile]);

  return (
    <div>
      <title>My courses | Scaltiva</title>
      <h1 className="text-3xl font-semibold">Welcome, {profile?.full_name.split(" ")[0]}</h1>
      <p className="mt-2 text-muted-foreground">Pick up where you left off.</p>

      {loadError ? (
        <div className={`${card} mt-8 py-16 text-center`}>
          <h2 className="text-xl font-semibold">Couldn&apos;t load your courses</h2>
          <p className="mt-2 text-muted-foreground">Please check your connection and try again.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-full border px-6 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary">
            Try again
          </button>
        </div>
      ) : !courses ? (
        <div className="grid place-items-center py-24" role="status" aria-label="Loading">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className={`${card} mt-8 py-16 text-center`}>
          <BookOpen className="mx-auto size-12 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">No courses yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
            Once Scaltiva enrolls you in a course, it will show up here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const total = c.lessons.length;
            const done = c.lessons.filter((l) => completed.has(l.id)).length;
            const percent = total ? Math.round((done / total) * 100) : 0;
            return (
              <li key={c.id} className="flex flex-col overflow-hidden rounded-[2rem] bg-background shadow-xl shadow-primary/5">
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt="" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="grid aspect-video place-items-center bg-accent text-primary">
                    <BookOpen className="size-10" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-lg font-semibold">{c.title}</h2>
                  {c.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}

                  <div className="mt-auto pt-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {done} of {total} lesson{total === 1 ? "" : "s"}
                      </span>
                      <span className="font-semibold">{percent}%</span>
                    </div>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label={`${c.title} progress`}
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                    </div>
                    <Link
                      to={`/portal/courses/${c.slug}`}
                      className="mt-5 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-95"
                    >
                      <PlayCircle className="size-4" />
                      {done === 0 ? "Start course" : done === total ? "Watch again" : "Continue"}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
