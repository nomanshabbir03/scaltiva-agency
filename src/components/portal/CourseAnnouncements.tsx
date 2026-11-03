import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Megaphone, Send, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { input, label, primaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";

export type Announcement = { id: string; course_id: string; title: string; body: string; created_at: string };

// Body of the "Announcements" section on the admin course page.
export default function CourseAnnouncements({ courseId }: { courseId: string }) {
  const toast = useToast();
  const [rows, setRows] = useState<Announcement[] | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Announcement[] | null) ?? []));
  }, [courseId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const title = String(form.get("title")).trim();
    if (!title) return toast("Please enter a title.", "error");
    setPosting(true);
    const { data, error } = await supabase
      .from("announcements")
      .insert({ course_id: courseId, title, body: String(form.get("body")).trim() })
      .select()
      .single();
    setPosting(false);
    if (error) return toast("Couldn't post the announcement. Please try again.", "error");
    formEl.reset();
    setRows((list) => [data as Announcement, ...(list ?? [])]);
    toast("Announcement posted to enrolled students.");
  }

  async function remove(a: Announcement) {
    if (!window.confirm(`Delete the announcement "${a.title}"? Students will no longer see it.`)) return;
    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    if (error) return toast("Couldn't delete the announcement. Please try again.", "error");
    setRows((list) => list?.filter((x) => x.id !== a.id) ?? null);
    toast("Announcement deleted.");
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="mt-4 space-y-4 rounded-3xl border bg-muted/50 p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">Only students enrolled in this course will see it, on their home page.</p>
        <div>
          <label htmlFor="announcement-title" className={label}>Title</label>
          <input id="announcement-title" name="title" required maxLength={150} placeholder="e.g. Friday's class moves to 8 PM" className={input} />
        </div>
        <div>
          <label htmlFor="announcement-body" className={label}>Message (optional)</label>
          <textarea id="announcement-body" name="body" rows={3} maxLength={2000} className={`${input} resize-y rounded-3xl`} />
        </div>
        <button type="submit" disabled={posting} className={primaryButton}>
          {posting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Post announcement
        </button>
      </form>

      {!rows ? (
        <div className="grid place-items-center py-10" role="status" aria-label="Loading">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No announcements yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((a) => (
            <li key={a.id} className="flex items-start gap-3 rounded-2xl border px-4 py-3">
              <Megaphone className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{a.title}</p>
                {a.body && <p className="mt-1 whitespace-pre-line text-sm text-foreground/80">{a.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(a)}
                aria-label={`Delete "${a.title}"`}
                className="grid size-9 shrink-0 place-items-center rounded-full border transition hover:border-red-300 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
