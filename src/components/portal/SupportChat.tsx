import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { Loader2, Paperclip, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { input } from "@/components/portal/form";
import { FILE_ACCEPT, MAX_FILE_MB, removeFiles, uploadFiles, type StoredFile } from "@/lib/files";
import { FileList } from "@/components/portal/FileDownload";
import { useToast } from "@/components/portal/Toast";

type Msg = { id: string; is_admin: boolean; body: string; files: StoredFile[]; created_at: string };
const COLS = "id, is_admin, body, files, created_at";

// A WhatsApp-style thread for one support query. The first bubble is the original query.
// `admin` decides which side is "mine".
export default function SupportChat({ queryId, ownerId, detail, createdAt, studentName, admin }: {
  queryId: string; ownerId: string; detail: string; createdAt: string; studentName?: string; admin: boolean;
}) {
  const { profile } = useAuth();
  const toast = useToast();
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<File[]>([]);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () =>
      supabase.from("support_messages").select(COLS).eq("query_id", queryId).order("created_at")
        .then(({ data }) => setMsgs((data as Msg[] | null) ?? []));
    load();
    // Live: new messages from the other side appear without refreshing.
    const channel = supabase
      .channel(`support-${queryId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `query_id=eq.${queryId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryId]);

  useEffect(() => { bottom.current?.scrollIntoView({ block: "nearest" }); }, [msgs]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const body = text.trim();
    if ((!body && !picked.length) || !profile || sending) return;
    setSending(true);
    let files: StoredFile[] = [];
    try {
      files = await uploadFiles(`submissions/${ownerId}/support/${queryId}`, picked);
    } catch (err) {
      setSending(false);
      return toast((err as Error).message, "error");
    }
    const { data, error } = await supabase
      .from("support_messages")
      .insert({ query_id: queryId, sender_id: profile.id, is_admin: admin, body, files })
      .select(COLS)
      .single();
    setSending(false);
    if (error) {
      await removeFiles(files);
      return toast("Couldn't send your message. Please try again.", "error");
    }
    setText("");
    setPicked([]);
    setMsgs((list) => (list?.some((m) => m.id === data.id) ? list : [...(list ?? []), data as Msg]));
  }

  // Enter sends, Shift+Enter adds a new line.
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
  };

  const all: Msg[] = [{ id: "first", is_admin: false, body: detail, files: [], created_at: createdAt }, ...(msgs ?? [])];

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const big = files.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (big) return toast(`${big.name} is over ${MAX_FILE_MB} MB.`, "error");
    setPicked((p) => [...p, ...files]);
  }

  return (
    <div className="mt-3">
      <div className="max-h-96 space-y-2 overflow-y-auto bg-muted/60 p-3" aria-live="polite">
        {all.map((m) => {
          const mine = m.is_admin === admin;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] px-3 py-2 text-sm", mine ? "bg-primary text-primary-foreground" : "border bg-background")}>
                <p className={cn("text-xs font-semibold", mine ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {m.is_admin ? "Scaltiva support" : admin ? studentName ?? "Student" : "You"}
                </p>
                {m.body && <p className="mt-0.5 whitespace-pre-line break-words">{m.body}</p>}
                {m.files.length > 0 && <div className="mt-2 text-foreground"><FileList files={m.files} /></div>}
                <p className={cn("mt-1 text-right text-[11px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {new Date(m.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
          );
        })}
        {!msgs && <Loader2 className="mx-auto size-4 animate-spin text-primary" />}
        <div ref={bottom} />
      </div>
      {picked.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {picked.map((f, i) => (
            <li key={i} className="inline-flex max-w-full items-center gap-1 border px-2 py-1 text-xs">
              <span className="truncate">{f.name}</span>
              <button type="button" onClick={() => setPicked((p) => p.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}>
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={send} className="mt-2 flex items-end gap-2">
        <label className="grid size-11 shrink-0 cursor-pointer place-items-center border transition hover:border-primary hover:text-primary" title={`Attach files (up to ${MAX_FILE_MB} MB each)`}>
          <Paperclip className="size-4" />
          <input type="file" multiple accept={FILE_ACCEPT} onChange={onPick} className="sr-only" aria-label="Attach files" />
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          rows={2}
          maxLength={2000}
          placeholder={admin ? "Reply to the student…" : "Write a message…"}
          aria-label="Message"
          className={`${input} min-w-0 flex-1 resize-none`}
        />
        <button type="submit" disabled={sending || (!text.trim() && !picked.length)} aria-label="Send" className="grid size-11 shrink-0 place-items-center bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </form>
    </div>
  );
}
