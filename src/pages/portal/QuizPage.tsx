import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { optionLetter } from "@/lib/quizCsv";
import { card, primaryButton, secondaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";

type Quiz = { id: string; title: string; description: string | null; courses: { title: string } | null };
type Question = { id: string; question: string; options: string[] };
type Attempt = { answers: (number | null)[]; score: number; total: number; submitted_at: string };

export default function QuizPage() {
  const { id = "" } = useParams();
  const { profile } = useAuth();
  const toast = useToast();
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [correct, setCorrect] = useState<Record<string, number>>({});
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function loadReview() {
    const { data } = await supabase.rpc("get_quiz_review", { p_quiz: id });
    setCorrect(Object.fromEntries(((data ?? []) as { id: string; correct_index: number }[]).map((r) => [r.id, r.correct_index])));
  }

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      supabase.from("quizzes").select("id, title, description, courses(title)").eq("id", id).maybeSingle(),
      // Questions come without the answers; the database keeps those until you submit.
      supabase.rpc("get_quiz_questions", { p_quiz: id }),
      supabase.from("quiz_attempts").select("answers, score, total, submitted_at").eq("quiz_id", id).eq("user_id", profile.id).maybeSingle(),
    ]).then(([q, qs, a]) => {
      const list = (qs.data ?? []) as Question[];
      setQuestions(list);
      setAnswers(list.map(() => null));
      setAttempt(a.data as Attempt | null);
      if (a.data) loadReview();
      setQuiz(q.data as unknown as Quiz | null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, profile]);

  async function submit() {
    const unanswered = answers.filter((a) => a === null).length;
    if (unanswered && !window.confirm(`You haven't answered ${unanswered} question${unanswered === 1 ? "" : "s"}. Submit anyway? You only get one attempt.`)) return;
    if (!unanswered && !window.confirm("Submit your answers? You only get one attempt.")) return;
    setSubmitting(true);
    const { data, error } = await supabase.rpc("submit_quiz", { p_quiz: id, p_answers: answers });
    setSubmitting(false);
    if (error) return toast("Couldn't submit the quiz. You may have already taken it.", "error");
    setAttempt(data as Attempt);
    await loadReview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const back = (
    <Link to="/portal/quizzes" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
      <ArrowLeft className="size-4" />
      Quizzes
    </Link>
  );

  if (quiz === undefined) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }
  if (quiz === null) {
    return (
      <div className={`${card} max-w-3xl py-16 text-center`}>
        <h1 className="text-2xl font-semibold">Quiz not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been removed, or it isn&apos;t part of your courses.</p>
        <Link to="/portal/quizzes" className={`${secondaryButton} mt-8`}>Back to quizzes</Link>
      </div>
    );
  }

  const header = (
    <>
      <title>{`${quiz.title} | Scaltiva Student Portal`}</title>
      {back}
      <h1 className="mt-3 text-2xl font-semibold">{quiz.title}</h1>
      <p className="mt-1 text-muted-foreground">{quiz.courses?.title} · {questions.length || attempt?.total || 0} questions</p>
    </>
  );

  // Already taken: score and review.
  if (attempt) {
    const percent = Math.round((attempt.score / attempt.total) * 100);
    return (
      <div className="max-w-3xl">
        {header}
        <div className={`${card} mt-5 text-center`}>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your score</p>
          <p className="mt-2 text-5xl font-semibold">
            {attempt.score}<span className="text-2xl text-muted-foreground">/{attempt.total}</span>
          </p>
          <div className="mx-auto mt-4 h-3 max-w-sm overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Score" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-muted-foreground">{percent}% · submitted {new Date(attempt.submitted_at).toLocaleString()}</p>
        </div>

        {questions.length > 0 && (
          <section className={`${card} mt-5`}>
            <h2 className="text-xl font-semibold">Review</h2>
            <ol className="mt-4 space-y-4">
              {questions.map((q, i) => {
                const mine = attempt.answers[i] ?? null;
                const right = correct[q.id];
                return (
                  <li key={q.id} className="border px-4 py-3">
                    <p className="flex items-start gap-2 font-medium">
                      {mine === right ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-label="Correct" /> : <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-label="Wrong" />}
                      {i + 1}. {q.question}
                    </p>
                    <ul className="mt-2 space-y-1 pl-7 text-sm">
                      {q.options.map((o, j) => (
                        <li
                          key={j}
                          className={cn(
                            j + 1 === right ? "font-semibold text-green-700" : j + 1 === mine ? "text-red-700 line-through" : "text-foreground/70",
                          )}
                        >
                          {optionLetter(j + 1)}. {o}
                          {j + 1 === mine && " (your answer)"}
                        </li>
                      ))}
                    </ul>
                    {mine === null && <p className="mt-1 pl-7 text-sm text-muted-foreground">Not answered</p>}
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl">
        {header}
        <p className={`${card} mt-5 text-muted-foreground`}>This quiz doesn&apos;t have any questions yet. Check back later.</p>
      </div>
    );
  }

  // Intro before starting.
  if (!started) {
    return (
      <div className="max-w-3xl">
        {header}
        <div className={`${card} mt-5`}>
          {quiz.description && <p className="whitespace-pre-line">{quiz.description}</p>}
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>{questions.length} multiple-choice questions, shown one at a time.</li>
            <li>You can go back and change answers before submitting.</li>
            <li>You get <strong className="text-foreground">one attempt</strong>.</li>
          </ul>
          <button type="button" onClick={() => setStarted(true)} className={`${primaryButton} mt-6`}>
            Start quiz
          </button>
        </div>
      </div>
    );
  }

  // One question at a time.
  const q = questions[current];
  const isLast = current === questions.length - 1;
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="max-w-3xl">
      {header}
      <div className={`${card} mt-5`}>
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>

        <fieldset className="mt-6">
          <legend className="text-lg font-semibold">{q.question}</legend>
          <div className="mt-4 space-y-2">
            {q.options.map((o, j) => {
              const chosen = answers[current] === j + 1;
              return (
                <label
                  key={j}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border px-4 py-3 transition",
                    chosen ? "border-primary bg-accent" : "hover:border-primary/50",
                  )}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={chosen}
                    onChange={() => setAnswers((list) => list.map((a, i) => (i === current ? j + 1 : a)))}
                    className="mt-1 size-4 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="font-semibold">{optionLetter(j + 1)}.</span> {o}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0} className={secondaryButton}>
            <ChevronLeft className="size-4" />
            Previous
          </button>
          {isLast ? (
            <button type="button" onClick={submit} disabled={submitting} className={primaryButton}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Submit quiz
            </button>
          ) : (
            <button type="button" onClick={() => setCurrent((c) => c + 1)} className={primaryButton}>
              Next
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>

        <nav aria-label="Jump to question" className="mt-6 flex flex-wrap gap-1.5 border-t pt-4">
          {questions.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Question ${i + 1}${answers[i] !== null ? ", answered" : ""}`}
              aria-current={i === current ? "step" : undefined}
              className={cn(
                "grid size-8 place-items-center rounded-full border text-xs font-semibold transition",
                i === current ? "border-primary bg-primary text-primary-foreground" : answers[i] !== null ? "border-primary/40 bg-accent text-accent-foreground" : "hover:border-primary",
              )}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
