import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Donut, GRAY, LineChart, ORANGE, PercentBars } from "@/components/portal/charts";

type CourseData = {
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    lessons: { id: string; created_at: string }[];
    exercises: { id: string }[];
  } | null;
};

type ProgressRow = { lesson_id: string; completed: boolean; completed_at: string | null };

const WEEK = 7 * 24 * 60 * 60 * 1000;
const MAX_WEEKS = 26;

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

function Box({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border p-4 sm:p-5", className)}>
      <h3 className="border-b pb-3 text-sm font-semibold">{title}</h3>
      <div className="pt-4">{children}</div>
    </section>
  );
}

// Charts of one student's progress, one tab per enrolled course. Used on the
// student's Progress Timeline page and on the admin student page.
export default function ProgressTimeline({ userId }: { userId: string }) {
  const [courses, setCourses] = useState<CourseData[] | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Promise.all([
      supabase
        .from("enrollments")
        .select("enrolled_at, courses(id, title, lessons(id, created_at), exercises(id))")
        .eq("user_id", userId)
        .order("enrolled_at"),
      supabase.from("lesson_progress").select("lesson_id, completed, completed_at").eq("user_id", userId),
      supabase.from("exercise_submissions").select("exercise_id").eq("user_id", userId),
    ]).then(([e, p, s]) => {
      // Students only get courses they can see (published); admins get all.
      setCourses(((e.data ?? []) as unknown as CourseData[]).filter((c) => c.courses));
      setProgress((p.data as ProgressRow[] | null) ?? []);
      setSubmitted(new Set((s.data ?? []).map((r) => r.exercise_id)));
    });
  }, [userId]);

  if (!courses) {
    return (
      <div className="grid place-items-center py-16" role="status" aria-label="Loading">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (courses.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">No courses yet, so there&apos;s no progress to show.</p>;
  }

  const { enrolled_at, courses: course } = courses[Math.min(tab, courses.length - 1)];
  const { lessons, exercises } = course!;
  const lessonIds = new Set(lessons.map((l) => l.id));
  const rows = progress.filter((p) => lessonIds.has(p.lesson_id));
  const completed = rows.filter((p) => p.completed);
  const exercisesDone = exercises.filter((x) => submitted.has(x.id)).length;

  // Weeks since enrollment: lessons available vs lessons completed by the end of each week.
  const start = new Date(enrolled_at).getTime();
  const totalWeeks = Math.max(1, Math.ceil((Date.now() - start) / WEEK));
  const first = Math.max(0, totalWeeks - MAX_WEEKS);
  const weeks = Array.from({ length: totalWeeks - first }, (_, i) => first + i);
  const labels = weeks.map((w) => `Week ${String(w + 1).padStart(2, "0")}`);
  const available = weeks.map((w) => lessons.filter((l) => new Date(l.created_at).getTime() <= start + (w + 1) * WEEK).length);
  const done = weeks.map((w) => completed.filter((p) => p.completed_at && new Date(p.completed_at).getTime() <= start + (w + 1) * WEEK).length);

  const lessonsPct = pct(completed.length, lessons.length);
  const exercisesPct = pct(exercisesDone, exercises.length);
  const overall = exercises.length ? Math.round((lessonsPct + exercisesPct) / 2) : lessonsPct;

  return (
    <div>
      <div role="tablist" aria-label="Courses" className="flex gap-1 overflow-x-auto border-b">
        {courses.map((c, i) => (
          <button
            key={c.courses!.id}
            type="button"
            role="tab"
            aria-selected={i === tab}
            onClick={() => setTab(i)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition",
              i === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-primary",
            )}
          >
            {c.courses!.title}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-5 grid gap-5 lg:grid-cols-3">
        <Box title="Learning Activity (Lessons Watched)" className="lg:col-span-2">
          <LineChart
            labels={labels}
            caption={`Lessons available and completed per week since enrolling in ${course!.title}`}
            series={[
              { name: "Lessons available", color: GRAY, dashed: true, values: available },
              { name: "Lessons completed", color: ORANGE, values: done },
            ]}
          />
        </Box>

        <Box title="Exercises">
          {exercises.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No exercises in this course yet.</p>
          ) : (
            <Donut value={exercisesDone} total={exercises.length} label="Submitted" remainderLabel="Not submitted" />
          )}
        </Box>

        <Box title="Course Participation">
          <PercentBars
            caption="Share of lessons started, lessons completed and exercises submitted"
            bars={[
              { label: "Started", value: pct(rows.length, lessons.length) },
              { label: "Completed", value: lessonsPct },
              ...(exercises.length ? [{ label: "Exercises", value: exercisesPct }] : []),
            ]}
          />
        </Box>

        <Box title="Course Progress (Overall)" className="lg:col-span-2">
          <div className="flex h-full flex-col justify-center py-6">
            <p className="text-5xl font-semibold">
              {overall}
              <span className="text-2xl text-muted-foreground">%</span>
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Overall progress" aria-valuenow={overall} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${overall}%` }} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {completed.length} of {lessons.length} lessons completed
              {exercises.length > 0 && ` · ${exercisesDone} of ${exercises.length} exercises submitted`}
            </p>
          </div>
        </Box>
      </div>
    </div>
  );
}
