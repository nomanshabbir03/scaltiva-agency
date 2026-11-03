import { useEffect, useState } from "react";
import { Download, Loader2, TrendingDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";
import { card, input, secondaryButton } from "@/components/portal/form";
import { GRAY, ORANGE } from "@/components/portal/charts";

type LessonRow = { id: string; title: string; started: number; completed: number };

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const select = cn(input, "mt-0 w-auto py-2.5 pr-10 text-sm");

function LessonAnalytics() {
  const [courses, setCourses] = useState<{ id: string; title: string }[] | null>(null);
  const [courseId, setCourseId] = useState("");
  const [rows, setRows] = useState<LessonRow[] | null>(null);
  const [enrolled, setEnrolled] = useState(0);

  useEffect(() => {
    supabase.from("courses").select("id, title").order("title").then(({ data }) => {
      setCourses(data ?? []);
      if (data?.[0]) setCourseId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!courseId) return;
    setRows(null);
    Promise.all([
      supabase.from("lessons").select("id, title").eq("course_id", courseId).order("position"),
      supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("course_id", courseId),
    ]).then(async ([l, e]) => {
      const lessons = l.data ?? [];
      const { data: progress } = lessons.length
        ? await supabase.from("lesson_progress").select("lesson_id, completed").in("lesson_id", lessons.map((x) => x.id))
        : { data: [] };
      setEnrolled(e.count ?? 0);
      setRows(
        lessons.map((x) => {
          const mine = (progress ?? []).filter((p) => p.lesson_id === x.id);
          return { id: x.id, title: x.title, started: mine.length, completed: mine.filter((p) => p.completed).length };
        }),
      );
    });
  }, [courseId]);

  if (!courses) return <Spinner />;
  if (courses.length === 0) return <p className="py-10 text-center text-muted-foreground">Create a course first.</p>;

  // The biggest fall in completions from one lesson to the next.
  let drop: { index: number; by: number } | null = null;
  rows?.forEach((r, i) => {
    const by = i ? rows[i - 1].completed - r.completed : 0;
    if (by > 0 && (!drop || by > drop.by)) drop = { index: i, by };
  });
  const biggestDrop = drop as { index: number; by: number } | null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="insight-course" className="sr-only">Course</label>
        <select id="insight-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} className={select}>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <span className="text-sm text-muted-foreground">{enrolled} enrolled students</span>
      </div>

      {!rows ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">This course has no lessons yet.</p>
      ) : (
        <>
          {biggestDrop && (
            <p className="mt-5 flex items-start gap-2 bg-accent px-4 py-3 text-sm text-accent-foreground">
              <TrendingDown className="mt-0.5 size-4 shrink-0" />
              Biggest drop-off: {biggestDrop.by} fewer student{biggestDrop.by === 1 ? "" : "s"} completed lesson {biggestDrop.index + 1} (“{rows[biggestDrop.index].title}”) than the lesson before it.
            </p>
          )}
          <div className="mt-5 flex gap-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2 w-4 rounded-full" style={{ background: GRAY }} />Started</span>
            <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2 w-4 rounded-full" style={{ background: ORANGE }} />Completed</span>
          </div>
          <ol className="mt-3 space-y-4">
            {rows.map((r, i) => (
              <li key={r.id}>
                <div className="flex flex-wrap justify-between gap-x-4 text-sm">
                  <span className="font-medium">{i + 1}. {r.title}</span>
                  <span className="text-muted-foreground">
                    Started {r.started} ({pct(r.started, enrolled)}%) · Completed {r.completed} ({pct(r.completed, enrolled)}%)
                  </span>
                </div>
                <div className="mt-1.5 space-y-1" aria-hidden>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${pct(r.started, enrolled)}%`, background: GRAY }} />
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${pct(r.completed, enrolled)}%`, background: ORANGE }} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

type Activity = { id: string; action: string; entity: string; details: string | null; created_at: string; profiles: { full_name: string } | null };

const ENTITY: Record<string, string> = {
  students: "Student",
  courses: "Course",
  lessons: "Lesson",
  enrollments: "Enrollment",
  exercises: "Exercise",
  exercise_submissions: "Exercise review",
  announcements: "Announcement",
  quizzes: "Quiz",
  certificates: "Certificate",
};

const ACTION: Record<string, string> = { insert: "Added", update: "Updated", delete: "Deleted" };

function ActivityLog() {
  const [rows, setRows] = useState<Activity[] | null>(null);
  const [entity, setEntity] = useState("");

  useEffect(() => {
    setRows(null);
    let query = supabase.from("admin_activity").select("id, action, entity, details, created_at, profiles(full_name)").order("created_at", { ascending: false }).limit(200);
    if (entity) query = query.eq("entity", entity);
    query.then(({ data }) => setRows((data ?? []) as unknown as Activity[]));
  }, [entity]);

  const describe = (a: Activity) => `${ACTION[a.action] ?? a.action[0].toUpperCase() + a.action.slice(1)} ${(ENTITY[a.entity] ?? a.entity).toLowerCase()}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="log-entity" className="sr-only">Type</label>
        <select id="log-entity" value={entity} onChange={(e) => setEntity(e.target.value)} className={select}>
          <option value="">Everything</option>
          {Object.entries(ENTITY).map(([value, name]) => <option key={value} value={value}>{name}s</option>)}
        </select>
        <button
          type="button"
          disabled={!rows?.length}
          onClick={() =>
            rows &&
            downloadCsv(
              "activity-log",
              ["When", "Who", "What", "Details"],
              rows.map((a) => [new Date(a.created_at).toLocaleString(), a.profiles?.full_name ?? "", describe(a), a.details ?? ""]),
            )
          }
          className={secondaryButton}
        >
          <Download className="size-4" />
          Export
        </button>
        <span className="text-sm text-muted-foreground">Latest 200 actions</span>
      </div>

      {!rows ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Nothing logged yet.</p>
      ) : (
        <ul className="mt-5 divide-y">
          {rows.map((a) => (
            <li key={a.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-3 text-sm">
              <span className="w-36 shrink-0 text-muted-foreground">{new Date(a.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
              <span className="font-medium">{describe(a)}</span>
              {a.details && <span className="min-w-0 truncate text-foreground/80">{a.details}</span>}
              <span className="ml-auto text-muted-foreground">{a.profiles?.full_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="grid place-items-center py-16" role="status" aria-label="Loading">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  );
}

export default function Insights() {
  const [tab, setTab] = useState<"lessons" | "log">("lessons");
  const tabs = [
    { id: "lessons", label: "Lesson analytics" },
    { id: "log", label: "Activity log" },
  ] as const;

  return (
    <div className="max-w-5xl">
      <title>Insights | Scaltiva admin</title>
      <h1 className="text-3xl font-semibold">Insights</h1>

      <div className={`${card} mt-6`}>
        <div role="tablist" className="flex gap-1 border-b">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition",
                tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-primary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="pt-5">{tab === "lessons" ? <LessonAnalytics /> : <ActivityLog />}</div>
      </div>
    </div>
  );
}
