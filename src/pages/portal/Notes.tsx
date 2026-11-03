import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, Loader2, NotebookPen, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { primaryButton, secondaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";
import { downloadCsv } from "@/lib/csv";

export type Note = { id: string; title: string; body: string; created_at: string; updated_at: string };

function exportCsv(notes: Note[]) {
  downloadCsv(
    "my-notes",
    ["Title", "Note", "Created", "Last updated"],
    notes.map((n) => [n.title, n.body, new Date(n.created_at).toLocaleString(), new Date(n.updated_at).toLocaleString()]),
  );
}

export default function Notes() {
  const { profile } = useAuth();
  const toast = useToast();
  const [notes, setNotes] = useState<Note[] | null>(null);
  const base = useLocation().pathname.startsWith("/admin") ? "/admin/notes" : "/portal/notes";

  useEffect(() => {
    if (!profile) return;
    // RLS only ever returns the signed-in user's own notes.
    supabase
      .from("notes")
      .select("id, title, body, created_at, updated_at")
      .eq("user_id", profile.id)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast("Couldn't load your notes. Please refresh the page.", "error");
        setNotes((data as Note[] | null) ?? []);
      });
  }, [profile, toast]);

  async function remove(note: Note) {
    if (!window.confirm(`Delete the note "${note.title}"?`)) return;
    const { error } = await supabase.from("notes").delete().eq("id", note.id);
    if (error) return toast("Couldn't delete the note. Please try again.", "error");
    setNotes((list) => list?.filter((n) => n.id !== note.id) ?? null);
    toast("Note deleted.");
  }

  return (
    <div className="max-w-4xl">
      <title>My Notes | Scaltiva</title>
      <h1 className="text-2xl font-semibold">My Notes</h1>
      <p className="mt-1 text-sm text-muted-foreground">Only you can see your notes.</p>

      <div className="mt-5 rounded-2xl bg-background p-4 shadow-sm sm:p-6">
        {!notes ? (
          <div className="grid place-items-center py-16" role="status" aria-label="Loading">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-xl bg-muted/60 py-12 text-center">
            <NotebookPen className="mx-auto size-10 text-primary" />
            <p className="mt-3 text-lg">No notes yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Jot down key points from your lessons so you can revise later.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="flex items-start gap-3 rounded-2xl border px-4 py-3">
                <Link to={`${base}/${n.id}`} className="min-w-0 flex-1 hover:text-primary">
                  <p className="truncate font-medium">{n.title}</p>
                  {n.body && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">Updated {new Date(n.updated_at).toLocaleString()}</p>
                </Link>
                <Link
                  to={`${base}/${n.id}`}
                  aria-label={`Edit "${n.title}"`}
                  className="grid size-9 shrink-0 place-items-center rounded-full border transition hover:border-primary hover:text-primary"
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => remove(n)}
                  aria-label={`Delete "${n.title}"`}
                  className="grid size-9 shrink-0 place-items-center rounded-full border transition hover:border-red-300 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap gap-3 border-t pt-5">
          <Link to={`${base}/new`} className={primaryButton}>
            <Plus className="size-4" />
            Add note
          </Link>
          <button type="button" onClick={() => notes && exportCsv(notes)} disabled={!notes?.length} className={secondaryButton}>
            <Download className="size-4" />
            Export to Excel
          </button>
        </div>
      </div>
    </div>
  );
}
