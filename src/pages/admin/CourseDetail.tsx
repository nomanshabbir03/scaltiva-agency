import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { card, primaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";
import CourseForm, { type Course } from "@/components/portal/CourseForm";
import LessonForm, { type Lesson } from "@/components/portal/LessonForm";
import CourseStudents from "@/components/portal/CourseStudents";
import CourseExercises from "@/components/portal/CourseExercises";
import { PublishedBadge } from "@/pages/admin/Courses";

const iconButton =
  "grid size-9 place-items-center rounded-full border transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40";

export default function CourseDetail() {
  const { id = "" } = useParams();
  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  // Which lesson form is open: a lesson id, "new", or none.
  const [editing, setEditing] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      supabase.from("courses").select("id, title, slug, description, thumbnail_url, is_published").eq("id", id).maybeSingle(),
      supabase.from("lessons").select("*").eq("course_id", id).order("position"),
    ]).then(([c, l]) => {
      setCourse(c.data as Course | null);
      setLessons((l.data as Lesson[] | null) ?? []);
    });
  }, [id]);

  function onLessonSaved(saved: Lesson) {
    setLessons((list) => (list.some((l) => l.id === saved.id) ? list.map((l) => (l.id === saved.id ? saved : l)) : [...list, saved]));
    setEditing(null);
    toast("Lesson saved.");
  }

  // Swap with the neighbour, then renumber 0..n and save the rows whose position changed.
  async function move(index: number, dir: -1 | 1) {
    const list = [...lessons];
    [list[index], list[index + dir]] = [list[index + dir], list[index]];
    const renumbered = list.map((l, i) => ({ ...l, position: i }));
    const changed = renumbered.filter((l, i) => l.position !== lessons.find((o) => o.id === list[i].id)?.position);
    setLessons(renumbered);
    const results = await Promise.all(changed.map((l) => supabase.from("lessons").update({ position: l.position }).eq("id", l.id)));
    if (results.some((r) => r.error)) toast("Couldn't save the new order. Please refresh and try again.", "error");
  }

  async function remove(lesson: Lesson) {
    if (!window.confirm(`Delete the lesson "${lesson.title}"? Students' progress on it will be lost.`)) return;
    const { error } = await supabase.from("lessons").delete().eq("id", lesson.id);
    if (error) return toast("Couldn't delete the lesson. Please try again.", "error");
    setLessons((list) => list.filter((l) => l.id !== lesson.id));
    toast("Lesson deleted.");
  }

  const back = (
    <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
      <ArrowLeft className="size-4" />
      Courses
    </Link>
  );

  if (course === undefined) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (course === null) {
    return (
      <div>
        {back}
        <p className="mt-6 text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  const nextPosition = lessons.length ? Math.max(...lessons.map((l) => l.position)) + 1 : 0;

  return (
    <div className="max-w-4xl">
      <title>{`${course.title} | Scaltiva admin`}</title>
      {back}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold">{course.title}</h1>
        <PublishedBadge published={course.is_published} />
      </div>

      <div className="mt-8">
        <CourseForm key={course.id} course={course} onSaved={setCourse} />
      </div>

      <section className={`${card} mt-6`}>
        <h2 className="text-xl font-semibold">Lessons</h2>

        {lessons.length === 0 && editing !== "new" && <p className="mt-3 text-muted-foreground">No lessons yet. Add the first one.</p>}

        <ol className="mt-4 space-y-3">
          {lessons.map((lesson, i) =>
            editing === lesson.id ? (
              <li key={lesson.id}>
                <LessonForm courseId={course.id} lesson={lesson} position={lesson.position} onSaved={onLessonSaved} onCancel={() => setEditing(null)} />
              </li>
            ) : (
              <li key={lesson.id} className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{lesson.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {lesson.duration_minutes ? `${lesson.duration_minutes} min` : "No length set"}
                    {lesson.resources.length > 0 && ` · ${lesson.resources.length} resource${lesson.resources.length === 1 ? "" : "s"}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move "${lesson.title}" up`} className={iconButton}>
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === lessons.length - 1} aria-label={`Move "${lesson.title}" down`} className={iconButton}>
                    <ArrowDown className="size-4" />
                  </button>
                  <button type="button" onClick={() => setEditing(lesson.id)} aria-label={`Edit "${lesson.title}"`} className={iconButton}>
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(lesson)}
                    aria-label={`Delete "${lesson.title}"`}
                    className={`${iconButton} hover:border-red-300 hover:text-red-600`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ),
          )}
        </ol>

        <div className="mt-4">
          {editing === "new" ? (
            <LessonForm courseId={course.id} position={nextPosition} onSaved={onLessonSaved} onCancel={() => setEditing(null)} />
          ) : (
            <button type="button" onClick={() => setEditing("new")} className={primaryButton}>
              <Plus className="size-4" />
              Add lesson
            </button>
          )}
        </div>
      </section>

      <CourseExercises courseId={course.id} />
      <CourseStudents courseId={course.id} />
    </div>
  );
}
