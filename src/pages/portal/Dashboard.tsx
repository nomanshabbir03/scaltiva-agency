import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Award, BarChart3, ListChecks, BookOpen, ClipboardList, CheckCircle2, KeyRound, Loader2, Megaphone, NotebookPen, PlayCircle, TrendingUp, UserRound, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import Avatar from "@/components/portal/Avatar";

type Course = {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  lessons: { id: string }[];
};

type Row = { lesson_id: string; completed: boolean; updated_at: string };

type Announcement = { id: string; title: string; body: string; created_at: string; courses: { title: string } | null };

const NEW_FOR_MS = 7 * 24 * 60 * 60 * 1000;
const DISMISSED_KEY = "scaltiva-dismissed-announcements";

// Which announcement banners this browser has closed. Storage can be unavailable (private mode), so never let it throw.
function readDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// Card with the orange header bar.
function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden bg-background shadow-sm">
      <div className="flex items-center justify-between gap-3 bg-primary px-5 py-3.5 text-primary-foreground">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

// Icon + label tile used in the right-hand panels.
function Tile({ icon: Icon, label, to }: { icon: typeof BookOpen; label: string; to: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 px-2 py-4 text-center text-sm text-foreground/70 transition hover:bg-accent hover:text-accent-foreground">
      <Icon className="size-6 text-primary" />
      {label}
    </Link>
  );
}

function CourseIcon({ course }: { course: Course }) {
  return course.thumbnail_url ? (
    <img src={course.thumbnail_url} alt="" className="size-11 shrink-0 rounded-full border-2 border-primary/30 object-cover" />
  ) : (
    <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-primary/30 bg-accent text-primary">
      <BookOpen className="size-5" />
    </span>
  );
}

export default function Dashboard() {
  const { profile, avatarUrl } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);

  useEffect(() => {
    if (!profile) return;
    // RLS only returns published courses this student is enrolled in.
    Promise.all([
      supabase.from("courses").select("id, title, slug, thumbnail_url, lessons(id)").order("title"),
      supabase.from("lesson_progress").select("lesson_id, completed, updated_at").eq("user_id", profile.id),
      // RLS only returns announcements for this student's enrolled, published courses.
      supabase.from("announcements").select("id, title, body, created_at, courses(title)").order("created_at", { ascending: false }).limit(10),
    ]).then(([c, p, a]) => {
      setAnnouncements(((a.data ?? []) as unknown as Announcement[]).filter((x) => x.courses));
      if (c.error) return setLoadError(true);
      setCourses((c.data as Course[] | null) ?? []);
      setRows((p.data as Row[] | null) ?? []);
    });
  }, [profile]);

  function dismiss(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next.slice(-50)));
    } catch {
      // Not saved; the banner just comes back next visit.
    }
  }

  if (loadError) {
    return (
      <div className="bg-background py-16 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Couldn&apos;t load your courses</h1>
        <p className="mt-2 text-muted-foreground">Please check your connection and try again.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-full border px-6 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary">
          Try again
        </button>
      </div>
    );
  }

  if (!courses) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const completed = new Set(rows.filter((r) => r.completed).map((r) => r.lesson_id));
  const stats = courses.map((c) => {
    const done = c.lessons.filter((l) => completed.has(l.id)).length;
    return { course: c, done, total: c.lessons.length };
  });
  const finished = stats.filter((s) => s.total > 0 && s.done === s.total);
  const current = stats.filter((s) => !finished.includes(s));

  // The course of the most recently watched lesson, for "Continue learning".
  const latest = [...rows].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  const lastCourse = latest && courses.find((c) => c.lessons.some((l) => l.id === latest.lesson_id));

  // New announcements show as a banner until closed; all of them stay on the Notice Board.
  const fresh = announcements.filter((a) => Date.now() - new Date(a.created_at).getTime() < NEW_FOR_MS && !dismissed.includes(a.id)).slice(0, 3);

  const totalLessons = stats.reduce((n, s) => n + s.total, 0);
  const overall = totalLessons ? Math.round((completed.size / totalLessons) * 100) : 0;

  return (
    <div>
      <title>Home | Scaltiva Student Portal</title>
      <h1 className="text-2xl font-semibold">Home</h1>

      {showWelcome && (
        <div role="status" className="mt-4 flex items-center gap-3 bg-accent px-5 py-3.5 text-sm text-accent-foreground">
          <Link to="/portal/profile" aria-label="My profile">
            <Avatar url={avatarUrl} name={profile?.full_name ?? ""} className="size-11 border-2 border-background text-sm" />
          </Link>
          <p className="flex-1">
            Welcome back, <strong>{profile?.full_name}</strong>.{" "}
            {current.length > 0
              ? `You have ${current.length} course${current.length === 1 ? "" : "s"} in progress.`
              : courses.length > 0
                ? "You've finished all your courses. Great work!"
                : "You'll see your courses here once Scaltiva enrolls you."}
          </p>
          <button type="button" onClick={() => setShowWelcome(false)} aria-label="Dismiss" className="rounded-full p-0.5 hover:bg-background/60">
            <X className="size-4" />
          </button>
        </div>
      )}

      {fresh.map((a) => (
        <div key={a.id} role="status" className="mt-3 flex items-start gap-3 bg-primary px-5 py-3.5 text-sm text-primary-foreground">
          <Megaphone className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1">
            <strong>{a.courses?.title}:</strong> {a.title}
            {a.body && <span className="mt-0.5 block whitespace-pre-line opacity-90">{a.body}</span>}
          </p>
          <button type="button" onClick={() => dismiss(a.id)} aria-label="Dismiss announcement" className="rounded-full p-0.5 hover:bg-background/20">
            <X className="size-4" />
          </button>
        </div>
      ))}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-5">
          <Panel
            title="My Courses"
            action={
              lastCourse && (
                <Link to={`/portal/courses/${lastCourse.slug}`} className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1.5 text-sm font-semibold hover:bg-background/25">
                  <PlayCircle className="size-4" />
                  Continue learning
                </Link>
              )
            }
          >
            {current.length === 0 ? (
              <p className="px-2 py-6 text-center text-muted-foreground">
                {courses.length === 0 ? "No courses yet. Once Scaltiva enrolls you in a course, it will show up here." : "No courses in progress."}
              </p>
            ) : (
              <ul className="space-y-2">
                {current.map(({ course, done, total }) => (
                  <li key={course.id}>
                    <Link to={`/portal/courses/${course.slug}`} className="flex items-center gap-3 bg-muted/60 px-3 py-3 transition hover:bg-accent">
                      <CourseIcon course={course} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {course.title}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            (Lesson {Math.min(done + 1, Math.max(total, 1))}/{total})
                          </span>
                        </p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background" aria-hidden>
                          <div className="h-full rounded-full bg-primary" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-primary">{total ? Math.round((done / total) * 100) : 0}%</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Completed Courses">
            {finished.length === 0 ? (
              <p className="px-2 py-6 text-center text-muted-foreground">Finish all the lessons in a course and it will move here.</p>
            ) : (
              <ul className="space-y-2">
                {finished.map(({ course, total }) => (
                  <li key={course.id}>
                    <Link to={`/portal/courses/${course.slug}`} className="flex items-center gap-3 bg-muted/60 px-3 py-3 transition hover:bg-accent">
                      <CourseIcon course={course} />
                      <p className="min-w-0 flex-1 truncate font-medium text-primary">{course.title}</p>
                      <span className="inline-flex shrink-0 items-center gap-1 text-sm text-green-700">
                        <CheckCircle2 className="size-4" />
                        {total}/{total}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="My Progress">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/60 px-2 py-4">
                <p className="text-2xl font-semibold">{courses.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Courses</p>
              </div>
              <div className="bg-muted/60 px-2 py-4">
                <p className="text-2xl font-semibold">{completed.size}</p>
                <p className="mt-1 text-xs text-muted-foreground">Lessons done</p>
              </div>
              <div className="bg-muted/60 px-2 py-4">
                <p className="text-2xl font-semibold text-primary">{overall}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Overall</p>
              </div>
            </div>
          </Panel>

          <Panel title="Notice Board">
            {announcements.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">No announcements right now.</p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto">
                {announcements.slice(0, 5).map((a) => (
                  <li key={a.id} className="bg-muted/60 px-3 py-2.5">
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.body && <p className="mt-0.5 line-clamp-3 whitespace-pre-line text-sm text-foreground/80">{a.body}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.courses?.title} · {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="My Activities">
            <div className="grid grid-cols-3 gap-2">
              <Tile icon={BarChart3} label="Progress timeline" to="/portal/timeline" />
              <Tile icon={ClipboardList} label="Exercises" to="/portal/exercises" />
              <Tile icon={ListChecks} label="Quizzes" to="/portal/quizzes" />
              <Tile icon={Award} label="Certificates" to="/portal/certificates" />
              <Tile icon={NotebookPen} label="My notes" to="/portal/notes" />
            </div>
          </Panel>

          <Panel title="Quick Links">
            <div className="grid grid-cols-3 gap-2">
              {lastCourse ? (
                <Tile icon={PlayCircle} label="Continue learning" to={`/portal/courses/${lastCourse.slug}`} />
              ) : (
                <Tile icon={TrendingUp} label="Start a course" to={current[0] ? `/portal/courses/${current[0].course.slug}` : "/portal"} />
              )}
              <Tile icon={UserRound} label="My profile" to="/portal/profile" />
              <Tile icon={KeyRound} label="Change password" to="/portal/account" />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
