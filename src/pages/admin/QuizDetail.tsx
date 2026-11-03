import { useEffect, useState, type ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, FileSpreadsheet, Loader2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { downloadCsv, fileName } from "@/lib/csv";
import { downloadQuizTemplate, optionLetter, parseQuestions, type NewQuestion } from "@/lib/quizCsv";
import { card, errorBox, primaryButton, secondaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";

type Quiz = { id: string; course_id: string; title: string; description: string | null; courses: { title: string } | null };
type Question = NewQuestion & { id: string; position: number };
type Attempt = { id: string; user_id: string; score: number; total: number; submitted_at: string; profiles: { full_name: string; email: string } | null };

function QuestionList({ questions }: { questions: NewQuestion[] }) {
  return (
    <ol className="space-y-3">
      {questions.map((q, i) => (
        <li key={i} className="border px-4 py-3">
          <p className="font-medium">{i + 1}. {q.question}</p>
          <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
            {q.options.map((o, j) => (
              <li key={j} className={cn("flex items-start gap-2 text-sm", j + 1 === q.correct_index ? "font-semibold text-green-700" : "text-foreground/80")}>
                {j + 1 === q.correct_index ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <span className="w-4 shrink-0 text-center text-muted-foreground">{optionLetter(j + 1)}</span>}
                {o}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export default function QuizDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [preview, setPreview] = useState<{ questions: NewQuestion[]; errors: string[]; file: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("quizzes").select("id, course_id, title, description, courses(title)").eq("id", id).maybeSingle(),
      supabase.from("quiz_questions").select("id, position, question, options, correct_index").eq("quiz_id", id).order("position").order("id"),
      supabase.from("quiz_attempts").select("id, user_id, score, total, submitted_at, profiles(full_name, email)").eq("quiz_id", id).order("submitted_at", { ascending: false }),
    ]).then(([q, qs, a]) => {
      setQuiz(q.data as unknown as Quiz | null);
      setQuestions((qs.data as Question[] | null) ?? []);
      setAttempts((a.data ?? []) as unknown as Attempt[]);
    });
  }, [id]);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = parseQuestions(await file.text());
    setPreview({ ...result, file: file.name });
  }

  async function saveQuestions() {
    if (!preview?.questions.length) return;
    if (attempts.length && !window.confirm(`${attempts.length} student(s) already took this quiz. Replacing the questions won't change their saved scores. Continue?`)) return;
    if (questions.length && !attempts.length && !window.confirm(`Replace the ${questions.length} existing questions with ${preview.questions.length} new ones?`)) return;
    setSaving(true);
    const del = await supabase.from("quiz_questions").delete().eq("quiz_id", id);
    const { data, error } = del.error
      ? { data: null, error: del.error }
      : await supabase
          .from("quiz_questions")
          .insert(preview.questions.map((q, i) => ({ ...q, quiz_id: id, position: i })))
          .select("id, position, question, options, correct_index");
    setSaving(false);
    if (error) return toast("Couldn't save the questions. Please try again.", "error");
    setQuestions(((data as Question[] | null) ?? []).sort((a, b) => a.position - b.position));
    setPreview(null);
    toast(`${preview.questions.length} questions saved.`);
  }

  async function deleteQuiz() {
    if (!quiz || !window.confirm(`Delete the quiz "${quiz.title}" with all its questions and student results?`)) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) return toast("Couldn't delete the quiz. Please try again.", "error");
    toast("Quiz deleted.");
    navigate(`/admin/courses/${quiz.course_id}`);
  }

  if (quiz === undefined) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (quiz === null) {
    return (
      <div>
        <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" />
          Courses
        </Link>
        <p className="mt-6 text-muted-foreground">Quiz not found.</p>
      </div>
    );
  }

  const average = attempts.length ? Math.round(attempts.reduce((n, a) => n + (a.score / a.total) * 100, 0) / attempts.length) : null;

  return (
    <div className="max-w-4xl">
      <title>{`${quiz.title} | Scaltiva admin`}</title>
      <Link to={`/admin/courses/${quiz.course_id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />
        {quiz.courses?.title ?? "Course"}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{quiz.title}</h1>
          <p className="mt-1 text-muted-foreground">
            {questions.length} questions · {attempts.length} attempts{average !== null && ` · average ${average}%`}
          </p>
        </div>
        <button type="button" onClick={deleteQuiz} className={`${secondaryButton} hover:border-red-300 hover:text-red-600`}>
          <Trash2 className="size-4" />
          Delete quiz
        </button>
      </div>
      {quiz.description && <p className="mt-3 whitespace-pre-line text-foreground/80">{quiz.description}</p>}

      <section className={`${card} mt-6`}>
        <h2 className="text-xl font-semibold">Upload questions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the template in Excel (one question per row, 2–6 options, and the correct letter), save it as CSV, then upload it here. Uploading replaces the current questions.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={downloadQuizTemplate} className={secondaryButton}>
            <FileSpreadsheet className="size-4" />
            Download template
          </button>
          <label className={`${primaryButton} cursor-pointer`}>
            <Upload className="size-4" />
            Choose CSV file
            <input type="file" accept=".csv,text/csv" onChange={onFile} className="sr-only" />
          </label>
        </div>

        {preview && (
          <div className="mt-6 space-y-4 border-t pt-5">
            <p className="font-medium">
              {preview.file}: {preview.questions.length} question{preview.questions.length === 1 ? "" : "s"} ready
              {preview.errors.length > 0 && `, ${preview.errors.length} row${preview.errors.length === 1 ? "" : "s"} skipped`}
            </p>
            {preview.errors.length > 0 && (
              <ul className={`${errorBox} list-inside list-disc space-y-0.5`}>
                {preview.errors.slice(0, 10).map((e) => <li key={e}>{e}</li>)}
                {preview.errors.length > 10 && <li>…and {preview.errors.length - 10} more</li>}
              </ul>
            )}
            {preview.questions.length > 0 && <QuestionList questions={preview.questions} />}
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={saveQuestions} disabled={saving || !preview.questions.length} className={primaryButton}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save {preview.questions.length} questions
              </button>
              <button type="button" onClick={() => setPreview(null)} className={secondaryButton}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      {!preview && (
        <section className={`${card} mt-6`}>
          <h2 className="text-xl font-semibold">Questions</h2>
          {questions.length === 0 ? (
            <p className="mt-3 text-muted-foreground">No questions yet. Students can&apos;t take the quiz until you upload some.</p>
          ) : (
            <div className="mt-4"><QuestionList questions={questions} /></div>
          )}
        </section>
      )}

      <section className={`${card} mt-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Results</h2>
          {attempts.length > 0 && (
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  `${fileName(quiz.title)}-results`,
                  ["Name", "Email", "Score", "Out of", "Percent", "Submitted"],
                  attempts.map((a) => [a.profiles?.full_name, a.profiles?.email, a.score, a.total, Math.round((a.score / a.total) * 100), new Date(a.submitted_at).toLocaleString()]),
                )
              }
              className={secondaryButton}
            >
              <Download className="size-4" />
              Export results
            </button>
          )}
        </div>
        {attempts.length === 0 ? (
          <p className="mt-3 text-muted-foreground">No one has taken this quiz yet.</p>
        ) : (
          <ul className="mt-4 divide-y">
            {attempts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <Link to={`/admin/students/${a.user_id}`} className="min-w-0 flex-1 truncate font-medium hover:text-primary">{a.profiles?.full_name}</Link>
                <span className="text-sm text-muted-foreground">{new Date(a.submitted_at).toLocaleString()}</span>
                <span className="font-semibold">
                  {a.score}/{a.total} <span className="text-sm font-normal text-muted-foreground">({Math.round((a.score / a.total) * 100)}%)</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
