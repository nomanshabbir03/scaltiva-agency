import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Mail, Send, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { card, input, label, primaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";

type Note = { id: string; title: string; body: string; created_at: string };

// Admin: send a private message to one student. It shows on their home page.
export default function StudentMessages({ studentId }: { studentId: string }) {
  const toast = useToast();
  const [rows, setRows] = useState<Note[] | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, title, body, created_at")
      .eq("user_id", studentId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Note[] | null) ?? []));
  }, [studentId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const title = String(form.get("title")).trim();
    if (!title) return toast("Please enter a subject.", "error");
    setSending(true);
    const { data, error } = await supabase
      .from("announcements")
      .insert({ user_id: studentId, title, body: String(form.get("body")).trim() })
      .select("id, title, body, created_at")
      .single();
    setSending(false);
    if (error) return toast("Couldn't send the message. Please try again.", "error");
    formEl.reset();
    setRows((list) => [data as Note, ...(list ?? [])]);
    toast("Message sent to the student.");
  }

  async function remove(n: Note) {
    if (!window.confirm(`Delete the message "${n.title}"? The student will no longer see it.`)) return;
    const { error } = await supabase.from("announcements").delete().eq("id", n.id);
    if (error) return toast("Couldn't delete the message. Please try again.", "error");
    setRows((list) => list?.filter((x) => x.id !== n.id) ?? null);
  }

  return (
    <section className={`${card} mt-6`}>
      <h2 className="text-xl font-semibold">Send a message</h2>
      <p className="mt-1 text-sm text-muted-foreground">Only this student will see it, on their home page (e.g. a fee reminder).</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="msg-title" className={label}>Subject</label>
          <input id="msg-title" name="title" required maxLength={150} placeholder="e.g. Fee reminder" className={input} />
        </div>
        <div>
          <label htmlFor="msg-body" className={label}>Message (optional)</label>
          <textarea id="msg-body" name="body" rows={3} maxLength={2000} className={`${input} resize-y`} />
        </div>
        <button type="submit" disabled={sending} className={primaryButton}>
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Send message
        </button>
      </form>

      {rows && rows.length > 0 && (
        <ul className="mt-6 space-y-3">
          {rows.map((n) => (
            <li key={n.id} className="flex items-start gap-3 border px-4 py-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{n.title}</p>
                {n.body && <p className="mt-1 whitespace-pre-line text-sm text-foreground/80">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              <button type="button" onClick={() => remove(n)} aria-label={`Delete "${n.title}"`} className="grid size-9 shrink-0 place-items-center rounded-full border transition hover:border-red-300 hover:text-red-600">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
