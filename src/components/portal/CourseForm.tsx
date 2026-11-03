import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { slugify, uniqueCourseSlug } from "@/lib/slug";
import { card, input, label, primaryButton } from "@/components/portal/form";
import Notice, { type Message } from "@/components/portal/Notice";

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
};

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

// Create (no course passed) or edit a course. New courses get a unique slug
// from the title; when editing, the slug can be changed by hand.
export default function CourseForm({ course, onSaved, bare }: { course?: Course; onSaved: (course: Course) => void; bare?: boolean }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title")).trim();
    const description = String(form.get("description")).trim();
    const thumbnail = String(form.get("thumbnail")).trim();
    const slugInput = course ? slugify(String(form.get("slug"))) : "";

    if (!title) return setMessage({ type: "error", text: "Please enter a title." });
    if (thumbnail && !isHttpUrl(thumbnail)) return setMessage({ type: "error", text: "The thumbnail must be a full link starting with https://" });

    setMessage(null);
    setSaving(true);
    const values = {
      title,
      slug: course ? await uniqueCourseSlug(slugInput, course.id) : await uniqueCourseSlug(title),
      description: description || null,
      thumbnail_url: thumbnail || null,
      is_published: form.get("published") === "on",
    };
    const { data, error } = course
      ? await supabase.from("courses").update(values).eq("id", course.id).select().single()
      : await supabase.from("courses").insert(values).select().single();
    setSaving(false);

    if (error) return setMessage({ type: "error", text: "Couldn't save the course. Please try again." });
    if (course) setMessage({ type: "success", text: values.slug === slugInput ? "Saved." : `Saved. That address was taken, so it's now /${values.slug}.` });
    onSaved(data as Course);
  }

  return (
    <form onSubmit={onSubmit} className={bare ? "space-y-5 pt-2" : `${card} space-y-5`}>
      <div>
        <label htmlFor="title" className={label}>Title</label>
        <input id="title" name="title" required maxLength={150} defaultValue={course?.title} className={input} />
      </div>
      {course && (
        <div>
          <label htmlFor="slug" className={label}>Address (slug)</label>
          <input id="slug" name="slug" required maxLength={60} defaultValue={course.slug} className={input} />
          <p className="mt-2 text-sm text-muted-foreground">Students open it at /portal/courses/{course.slug}</p>
        </div>
      )}
      <div>
        <label htmlFor="description" className={label}>Description</label>
        <textarea id="description" name="description" rows={4} maxLength={2000} defaultValue={course?.description ?? ""} className={`${input} resize-y `} />
      </div>
      <div>
        <label htmlFor="thumbnail" className={label}>Thumbnail image link (optional)</label>
        <input id="thumbnail" name="thumbnail" type="url" placeholder="https://..." defaultValue={course?.thumbnail_url ?? ""} className={input} />
      </div>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input type="checkbox" name="published" defaultChecked={course?.is_published} className="size-5 accent-[var(--primary)]" />
        Published (enrolled students can see it)
      </label>

      <Notice message={message} />

      <button type="submit" disabled={saving} className={primaryButton}>
        {saving && <Loader2 className="size-4 animate-spin" />}
        {course ? "Save course" : "Create course"}
      </button>
    </form>
  );
}
