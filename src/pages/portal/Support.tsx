import { useEffect, useState, type FormEvent } from "react";
import { Headset, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { timeAgo } from "@/lib/activity";
import { card, input, label, primaryButton } from "@/components/portal/form";
import Notice, { type Message } from "@/components/portal/Notice";
import { useToast } from "@/components/portal/Toast";

export const SUPPORT_TOPICS = ["Courses & lessons", "Exercises", "Quizzes", "Certificates", "Login & account", "Technical problem", "Other"];

type Query = { id: string; topic: string; subject: string; detail: string; is_resolved: boolean; created_at: string };

export default function Support() {
  const { profile } = useAuth();
  const toast = useToast();
  const [queries, setQueries] = useState<Query[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [subjectLength, setSubjectLength] = useState(0);
  const [detailLength, setDetailLength] = useState(0);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("support_queries")
      .select("id, topic, subject, detail, is_resolved, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setQueries((data as Query[] | null) ?? []));
  }, [profile]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const topic = String(form.get("topic"));
    const subject = String(form.get("subject")).trim();
    const detail = String(form.get("detail")).trim();
    if (!topic || !subject || !detail) return setMessage({ type: "error", text: "Please fill in all the fields." });

    setMessage(null);
    setSaving(true);
    const { data, error } = await supabase
      .from("support_queries")
      .insert({ user_id: profile.id, topic, subject, detail })
      .select("id, topic, subject, detail, is_resolved, created_at")
      .single();
    setSaving(false);
    if (error) return setMessage({ type: "error", text: "Couldn't send your query. Please try again." });
    setQueries((list) => [data as Query, ...(list ?? [])]);
    formEl.reset();
    setSubjectLength(0);
    setDetailLength(0);
    toast("Your query has been sent. We'll get back to you soon.");
  }

  return (
    <div className="max-w-2xl">
      <title>Online support | Scaltiva Student Portal</title>
      <div className="flex items-center gap-3">
        <Headset className="size-8 text-primary" />
        <h1 className="text-3xl font-semibold">Online support</h1>
      </div>
      <p className="mt-2 text-muted-foreground">Have a question or a problem? Send us a query and our team will reply.</p>

      <form onSubmit={onSubmit} className={`${card} mt-6 space-y-5`}>
        <div>
          <label htmlFor="topic" className={label}>Query related to</label>
          <select id="topic" name="topic" required defaultValue="" className={input}>
            <option value="" disabled>Select query related to</option>
            {SUPPORT_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="subject" className={label}>Subject / Reference <span className="text-xs text-muted-foreground">(maximum 250 characters)</span></label>
          <input id="subject" name="subject" required maxLength={250} onChange={(e) => setSubjectLength(e.target.value.length)} className={input} />
          <p className="mt-1 text-right text-xs text-muted-foreground">{subjectLength}/250</p>
        </div>
        <div>
          <label htmlFor="detail" className={label}>Query detail <span className="text-xs text-muted-foreground">(maximum 1000 characters)</span></label>
          <textarea id="detail" name="detail" required rows={6} maxLength={1000} onChange={(e) => setDetailLength(e.target.value.length)} className={`${input} resize-y`} />
          <p className="mt-1 text-right text-xs text-muted-foreground">{detailLength}/1000</p>
        </div>
        <Notice message={message} />
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Submit
        </button>
      </form>

      <h2 className="mt-10 text-xl font-semibold">Your queries</h2>
      {!queries ? (
        <div className="grid place-items-center py-10" role="status" aria-label="Loading">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : queries.length === 0 ? (
        <p className="mt-3 text-muted-foreground">You haven't sent any queries yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {queries.map((q) => (
            <li key={q.id} className="border bg-background px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{q.subject}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${q.is_resolved ? "bg-green-50 text-green-700" : "bg-accent text-accent-foreground"}`}>
                  {q.is_resolved ? "Resolved" : "Open"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{q.topic} · {timeAgo(q.created_at)}</p>
              <p className="mt-2 whitespace-pre-line text-sm">{q.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
