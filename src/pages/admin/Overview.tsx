import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardCheck, GraduationCap, Loader2, PlayCircle, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { card } from "@/components/portal/form";
import GuideVideoUpload from "@/components/portal/GuideVideoUpload";

type Person = { id: string; full_name: string };
type Enrollment = { id: string; user_id: string; enrolled_at: string; profiles: { full_name: string } | null; courses: { title: string } | null };

type Data = {
  counts: { students: number; courses: number; lessons: number; enrollments: number; toReview: number };
  inactive: Person[];
  noProfile: Person[];
  newest: Enrollment[];
};

const INACTIVE_DAYS = 7;
const SHOW = 6;

const base = (table: string) => supabase.from(table).select("*", { count: "exact", head: true });
const count = async (table: string, filter?: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => {
  const q = base(table);
  const { count } = await (filter ? filter(q) : q);
  return count ?? 0;
};

async function load(): Promise<Data> {
  const since = new Date(Date.now() - INACTIVE_DAYS * 86_400_000).toISOString();
  const [students, courses, lessons, toReview, people, enrollments, recent, details] = await Promise.all([
    count("profiles", (q) => q.eq("role", "student")),
    count("courses"),
    count("lessons"),
    count("exercise_submissions", (q) => q.is("reviewed_at", null)),
    supabase.from("profiles").select("id, full_name").eq("role", "student").eq("is_active", true).order("full_name"),
    supabase.from("enrollments").select("id, user_id, enrolled_at, profiles(full_name), courses(title)").order("enrolled_at", { ascending: false }),
    supabase.from("lesson_progress").select("user_id").gte("updated_at", since),
    supabase.from("student_details").select("user_id"),
  ]);

  const active = (people.data ?? []) as Person[];
  const allEnrollments = (enrollments.data ?? []) as unknown as Enrollment[];
  const enrolled = new Set(allEnrollments.map((e) => e.user_id));
  const watched = new Set((recent.data ?? []).map((r) => r.user_id));
  const filled = new Set((details.data ?? []).map((r) => r.user_id));

  return {
    counts: { students, courses, lessons, enrollments: allEnrollments.length, toReview },
    // Enrolled, active students who haven't watched anything in the last week.
    inactive: active.filter((p) => enrolled.has(p.id) && !watched.has(p.id)),
    noProfile: active.filter((p) => !filled.has(p.id)),
    newest: allEnrollments.slice(0, SHOW),
  };
}

function Panel({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className={card}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function People({ list, empty }: { list: Person[]; empty: string }) {
  if (list.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-1">
      {list.slice(0, SHOW).map((p) => (
        <li key={p.id}>
          <Link to={`/admin/students/${p.id}`} className="block truncate px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            {p.full_name}
          </Link>
        </li>
      ))}
      {list.length > SHOW && <li className="px-2 pt-1 text-sm text-muted-foreground">and {list.length - SHOW} more</li>}
    </ul>
  );
}

export default function Overview() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    load().then(setData);
  }, []);

  const c = data?.counts;
  const tiles = [
    { label: "To review", value: c?.toReview, icon: ClipboardCheck, to: "/admin/reviews", highlight: !!c?.toReview },
    { label: "Students", value: c?.students, icon: Users, to: "/admin/students" },
    { label: "Courses", value: c?.courses, icon: BookOpen, to: "/admin/courses" },
    { label: "Lessons", value: c?.lessons, icon: PlayCircle, to: "/admin/courses" },
    { label: "Enrollments", value: c?.enrollments, icon: GraduationCap, to: "/admin/courses" },
  ];

  return (
    <div>
      <title>Admin | Scaltiva</title>
      <h1 className="text-3xl font-semibold">Overview</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map(({ label, value, icon: Icon, to, highlight }) => (
          <Link
            key={label}
            to={to}
            className={cn(card, "block transition hover:-translate-y-0.5", highlight && "ring-2 ring-primary")}
          >
            <Icon className="size-6 text-primary" />
            <p className="mt-4 text-4xl font-semibold">{value ?? "–"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Needs attention</h2>
      {!data ? (
        <div className="grid place-items-center py-16" role="status" aria-label="Loading">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title={`No activity (${data.inactive.length})`} note={`Enrolled students who haven't watched a lesson in ${INACTIVE_DAYS} days.`}>
            <People list={data.inactive} empty="Everyone has been active this week." />
          </Panel>
          <Panel title={`Profile not filled in (${data.noProfile.length})`} note="Students who haven't completed My Profile yet.">
            <People list={data.noProfile} empty="Every student has filled in their profile." />
          </Panel>
          <Panel title="Newest enrollments" note="The latest students added to courses.">
            {data.newest.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enrollments yet.</p>
            ) : (
              <ul className="space-y-1">
                {data.newest.map((e) => (
                  <li key={e.id}>
                    <Link to={`/admin/students/${e.user_id}`} className="block px-2 py-1.5 hover:bg-accent hover:text-accent-foreground">
                      <span className="block truncate text-sm font-medium">{e.profiles?.full_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {e.courses?.title} · {new Date(e.enrolled_at).toLocaleDateString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
      <GuideVideoUpload />
    </div>
  );
}
