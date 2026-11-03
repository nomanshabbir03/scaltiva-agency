import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Loader2, UserPlus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { primaryButton, secondaryButton } from "@/components/portal/form";
import { downloadCsv, fileName } from "@/lib/csv";
import { useToast } from "@/components/portal/Toast";
import EnrollPicker, { type Option } from "@/components/portal/EnrollPicker";

type Enrollment = {
  id: string;
  enrolled_at: string;
  user_id: string;
  profiles: { full_name: string; email: string } | null;
};

const SELECT = "id, enrolled_at, user_id, profiles(full_name, email)";

// Body of the "Enrolled students" section on the admin course page.
export default function CourseStudents({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [students, setStudents] = useState<Option[]>([]);
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const [lessonCount, setLessonCount] = useState(0);
  const [picking, setPicking] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      supabase.from("enrollments").select(SELECT).eq("course_id", courseId).order("enrolled_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email").eq("role", "student").eq("is_active", true).order("full_name"),
      supabase.from("lessons").select("id, lesson_progress(user_id)").eq("course_id", courseId).eq("lesson_progress.completed", true),
    ]).then(([e, s, l]) => {
      setEnrollments((e.data as unknown as Enrollment[] | null) ?? []);
      setStudents((s.data ?? []).map((p) => ({ id: p.id, title: p.full_name, subtitle: p.email })));
      // Completed lessons per student, out of the course's lessons.
      const lessons = (l.data ?? []) as { lesson_progress: { user_id: string }[] }[];
      const done: Record<string, number> = {};
      lessons.forEach((lesson) => lesson.lesson_progress.forEach(({ user_id }) => (done[user_id] = (done[user_id] ?? 0) + 1)));
      setCompleted(done);
      setLessonCount(lessons.length);
    });
  }, [courseId]);

  async function enroll(ids: string[]) {
    const { data, error } = await supabase
      .from("enrollments")
      .upsert(ids.map((user_id) => ({ user_id, course_id: courseId })), { onConflict: "user_id,course_id", ignoreDuplicates: true })
      .select(SELECT);
    if (error) return toast("Couldn't enroll the students. Please try again.", "error");
    setEnrollments((list) => [...((data as unknown as Enrollment[] | null) ?? []), ...(list ?? [])]);
    setPicking(false);
    toast(`Enrolled ${ids.length} student${ids.length === 1 ? "" : "s"}.`);
  }

  async function unenroll(e: Enrollment) {
    if (!window.confirm(`Remove ${e.profiles?.full_name ?? "this student"} from the course?`)) return;
    const { error } = await supabase.from("enrollments").delete().eq("id", e.id);
    if (error) return toast("Couldn't remove the student. Please try again.", "error");
    setEnrollments((list) => list?.filter((x) => x.id !== e.id) ?? null);
    toast(`Removed ${e.profiles?.full_name ?? "student"} from the course.`);
  }

  const enrolledIds = new Set(enrollments?.map((e) => e.user_id));

  function exportStudents() {
    if (!enrollments) return;
    downloadCsv(
      `${fileName(courseTitle)}-students`,
      ["Name", "Email", "Enrolled", "Lessons completed", "Total lessons", "Progress %"],
      enrollments.map((e) => {
        const done = completed[e.user_id] ?? 0;
        return [e.profiles?.full_name, e.profiles?.email, new Date(e.enrolled_at).toLocaleDateString(), done, lessonCount, lessonCount ? Math.round((done / lessonCount) * 100) : 0];
      }),
    );
  }

  return (
    <div>

      {!enrollments ? (
        <div className="grid place-items-center py-10" role="status" aria-label="Loading">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : enrollments.length === 0 ? (
        <p className="mt-3 text-muted-foreground">No students enrolled yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Enrolled</th>
                <th className="py-2 pr-4 font-medium">Progress</th>
                <th className="py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td className="py-3 pr-4 font-medium">
                    <Link to={`/admin/students/${e.user_id}`} className="hover:text-primary">{e.profiles?.full_name}</Link>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{e.profiles?.email}</td>
                  <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap py-3 pr-4">
                    {completed[e.user_id] ?? 0}/{lessonCount} lessons
                    {lessonCount > 0 && (
                      <span className="ml-2 text-muted-foreground">
                        ({Math.round(((completed[e.user_id] ?? 0) / lessonCount) * 100)}%)
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => unenroll(e)}
                      aria-label={`Remove ${e.profiles?.full_name} from the course`}
                      className="inline-grid size-9 place-items-center rounded-full border transition hover:border-red-300 hover:text-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {picking ? (
          <EnrollPicker
            options={students.filter((s) => !enrolledIds.has(s.id))}
            noun="student"
            onEnroll={enroll}
            onClose={() => setPicking(false)}
          />
        ) : (
          <button type="button" onClick={() => setPicking(true)} disabled={!enrollments} className={primaryButton}>
            <UserPlus className="size-4" />
            Enroll students
          </button>
        )}
        {!picking && !!enrollments?.length && (
          <button type="button" onClick={exportStudents} className={secondaryButton}>
            <Download className="size-4" />
            Export with progress
          </button>
        )}
      </div>
    </div>
  );
}
