import { supabase } from "@/lib/supabase";

export function slugify(text: string) {
  return (
    text
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/, "") || "course"
  );
}

// "web-design", or "web-design-2", "-3"... if that slug is already taken by another course.
export async function uniqueCourseSlug(text: string, ignoreId?: string) {
  const base = slugify(text);
  const { data } = await supabase.from("courses").select("id, slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).filter((c) => c.id !== ignoreId).map((c) => c.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}
