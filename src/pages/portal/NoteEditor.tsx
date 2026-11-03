import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { input, label, primaryButton, secondaryButton } from "@/components/portal/form";
import Notice, { type Message } from "@/components/portal/Notice";
import { useToast } from "@/components/portal/Toast";
import type { Note } from "@/pages/portal/Notes";

// <base>/new adds a note; <base>/:id edits one (base is /portal/notes or /admin/notes).
export default function NoteEditor() {
  const { id = "new" } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const base = useLocation().pathname.startsWith("/admin") ? "/admin/notes" : "/portal/notes";
  const toast = useToast();
  const [note, setNote] = useState<Note | null | undefined>(isNew ? null : undefined);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("notes")
      .select("id, title, body, created_at, updated_at")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setNote((data as Note | null) ?? null));
  }, [id, isNew]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title")).trim();
    const body = String(form.get("body")).trim();
    if (!title) return setMessage({ type: "error", text: "Please give your note a title." });

    setMessage(null);
    setSaving(true);
    // user_id defaults to the signed-in user in the database.
    const { error } = isNew
      ? await supabase.from("notes").insert({ title, body })
      : await supabase.from("notes").update({ title, body }).eq("id", id);
    setSaving(false);
    if (error) return setMessage({ type: "error", text: "Couldn't save your note. Please try again." });
    toast(isNew ? "Note added." : "Note saved.");
    navigate(base);
  }

  if (note === undefined) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isNew && note === null) {
    return (
      <div className="max-w-3xl bg-background py-16 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Note not found</h1>
        <Link to={base} className={`${secondaryButton} mt-6`}>Back to my notes</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <title>{`${isNew ? "Add note" : "Edit note"} | Scaltiva`}</title>
      <Link to={base} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />
        My Notes
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">{isNew ? "Add Note" : "Edit Note"}</h1>

      <form onSubmit={onSubmit} className="mt-5 space-y-5 bg-background p-4 shadow-sm sm:p-6">
        <div>
          <label htmlFor="title" className={label}>Title</label>
          <input id="title" name="title" required maxLength={150} autoFocus={isNew} defaultValue={note?.title} className={input} />
        </div>
        <div>
          <label htmlFor="body" className={label}>Note</label>
          <textarea id="body" name="body" rows={12} maxLength={20000} defaultValue={note?.body} className={`${input} resize-y `} />
        </div>
        <Notice message={message} />
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isNew ? "Add" : "Save"}
          </button>
          <Link to={base} className={secondaryButton}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
