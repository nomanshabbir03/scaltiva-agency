import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Circle, ExternalLink, Loader2, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { saveProgress, type Progress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { card, primaryButton, secondaryButton } from "@/components/portal/form";
import type { Lesson } from "@/components/portal/LessonForm";
import YouTubePlayer from "@/components/portal/YouTubePlayer";
import { useToast } from "@/components/portal/Toast";

type Course = { id: string; title: string; slug: string };

// With no ?lesson= in the URL: continue the last lesson watched (or the one
// after it, if it was finished), otherwise start at the first lesson.
function resumeIndex(lessons: Lesson[], progress: Record<string, Progress>) {
  let latest = -1;
  lessons.forEach((l, i) => {
    const p = progress[l.id];
    if (p && (latest < 0 || p.updated_at > progress[lessons[latest].id].updated_at)) latest = i;
  });
  if (latest < 0) return 0;
  return progress[lessons[latest].id].completed ? Math.min(latest + 1, lessons.length - 1) : latest;
}

export default function CoursePage() {
  const { slug = "" } = useParams();
  const { profile } = useAuth();
  const userId = profile?.id ?? "";
  const [searchParams, setSearchParams] = useSearchParams();
  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loadError, setLoadError] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setCourse(undefined);
    setLoadError(false);
    // RLS returns nothing unless the student is enrolled and the course is published.
    supabase
      .from("courses")
      .select("id, title, slug, lessons(*)")
      .eq("slug", slug)
      .order("position", { referencedTable: "lessons" })
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error) return setLoadError(true);
        const list = (data?.lessons as Lesson[] | undefined) ?? [];
        const { data: rows } = list.length
          ? await supabase
              .from("lesson_progress")
              .select("lesson_id, completed, last_position_seconds, updated_at")
              .eq("user_id", userId)
              .in("lesson_id", list.map((l) => l.id))
          : { data: [] };
        const saved: Record<string, Progress> = Object.fromEntries((rows ?? []).map(({ lesson_id, ...p }) => [lesson_id, p]));
        setProgress(saved);
        setLessons(list);
        // Pick the lesson to resume once, so finishing a video doesn't jump to the next one.
        if (list.length) {
          const resume = list[resumeIndex(list, saved)].id;
          setSearchParams((params) => (list.some((l) => l.id === params.get("lesson")) ? params : { lesson: resume }), { replace: true });
        }
        setCourse(data ? { id: data.id, title: data.title, slug: data.slug } : null);
      });
    // setSearchParams changes whenever the URL does; leaving it out stops a reload on every lesson click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, userId]);

  // Update the screen straight away, then save in the background.
  function record(lessonId: string, seconds: number, completed?: boolean) {
    setProgress((all) => ({
      ...all,
      [lessonId]: {
        completed: completed ?? all[lessonId]?.completed ?? false,
        last_position_seconds: Math.floor(seconds),
        updated_at: new Date().toISOString(),
      },
    }));
    return saveProgress(userId, lessonId, seconds, completed);
  }

  async function setCompleted(lessonId: string, seconds: number, completed: boolean) {
    const ok = await record(lessonId, seconds, completed);
    if (!ok) toast("Couldn't save. Please check your connection.", "error");
    else toast(completed ? "Lesson marked complete." : "Lesson marked as not complete.");
  }

  if (loadError) {
    return (
      <div className={`${card} py-16 text-center`}>
        <h1 className="text-2xl font-semibold">Couldn&apos;t load this course</h1>
        <p className="mt-2 text-muted-foreground">Please check your connection and try again.</p>
        <button type="button" onClick={() => window.location.reload()} className={`${secondaryButton} mt-8`}>Try again</button>
      </div>
    );
  }

  if (course === undefined) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (course === null) {
    return (
      <div className={`${card} py-16 text-center`}>
        <title>Course not found | Scaltiva</title>
        <meta name="robots" content="noindex" />
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-semibold">Course not found</h1>
        <p className="mt-2 text-muted-foreground">This course doesn&apos;t exist or you&apos;re not enrolled in it.</p>
        <Link to="/portal" className={`${secondaryButton} mt-8`}>Back to my courses</Link>
      </div>
    );
  }

  const index = Math.max(0, lessons.findIndex((l) => l.id === searchParams.get("lesson")));
  const lesson = lessons[index];
  const current = lesson ? progress[lesson.id] : undefined;
  const doneCount = lessons.filter((l) => progress[l.id]?.completed).length;
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const open = (l: Lesson) => {
    setSearchParams({ lesson: l.id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <title>{`${lesson ? `${lesson.title} · ` : ""}${course.title} | Scaltiva`}</title>
      <Link to="/portal" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />
        My courses
      </Link>
      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{course.title}</h1>

      {!lesson ? (
        <div className={`${card} mt-6 py-16 text-center`}>
          <p className="text-muted-foreground">Lessons for this course are coming soon.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <YouTubePlayer
              key={lesson.id}
              videoId={lesson.youtube_video_id}
              // A finished lesson starts again from the beginning.
              start={current && !current.completed ? current.last_position_seconds : 0}
              completed={!!current?.completed}
              onSave={(seconds, completed) => record(lesson.id, seconds, completed)}
            />

            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" onClick={() => prev && open(prev)} disabled={!prev} className={secondaryButton}>
                <ChevronLeft className="size-4" />
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Lesson {index + 1} of {lessons.length}
              </span>
              <button type="button" onClick={() => next && open(next)} disabled={!next} className={secondaryButton}>
                Next
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className={`${card} mt-4`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="text-xl font-semibold">{lesson.title}</h2>
                {current?.completed ? (
                  <button
                    type="button"
                    onClick={() => setCompleted(lesson.id, current.last_position_seconds, false)}
                    className={`${secondaryButton} border-green-200 text-green-700`}
                    title="Mark as not complete"
                  >
                    <CheckCircle2 className="size-4" />
                    Completed
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCompleted(lesson.id, current?.last_position_seconds ?? 0, true)}
                    className={`${primaryButton} px-5 py-2.5`}
                  >
                    <CheckCircle2 className="size-4" />
                    Mark complete
                  </button>
                )}
              </div>
              {lesson.description && <p className="mt-3 whitespace-pre-line text-foreground/80">{lesson.description}</p>}
              {lesson.resources.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resources</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {lesson.resources.map((r) => (
                      <li key={r.url}>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                          {r.label}
                          <ExternalLink className="size-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <aside aria-label="Lessons" className={`${card} h-fit p-3 sm:p-3 lg:sticky lg:top-6`}>
            <div className="px-3 pb-3 pt-2">
              <div className="flex justify-between text-sm">
                <h2 className="font-semibold uppercase tracking-wide text-muted-foreground">Lessons</h2>
                <span className="text-muted-foreground">
                  {doneCount}/{lessons.length} done
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(doneCount / lessons.length) * 100}%` }} />
              </div>
            </div>
            <ol className="max-h-[70vh] space-y-1 overflow-y-auto">
              {lessons.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => open(l)}
                    aria-current={l.id === lesson.id ? "true" : undefined}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-3 text-left transition",
                      l.id === lesson.id ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                    )}
                  >
                    {progress[l.id]?.completed ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-label="Completed" />
                    ) : l.id === lesson.id ? (
                      <PlayCircle className="mt-0.5 size-5 shrink-0 text-primary" aria-label="Now playing" />
                    ) : (
                      <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground/50" aria-label="Not completed" />
                    )}
                    <span className="min-w-0">
                      <span className="block font-medium">{l.title}</span>
                      {!!l.duration_minutes && <span className="block text-sm text-muted-foreground">{l.duration_minutes} min</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      )}
    </div>
  );
}
