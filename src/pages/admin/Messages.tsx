import { useEffect, useState } from "react";
import { ChevronDown, Inbox, Loader2, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/activity";
import { card, secondaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";

type Message = {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

const SERVICE_LABEL: Record<string, string> = {
  development: "Development",
  automation: "Automation",
  seo: "SEO",
  marketing: "Marketing",
  other: "Other",
};

// Messages sent through the website's contact form.
export default function Messages() {
  const toast = useToast();
  const [rows, setRows] = useState<Message[] | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast("Couldn't load messages. Please refresh the page.", "error");
        setRows((data as Message[] | null) ?? []);
      });
  }, [toast]);

  async function setRead(m: Message, is_read: boolean) {
    setRows((list) => list?.map((x) => (x.id === m.id ? { ...x, is_read } : x)) ?? null);
    const { error } = await supabase.from("contact_messages").update({ is_read }).eq("id", m.id);
    if (error) toast("Couldn't update the message.", "error");
  }

  function toggle(m: Message) {
    setOpen(open === m.id ? null : m.id);
    if (!m.is_read) setRead(m, true);
  }

  async function remove(m: Message) {
    if (!window.confirm(`Delete the message from ${m.name}? This can't be undone.`)) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", m.id);
    if (error) return toast("Couldn't delete the message. Please try again.", "error");
    setRows((list) => list?.filter((x) => x.id !== m.id) ?? null);
    toast("Message deleted.");
  }

  const unread = rows?.filter((m) => !m.is_read).length ?? 0;
  const shown = rows?.filter((m) => !unreadOnly || !m.is_read);

  return (
    <div className="max-w-4xl">
      <title>Messages | Scaltiva admin</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Messages</h1>
          <p className="mt-1 text-muted-foreground">From the website contact form · {unread} unread</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="size-4 accent-[var(--primary)]" />
          Unread only
        </label>
      </div>

      <div className={`${card} mt-6 overflow-hidden p-0 sm:p-0`}>
        {!shown ? (
          <div className="grid place-items-center py-16" role="status" aria-label="Loading">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : shown.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="mx-auto size-12 text-primary" />
            <p className="mt-3 text-muted-foreground">{unreadOnly ? "No unread messages." : "No messages yet."}</p>
          </div>
        ) : (
          <ul className="divide-y">
            {shown.map((m) => {
              const expanded = open === m.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => toggle(m)}
                    aria-expanded={expanded}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-accent sm:px-6"
                  >
                    {m.is_read ? <MailOpen className="size-5 shrink-0 text-muted-foreground" /> : <Mail className="size-5 shrink-0 text-primary" />}
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate", !m.is_read && "font-semibold")}>
                        {m.name} <span className="font-normal text-muted-foreground">· {SERVICE_LABEL[m.service] ?? m.service}</span>
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{m.message}</p>
                    </div>
                    <span className="shrink-0 text-sm text-muted-foreground">{timeAgo(m.created_at)}</span>
                    <ChevronDown className={cn("size-4 shrink-0 transition", expanded && "rotate-180")} />
                  </button>
                  {expanded && (
                    <div className="px-5 pb-5 sm:px-6">
                      <p className="text-sm text-muted-foreground">
                        {m.email} · {new Date(m.created_at).toLocaleString()}
                      </p>
                      <p className="mt-3 whitespace-pre-line rounded-2xl bg-muted/60 p-4">{m.message}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Scaltiva")}`} className={secondaryButton}>
                          <Reply className="size-4" />
                          Reply by email
                        </a>
                        <button type="button" onClick={() => setRead(m, false)} className={secondaryButton}>
                          <Mail className="size-4" />
                          Mark as unread
                        </button>
                        <button type="button" onClick={() => remove(m)} className={`${secondaryButton} hover:border-red-300 hover:text-red-600`}>
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
