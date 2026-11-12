import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, MessageSquareText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { markSeen } from "@/lib/seen";
import { STATUS_CLASS, STATUS_LABEL, exerciseStatus, formatDue, type Exercise, type Submission } from "@/lib/exercises";
import { FILE_ACCEPT, MAX_FILE_MB, pickedFiles, removeFiles, uploadFiles, type StoredFile } from "@/lib/files";
import { FileList } from "@/components/portal/FileDownload";
import { card, input, label, primaryButton, secondaryButton } from "@/components/portal/form";
import Notice, { type Message } from "@/components/portal/Notice";
import { useToast } from "@/components/portal/Toast";

export default function ExercisePage() {
  const { id = "" } = useParams();
  const { profile } = useAuth();
  const toast = useToast();
  const [exercise, setExercise] = useState<(Exercise & { courses: { title: string } | null }) | null | undefined>(undefined);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      supabase.from("exercises").select("*, courses(title)").eq("id", id).maybeSingle(),
      supabase.from("exercise_submissions").select("*").eq("exercise_id", id).eq("user_id", profile.id).maybeSingle(),
    ]).then(([e, s]) => {
      setExercise(e.data as (Exercise & { courses: { title: string } | null }) | null);
      setSubmission(s.data as Submission | null);
      // Opening it clears the dot for the exercise and for any new marks/feedback.
      if (e.data) markSeen(profile.id, s.data ? [id, (s.data as Submission).id] : [id]);
    });
  }, [id, profile]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const form = new FormData(e.currentTarget);
    const answer = String(form.get("answer")).trim() || null;
    const link = String(form.get("link")).trim() || null;
    const picked = pickedFiles(form, "file");
    const removed = new Set(form.getAll("remove_file").map(String));
    const kept = (submission?.files ?? []).filter((f) => !removed.has(f.path));
    if (!answer && !link && !picked.length && !kept.length) return setMessage({ type: "error", text: "Write your answer, upload a file or add a link to your work." });
    if (link && !/^https?:\/\/\S+$/i.test(link)) return setMessage({ type: "error", text: "The link must start with https://" });

    setMessage(null);
    setSaving(true);
    let added: StoredFile[] = [];
    try {
      added = await uploadFiles(`submissions/${profile.id}/${id}`, picked);
    } catch (err) {
      setSaving(false);
      return setMessage({ type: "error", text: (err as Error).message });
    }
    const { data, error } = await supabase
      .from("exercise_submissions")
      .upsert({ exercise_id: id, user_id: profile.id, answer, link, files: [...kept, ...added] }, { onConflict: "exercise_id,user_id" })
      .select()
      .single();
    setSaving(false);
    if (error) return setMessage({ type: "error", text: "Couldn't submit. The due date may have passed, or your work was already reviewed." });
    await removeFiles((submission?.files ?? []).filter((f) => removed.has(f.path)));
    setSubmission(data as Submission);
    toast(submission ? "Submission updated." : "Exercise submitted.");
  }

  if (exercise === undefined) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }
  if (exercise === null) {
    return (
      <div className={`${card} py-16 text-center`}>
        <h1 className="text-2xl font-semibold">Exercise not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been removed, or it isn&apos;t part of your courses.</p>
        <Link to="/portal/exercises" className={`${secondaryButton} mt-8`}>Back to exercises</Link>
      </div>
    );
  }

  const status = exerciseStatus(exercise, submission);
  // Students can submit or edit until the due date, and until their work is reviewed.
  const canEdit = !submission?.reviewed_at && !(exercise.due_at && new Date(exercise.due_at) < new Date());

  return (
    <div className="max-w-3xl">
      <title>{`${exercise.title} | Scaltiva Student Portal`}</title>
      <Link to="/portal/exercises" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />
        Exercises
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{exercise.title}</h1>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_CLASS[status])}>{STATUS_LABEL[status]}</span>
      </div>
      <p className="mt-1 text-muted-foreground">
        {exercise.courses?.title} · Due: {formatDue(exercise.due_at)}
        {exercise.max_marks ? ` · ${exercise.max_marks} marks` : ""}
      </p>

      {exercise.files.length > 0 && (
        <div className="mt-5">
          <FileList files={exercise.files} prefix="Download assignment: " />
        </div>
      )}

      {exercise.instructions && (
        <div className={`${card} mt-5`}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Instructions</h2>
          <p className="mt-3 whitespace-pre-line">{exercise.instructions}</p>
        </div>
      )}

      {submission?.reviewed_at && (
        <div className="mt-5 border border-green-200 bg-green-50 p-6 text-green-900">
          <h2 className="flex items-center gap-2 font-semibold">
            <MessageSquareText className="size-5" />
            Feedback from Scaltiva
          </h2>
          {submission.marks != null && (
            <p className="mt-2 text-2xl font-semibold">
              {submission.marks}
              {exercise.max_marks ? ` / ${exercise.max_marks}` : ""} marks
            </p>
          )}
          {submission.feedback && <p className="mt-2 whitespace-pre-line">{submission.feedback}</p>}
        </div>
      )}

      {canEdit ? (
        <form onSubmit={onSubmit} className={`${card} mt-5 space-y-5`}>
          <h2 className="text-xl font-semibold">{submission ? "Your submission" : "Submit your work"}</h2>
          <div>
            <label htmlFor="answer" className={label}>Your answer</label>
            <textarea id="answer" name="answer" rows={8} maxLength={10000} defaultValue={submission?.answer ?? ""} className={`${input} resize-y `} />
          </div>
          <div>
            <label htmlFor="link" className={label}>Link to your work (optional)</label>
            <input id="link" name="link" type="url" placeholder="https://drive.google.com/..." defaultValue={submission?.link ?? ""} className={input} />
            <p className="mt-2 text-sm text-muted-foreground">For files, upload them to Google Drive (shared with anyone with the link) and paste the link here.</p>
          </div>
          <div>
            <label htmlFor="file" className={label}>Upload your files (optional)</label>
            <input id="file" name="file" type="file" multiple accept={FILE_ACCEPT} className={`${input} file:mr-4 file:border-0 file:bg-accent file:px-3 file:py-1 file:text-sm file:font-semibold`} />
            <p className="mt-2 text-sm text-muted-foreground">PDF, Word, Excel, CSV and more, up to {MAX_FILE_MB} MB each. Pick several at once; new uploads are added to your files.</p>
            {submission && submission.files.length > 0 && <div className="mt-3"><FileList files={submission.files} /></div>}
            {submission?.files.map((f) => (
              <label key={f.path} className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" name="remove_file" value={f.path} />
                Remove {f.name}
              </label>
            ))}
          </div>
          <Notice message={message} />
          {submission && <p className="text-sm text-muted-foreground">Last submitted {new Date(submission.submitted_at).toLocaleString()}. You can update it until the due date.</p>}
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {submission ? "Update submission" : "Submit"}
          </button>
        </form>
      ) : submission ? (
        <div className={`${card} mt-5`}>
          <h2 className="text-xl font-semibold">Your submission</h2>
          <p className="mt-1 text-sm text-muted-foreground">Submitted {new Date(submission.submitted_at).toLocaleString()}</p>
          {submission.answer && <p className="mt-4 whitespace-pre-line bg-muted/60 p-4">{submission.answer}</p>}
          {submission.files.length > 0 && <div className="mt-3"><FileList files={submission.files} /></div>}
          {submission.link && (
            <a href={submission.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 break-all font-semibold text-primary hover:underline">
              {submission.link}
              <ExternalLink className="size-4 shrink-0" />
            </a>
          )}
        </div>
      ) : (
        <p className={`${card} mt-5 text-muted-foreground`}>The due date has passed, so this exercise can no longer be submitted.</p>
      )}
    </div>
  );
}
