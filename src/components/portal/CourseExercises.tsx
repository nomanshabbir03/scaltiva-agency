import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDue, type Exercise } from "@/lib/exercises";
import { card, input, label, primaryButton, secondaryButton } from "@/components/portal/form";
import Notice, { type Message } from "@/components/portal/Notice";
import { useToast } from "@/components/portal/Toast";

type Row = Exercise & { exercise_submissions: { count: number }[] };

// <input type="datetime-local"> works in local time without a zone.
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function ExerciseForm({ courseId, exercise, onSaved, onCancel }: {
  courseId: string;
  exercise?: Exercise;
  onSaved: (e: Exercise) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const prefix = exercise?.id ?? "new-ex";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title")).trim();
    const due = String(form.get("due"));
    const marks = String(form.get("marks")).trim();
    if (!title) return setMessage({ type: "error", text: "Please enter a title." });

    setMessage(null);
    setSaving(true);
    const values = {
      course_id: courseId,
      title,
      instructions: String(form.get("instructions")).trim() || null,
      due_at: due ? new Date(due).toISOString() : null,
      max_marks: marks ? Math.max(1, Math.round(Number(marks))) : null,
    };
    const { data, error } = exercise
      ? await supabase.from("exercises").update(values).eq("id", exercise.id).select().single()
      : await supabase.from("exercises").insert(values).select().single();
    setSaving(false);
    if (error) return setMessage({ type: "error", text: "Couldn't save the exercise. Please try again." });
    onSaved(data as Exercise);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border bg-muted/50 p-4 sm:p-6">
      <div>
        <label htmlFor={`${prefix}-title`} className={label}>Exercise title</label>
        <input id={`${prefix}-title`} name="title" required maxLength={150} defaultValue={exercise?.title} className={input} />
      </div>
      <div>
        <label htmlFor={`${prefix}-instructions`} className={label}>Instructions</label>
        <textarea id={`${prefix}-instructions`} name="instructions" rows={5} maxLength={5000} defaultValue={exercise?.instructions ?? ""} className={`${input} resize-y rounded-3xl`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}-due`} className={label}>Due date (optional)</label>
          <input id={`${prefix}-due`} name="due" type="datetime-local" defaultValue={toLocalInput(exercise?.due_at ?? null)} className={input} />
        </div>
        <div>
          <label htmlFor={`${prefix}-marks`} className={label}>Total marks (optional)</label>
          <input id={`${prefix}-marks`} name="marks" type="number" min={1} max={1000} defaultValue={exercise?.max_marks ?? ""} className={input} />
        </div>
      </div>
      <Notice message={message} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {exercise ? "Save exercise" : "Add exercise"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>Cancel</button>
      </div>
    </form>
  );
}

const iconButton = "grid size-9 place-items-center rounded-full border transition hover:border-primary hover:text-primary";

// "Exercises" section on the admin course page.
export default function CourseExercises({ courseId }: { courseId: string }) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("exercises")
      .select("*, exercise_submissions(count)")
      .eq("course_id", courseId)
      .order("created_at")
      .then(({ data }) => setRows((data as Row[] | null) ?? []));
  }, [courseId]);

  function onSaved(saved: Exercise) {
    setRows((list) => {
      const existing = list?.find((r) => r.id === saved.id);
      if (existing) return list!.map((r) => (r.id === saved.id ? { ...existing, ...saved } : r));
      return [...(list ?? []), { ...saved, exercise_submissions: [{ count: 0 }] }];
    });
    setEditing(null);
    toast("Exercise saved.");
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete the exercise "${row.title}"? All student submissions for it will be deleted too.`)) return;
    const { error } = await supabase.from("exercises").delete().eq("id", row.id);
    if (error) return toast("Couldn't delete the exercise. Please try again.", "error");
    setRows((list) => list?.filter((r) => r.id !== row.id) ?? null);
    toast("Exercise deleted.");
  }

  return (
    <section className={`${card} mt-6`}>
      <h2 className="text-xl font-semibold">Exercises</h2>

      {!rows ? (
        <div className="grid place-items-center py-10" role="status" aria-label="Loading">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {rows.length === 0 && editing !== "new" && <p className="mt-3 text-muted-foreground">No exercises yet.</p>}
          <ul className="mt-4 space-y-3">
            {rows.map((row) =>
              editing === row.id ? (
                <li key={row.id}>
                  <ExerciseForm courseId={courseId} exercise={row} onSaved={onSaved} onCancel={() => setEditing(null)} />
                </li>
              ) : (
                <li key={row.id} className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                  <ClipboardList className="size-5 shrink-0 text-primary" />
                  <Link to={`/admin/exercises/${row.id}`} className="min-w-0 flex-1 hover:text-primary">
                    <p className="truncate font-medium">{row.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {formatDue(row.due_at)} · {row.exercise_submissions[0]?.count ?? 0} submitted
                    </p>
                  </Link>
                  <button type="button" onClick={() => setEditing(row.id)} aria-label={`Edit "${row.title}"`} className={iconButton}>
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" onClick={() => remove(row)} aria-label={`Delete "${row.title}"`} className={`${iconButton} hover:border-red-300 hover:text-red-600`}>
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ),
            )}
          </ul>
          <div className="mt-4">
            {editing === "new" ? (
              <ExerciseForm courseId={courseId} onSaved={onSaved} onCancel={() => setEditing(null)} />
            ) : (
              <button type="button" onClick={() => setEditing("new")} className={primaryButton}>
                <Plus className="size-4" />
                Add exercise
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
