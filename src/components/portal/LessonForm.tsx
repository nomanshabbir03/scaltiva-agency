import { useState, type FormEvent } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { youtubeId, youtubeWatchUrl } from "@/lib/youtube";
import { input, label, primaryButton, secondaryButton } from "@/components/portal/form";
import Notice, { type Message } from "@/components/portal/Notice";

export type Resource = { label: string; url: string };

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  position: number;
  duration_minutes: number | null;
  resources: Resource[];
};

type Props = {
  courseId: string;
  lesson?: Lesson;
  position: number;
  onSaved: (lesson: Lesson) => void;
  onCancel: () => void;
};

// Add (no lesson passed) or edit a lesson. Only the YouTube video ID is stored.
export default function LessonForm({ courseId, lesson, position, onSaved, onCancel }: Props) {
  const [resources, setResources] = useState<Resource[]>(lesson?.resources ?? []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const prefix = lesson?.id ?? "new";

  const setResource = (i: number, field: keyof Resource, value: string) =>
    setResources((list) => list.map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title")).trim();
    const description = String(form.get("description")).trim();
    const videoId = youtubeId(String(form.get("youtube")));
    const duration = String(form.get("duration")).trim();
    const cleanResources = resources
      .map((r) => ({ label: r.label.trim(), url: r.url.trim() }))
      .filter((r) => r.label || r.url);

    if (!title) return setMessage({ type: "error", text: "Please enter a title." });
    if (!videoId) return setMessage({ type: "error", text: "That doesn't look like a YouTube video link. Paste the link from the video's Share button." });
    if (cleanResources.some((r) => !r.label || !/^https?:\/\/\S+$/i.test(r.url)))
      return setMessage({ type: "error", text: "Each resource needs a name and a full link starting with https://" });

    setMessage(null);
    setSaving(true);
    const values = {
      course_id: courseId,
      title,
      description: description || null,
      youtube_video_id: videoId,
      duration_minutes: duration ? Math.max(0, Math.round(Number(duration))) : null,
      resources: cleanResources,
      position,
    };
    const { data, error } = lesson
      ? await supabase.from("lessons").update(values).eq("id", lesson.id).select().single()
      : await supabase.from("lessons").insert(values).select().single();
    setSaving(false);

    if (error) return setMessage({ type: "error", text: "Couldn't save the lesson. Please try again." });
    onSaved(data as Lesson);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border bg-muted/50 p-4 sm:p-6">
      <div>
        <label htmlFor={`${prefix}-title`} className={label}>Lesson title</label>
        <input id={`${prefix}-title`} name="title" required maxLength={150} defaultValue={lesson?.title} className={input} />
      </div>
      <div>
        <label htmlFor={`${prefix}-youtube`} className={label}>YouTube link</label>
        <input
          id={`${prefix}-youtube`}
          name="youtube"
          required
          placeholder="https://youtu.be/..."
          defaultValue={lesson ? youtubeWatchUrl(lesson.youtube_video_id) : ""}
          className={input}
        />
      </div>
      <div>
        <label htmlFor={`${prefix}-description`} className={label}>Description (optional)</label>
        <textarea
          id={`${prefix}-description`}
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={lesson?.description ?? ""}
          className={`${input} resize-y rounded-3xl`}
        />
      </div>
      <div className="max-w-48">
        <label htmlFor={`${prefix}-duration`} className={label}>Length in minutes (optional)</label>
        <input id={`${prefix}-duration`} name="duration" type="number" min={0} max={1000} defaultValue={lesson?.duration_minutes ?? ""} className={input} />
      </div>

      <fieldset>
        <legend className={label}>Resources (optional)</legend>
        <div className="space-y-3">
          {resources.map((r, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2 sm:flex-nowrap">
              <input
                aria-label={`Resource ${i + 1} name`}
                placeholder="Name, e.g. Slides"
                value={r.label}
                onChange={(e) => setResource(i, "label", e.target.value)}
                className={`${input} sm:w-48`}
              />
              <input
                aria-label={`Resource ${i + 1} link`}
                placeholder="https://..."
                value={r.url}
                onChange={(e) => setResource(i, "url", e.target.value)}
                className={`${input} min-w-0 flex-1`}
              />
              <button
                type="button"
                onClick={() => setResources((list) => list.filter((_, j) => j !== i))}
                aria-label={`Remove resource ${i + 1}`}
                className="mb-1 grid size-11 shrink-0 place-items-center rounded-full border transition hover:border-red-300 hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setResources((list) => [...list, { label: "", url: "" }])} className={`${secondaryButton} mt-3`}>
          <Plus className="size-4" />
          Add resource
        </button>
      </fieldset>

      <Notice message={message} />

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {lesson ? "Save lesson" : "Add lesson"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}
