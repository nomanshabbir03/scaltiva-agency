import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Headset, Loader2, Reply, RotateCcw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/activity";
import { card, secondaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";
import { useAuth } from "@/lib/auth";
import { NewDot, markSeen, useUnseen } from "@/lib/seen";

type Query = {
  id: string;
  topic: string;
  subject: string;
  detail: string;
  is_resolved: boolean;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
};

// Queries students send from the portal's "Online support" page.
export default function Support() {
  const toast = useToast();
  const [rows, setRows] = useState<Query[] | null>(null);
  const [openOnly, setOpenOnly] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const { profile } = useAuth();
  const unseen = new Set(useUnseen().map((u) => u.id));

  // Opening a query clears its "new" dot.
  useEffect(() => {
    if (profile && open) markSeen(profile.id, [open]);
  }, [profile, open]);

  useEffect(() => {
    supabase
      .from("support_queries")
      .select("id, topic, subject, detail, is_resolved, created_at, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast("Couldn't load queries. Please refresh the page.", "error");
        setRows((data as unknown as Query[] | null) ?? []);
      });
  }, [toast]);

  async function setResolved(q: Query, is_resolved: boolean) {
    const { error } = await supabase.from("support_queries").update({ is_resolved }).eq("id", q.id);
    if (error) return toast("Couldn't update the query.", "error");
    setRows((list) => list?.map((x) => (x.id === q.id ? { ...x, is_resolved } : x)) ?? null);
  }

  async function remove(q: Query) {
    if (!window.confirm("Delete this query? This can't be undone.")) return;
    const { error } = await supabase.from("support_queries").delete().eq("id", q.id);
    if (error) return toast("Couldn't delete the query. Please try again.", "error");
    setRows((list) => list?.filter((x) => x.id !== q.id) ?? null);
    toast("Query deleted.");
  }

  const openCount = rows?.filter((q) => !q.is_resolved).length ?? 0;
  const shown = rows?.filter((q) => !openOnly || !q.is_resolved);

  return (
    <div className="max-w-4xl">
      <title>Support | Scaltiva admin</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Support queries</h1>
          <p className="mt-1 text-muted-foreground">Sent by students from Online support · {openCount} open</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="size-4 accent-[var(--primary)]" />
          Open only
        </label>
      </div>

      <div className={`${card} mt-6 overflow-hidden p-0 sm:p-0`}>
        {!shown ? (
          <div className="grid place-items-center py-16" role="status" aria-label="Loading">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : shown.length === 0 ? (
          <div className="py-16 text-center">
            <Headset className="mx-auto size-12 text-primary" />
            <p className="mt-3 text-muted-foreground">{openOnly ? "No open queries." : "No queries yet."}</p>
          </div>
        ) : (
          <ul className="divide-y">
            {shown.map((q) => {
              const expanded = open === q.id;
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : q.id)}
                    aria-expanded={expanded}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-accent sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate", !q.is_resolved && "font-semibold")}>{q.subject}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {q.profiles?.full_name} · {q.topic}
                      </p>
                    </div>
                    {unseen.has(q.id) && <NewDot />}
                    {q.is_resolved && <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">Resolved</span>}
                    <span className="shrink-0 text-sm text-muted-foreground">{timeAgo(q.created_at)}</span>
                    <ChevronDown className={cn("size-4 shrink-0 transition", expanded && "rotate-180")} />
                  </button>
                  {expanded && (
                    <div className="px-5 pb-5 sm:px-6">
                      <p className="text-sm text-muted-foreground">
                        {q.profiles?.email} · {new Date(q.created_at).toLocaleString()}
                      </p>
                      <p className="mt-3 whitespace-pre-line bg-muted/60 p-4">{q.detail}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a href={`mailto:${q.profiles?.email}?subject=${encodeURIComponent(`Re: ${q.subject}`)}`} className={secondaryButton}>
                          <Reply className="size-4" />
                          Reply by email
                        </a>
                        <button type="button" onClick={() => setResolved(q, !q.is_resolved)} className={secondaryButton}>
                          {q.is_resolved ? <RotateCcw className="size-4" /> : <CheckCircle2 className="size-4" />}
                          {q.is_resolved ? "Reopen" : "Mark as resolved"}
                        </button>
                        <button type="button" onClick={() => remove(q)} className={`${secondaryButton} hover:border-red-300 hover:text-red-600`}>
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
