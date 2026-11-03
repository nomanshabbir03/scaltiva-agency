import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, Download, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { STATUS_CLASS, STATUS_LABEL, exerciseStatus, formatDue, type Exercise, type Submission } from "@/lib/exercises";
import { card, input, label, primaryButton, secondaryButton } from "@/components/portal/form";
import { downloadCsv, fileName } from "@/lib/csv";
import { useToast } from "@/components/portal/Toast";

type Student = { user_id: string; profiles: { full_name: string; email: string } | null };

function ReviewForm({ exercise, submission, onSaved }: { exercise: Exercise; submission: Submission; onSaved: (s: Submission) => void }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const marksText = String(form.get("marks")).trim();
    const marks = marksText === "" ? null : Math.round(Number(marksText));
    if (marks !== null && (marks < 0 || (exercise.max_marks && marks > exercise.max_marks))) {
      return toast(`Marks must be between 0 and ${exercise.max_marks}.`, "error");
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("exercise_submissions")
      .update({ marks, feedback: String(form.get("feedback")).trim() || null, reviewed_at: new Date().toISOString() })
      .eq("id", submission.id)
      .select()
      .single();
    setSaving(false);
    if (error) return toast("Couldn't save the review. Please try again.", "error");
    onSaved(data as Submission);
    toast("Review saved. The student can see it now.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-[140px_minmax(0,1fr)]">
      <div>
        <label htmlFor={`marks-${submission.id}`} className={label}>
          Marks{exercise.max_marks ? ` / ${exercise.max_marks}` : ""}
        </label>
        <input id={`marks-${submission.id}`} name="marks" type="number" min={0} max={exercise.max_marks ?? undefined} defaultValue={submission.marks ?? ""} className={input} />
      </div>
      <div>
        <label htmlFor={`feedback-${submission.id}`} className={label}>Feedback</label>
        <textarea id={`feedback-${submission.id}`} name="feedback" rows={2} maxLength={2000} defaultValue={submission.feedback ?? ""} className={`${input} resize-y `} />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {submission.reviewed_at ? "Update review" : "Save review"}
        </button>
      </div>
    </form>
  );
}

export default function ExerciseDetail() {
  const { id = "" } = useParams();
  const [exercise, setExercise] = useState<(Exercise & { courses: { title: string } | null }) | null | undefined>(undefined);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  // Arriving from the review queue opens that student's submission straight away.
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState<string | null>(searchParams.get("student"));

  useEffect(() => {
    supabase
      .from("exercises")
      .select("*, courses(title)")
      .eq("id", id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) return setExercise(null);
        const [enrolled, subs] = await Promise.all([
          supabase.from("enrollments").select("user_id, profiles(full_name, email)").eq("course_id", data.course_id),
          supabase.from("exercise_submissions").select("*").eq("exercise_id", id),
        ]);
        const list = ((enrolled.data ?? []) as unknown as Student[]).sort((a, b) =>
          (a.profiles?.full_name ?? "").localeCompare(b.profiles?.full_name ?? ""),
        );
        setStudents(list);
        setSubmissions(Object.fromEntries(((subs.data ?? []) as Submission[]).map((s) => [s.user_id, s])));
        setExercise(data as Exercise & { courses: { title: string } | null });
      });
  }, [id]);

  if (exercise === undefined) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (exercise === null) {
    return (
      <div>
        <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" />
          Courses
        </Link>
        <p className="mt-6 text-muted-foreground">Exercise not found.</p>
      </div>
    );
  }

  const submittedCount = Object.keys(submissions).length;

  function exportMarks() {
    downloadCsv(
      `${fileName(exercise!.title)}-marks`,
      ["Name", "Email", "Status", "Submitted", "Marks", "Out of", "Feedback", "Link"],
      students.map((st) => {
        const sub = submissions[st.user_id];
        return [
          st.profiles?.full_name,
          st.profiles?.email,
          STATUS_LABEL[exerciseStatus(exercise!, sub)],
          sub ? new Date(sub.submitted_at).toLocaleString() : "",
          sub?.marks ?? "",
          exercise!.max_marks ?? "",
          sub?.feedback ?? "",
          sub?.link ?? "",
        ];
      }),
    );
  }

  return (
    <div className="max-w-4xl">
      <title>{`${exercise.title} | Scaltiva admin`}</title>
      <Link to={`/admin/courses/${exercise.course_id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />
        {exercise.courses?.title ?? "Course"}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{exercise.title}</h1>
      <p className="mt-2 text-muted-foreground">
        Due: {formatDue(exercise.due_at)}
        {exercise.max_marks ? ` · ${exercise.max_marks} marks` : ""} · {submittedCount}/{students.length} submitted
      </p>
      {exercise.instructions && <p className={`${card} mt-6 whitespace-pre-line`}>{exercise.instructions}</p>}

      <section className={`${card} mt-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Submissions</h2>
          {students.length > 0 && (
            <button type="button" onClick={exportMarks} className={secondaryButton}>
              <Download className="size-4" />
              Export marks
            </button>
          )}
        </div>
        {students.length === 0 ? (
          <p className="mt-3 text-muted-foreground">No students are enrolled in this course yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {students.map((st) => {
              const sub = submissions[st.user_id];
              const status = exerciseStatus(exercise, sub);
              const expanded = open === st.user_id;
              return (
                <li key={st.user_id} className="border">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : st.user_id)}
                    disabled={!sub}
                    aria-expanded={sub ? expanded : undefined}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left disabled:cursor-default"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{st.profiles?.full_name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {sub ? `Submitted ${new Date(sub.submitted_at).toLocaleString()}` : st.profiles?.email}
                      </p>
                    </div>
                    {sub?.marks != null && (
                      <span className="text-sm font-semibold">
                        {sub.marks}
                        {exercise.max_marks ? `/${exercise.max_marks}` : ""}
                      </span>
                    )}
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_CLASS[status])}>{STATUS_LABEL[status]}</span>
                    {sub && <ChevronDown className={cn("size-4 shrink-0 transition", expanded && "rotate-180")} />}
                  </button>
                  {sub && expanded && (
                    <div className="px-4 pb-4">
                      {sub.answer && <p className="whitespace-pre-line bg-muted/60 p-4 text-sm">{sub.answer}</p>}
                      {sub.link && (
                        <a href={sub.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 break-all text-sm font-semibold text-primary hover:underline">
                          {sub.link}
                          <ExternalLink className="size-3.5 shrink-0" />
                        </a>
                      )}
                      <ReviewForm
                        exercise={exercise}
                        submission={sub}
                        onSaved={(s) => setSubmissions((all) => ({ ...all, [s.user_id]: s }))}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
