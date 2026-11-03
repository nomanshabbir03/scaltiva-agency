import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ListChecks, Loader2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { input, label, primaryButton, secondaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";

type Row = { id: string; title: string; quiz_questions: { count: number }[]; quiz_attempts: { count: number }[] };

// Body of the "Quizzes" section on the admin course page.
export default function CourseQuizzes({ courseId }: { courseId: string }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("quizzes")
      .select("id, title, quiz_questions(count), quiz_attempts(count)")
      .eq("course_id", courseId)
      .order("created_at")
      .then(({ data }) => setRows((data as Row[] | null) ?? []));
  }, [courseId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title")).trim();
    if (!title) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("quizzes")
      .insert({ course_id: courseId, title, description: String(form.get("description")).trim() || null })
      .select("id")
      .single();
    setSaving(false);
    if (error) return toast("Couldn't create the quiz. Please try again.", "error");
    toast("Quiz created. Now upload its questions.");
    navigate(`/admin/quizzes/${data.id}`);
  }

  if (!rows) {
    return (
      <div className="grid place-items-center py-10" role="status" aria-label="Loading">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {rows.length === 0 && !adding && <p className="mt-3 text-muted-foreground">No quizzes yet.</p>}
      <ul className="mt-4 space-y-3">
        {rows.map((q) => (
          <li key={q.id}>
            <Link to={`/admin/quizzes/${q.id}`} className="flex items-center gap-3 border px-4 py-3 transition hover:border-primary">
              <ListChecks className="size-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{q.title}</p>
                <p className="text-sm text-muted-foreground">
                  {q.quiz_questions[0]?.count ?? 0} questions · {q.quiz_attempts[0]?.count ?? 0} attempts
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        {adding ? (
          <form onSubmit={onSubmit} className="space-y-4 border bg-muted/50 p-4 sm:p-6">
            <div>
              <label htmlFor="quiz-title" className={label}>Quiz title</label>
              <input id="quiz-title" name="title" required maxLength={150} placeholder="e.g. Week 1 quiz" className={input} />
            </div>
            <div>
              <label htmlFor="quiz-description" className={label}>Instructions (optional)</label>
              <textarea id="quiz-description" name="description" rows={2} maxLength={2000} className={`${input} resize-y `} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className={primaryButton}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                Create quiz
              </button>
              <button type="button" onClick={() => setAdding(false)} className={secondaryButton}>Cancel</button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className={primaryButton}>
            <Plus className="size-4" />
            Add quiz
          </button>
        )}
      </div>
    </div>
  );
}
