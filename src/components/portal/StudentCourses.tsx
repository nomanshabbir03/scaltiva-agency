import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookPlus, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { card, primaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";
import EnrollPicker, { type Option } from "@/components/portal/EnrollPicker";
import { PublishedBadge } from "@/pages/admin/Courses";

type Enrollment = {
  id: string;
  enrolled_at: string;
  course_id: string;
  courses: { title: string; is_published: boolean } | null;
};

const SELECT = "id, enrolled_at, course_id, courses(title, is_published)";

// "Enrolled courses" section on the admin student page.
export default function StudentCourses({ studentId }: { studentId: string }) {
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [courses, setCourses] = useState<Option[]>([]);
  const [picking, setPicking] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      supabase.from("enrollments").select(SELECT).eq("user_id", studentId).order("enrolled_at", { ascending: false }),
      supabase.from("courses").select("id, title, is_published").order("title"),
    ]).then(([e, c]) => {
      setEnrollments((e.data as unknown as Enrollment[] | null) ?? []);
      setCourses((c.data ?? []).map((x) => ({ id: x.id, title: x.title, subtitle: x.is_published ? undefined : "Draft" })));
    });
  }, [studentId]);

  async function enroll(ids: string[]) {
    const { data, error } = await supabase
      .from("enrollments")
      .upsert(ids.map((course_id) => ({ user_id: studentId, course_id })), { onConflict: "user_id,course_id", ignoreDuplicates: true })
      .select(SELECT);
    if (error) return toast("Couldn't enroll in the courses. Please try again.", "error");
    setEnrollments((list) => [...((data as unknown as Enrollment[] | null) ?? []), ...(list ?? [])]);
    setPicking(false);
    toast(`Enrolled in ${ids.length} course${ids.length === 1 ? "" : "s"}.`);
  }

  async function unenroll(e: Enrollment) {
    if (!window.confirm(`Remove the student from "${e.courses?.title ?? "this course"}"?`)) return;
    const { error } = await supabase.from("enrollments").delete().eq("id", e.id);
    if (error) return toast("Couldn't remove the course. Please try again.", "error");
    setEnrollments((list) => list?.filter((x) => x.id !== e.id) ?? null);
    toast(`Removed from ${e.courses?.title ?? "the course"}.`);
  }

  const enrolledIds = new Set(enrollments?.map((e) => e.course_id));

  return (
    <section className={`${card} mt-6`}>
      <h2 className="text-xl font-semibold">Enrolled courses</h2>

      {!enrollments ? (
        <div className="grid place-items-center py-10" role="status" aria-label="Loading">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : enrollments.length === 0 ? (
        <p className="mt-3 text-muted-foreground">Not enrolled in any course yet.</p>
      ) : (
        <ul className="mt-4 divide-y">
          {enrollments.map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <Link to={`/admin/courses/${e.course_id}`} className="font-medium hover:text-primary">{e.courses?.title}</Link>
                <p className="text-sm text-muted-foreground">since {new Date(e.enrolled_at).toLocaleDateString()}</p>
              </div>
              {e.courses && !e.courses.is_published && <PublishedBadge published={false} />}
              <button
                type="button"
                onClick={() => unenroll(e)}
                aria-label={`Remove from ${e.courses?.title}`}
                className="grid size-9 shrink-0 place-items-center rounded-full border transition hover:border-red-300 hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        {picking ? (
          <EnrollPicker
            options={courses.filter((c) => !enrolledIds.has(c.id))}
            noun="course"
            onEnroll={enroll}
            onClose={() => setPicking(false)}
          />
        ) : (
          <button type="button" onClick={() => setPicking(true)} disabled={!enrollments} className={primaryButton}>
            <BookPlus className="size-4" />
            Enroll in courses
          </button>
        )}
      </div>
    </section>
  );
}
