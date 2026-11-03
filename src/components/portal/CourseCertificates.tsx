import { useEffect, useState, type ChangeEvent } from "react";
import { Award, ExternalLink, Loader2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { input, primaryButton, secondaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";

type Student = { id: string; name: string; email: string; cnic: string | null };
type Certificate = { id: string; user_id: string; file_path: string; issued_at: string };
type Pending = { file: File; userId: string };

const MAX_BYTES = 5 * 1024 * 1024;
const letters = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

// Guess the student from a filename: their email, CNIC digits, or full name in it.
function matchStudent(fileName: string, students: Student[]) {
  const base = fileName.toLowerCase().replace(/\.[a-z0-9]+$/, "");
  const digits = base.replace(/\D/g, "");
  return (
    students.find((s) => base.includes(s.email.toLowerCase())) ??
    students.find((s) => s.cnic && digits.includes(s.cnic)) ??
    students.find((s) => letters(s.name).length > 2 && letters(base) === letters(s.name)) ??
    students.find((s) => letters(s.name).length > 5 && letters(base).includes(letters(s.name)))
  )?.id ?? "";
}

const extOf = (file: File) => (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "jpg").toLowerCase();

// Body of the "Certificates" section on the admin course page.
export default function CourseCertificates({ courseId }: { courseId: string }) {
  const toast = useToast();
  const [students, setStudents] = useState<Student[] | null>(null);
  const [certs, setCerts] = useState<Record<string, Certificate>>({});
  const [pending, setPending] = useState<Pending[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("enrollments").select("user_id, profiles(full_name, email)").eq("course_id", courseId),
      supabase.from("certificates").select("id, user_id, file_path, issued_at").eq("course_id", courseId),
    ]).then(async ([e, c]) => {
      const enrolled = (e.data ?? []) as unknown as { user_id: string; profiles: { full_name: string; email: string } | null }[];
      const { data: details } = enrolled.length
        ? await supabase.from("student_details").select("user_id, cnic").in("user_id", enrolled.map((x) => x.user_id))
        : { data: [] };
      const cnic = Object.fromEntries((details ?? []).map((d) => [d.user_id, d.cnic]));
      setStudents(
        enrolled
          .map((x) => ({ id: x.user_id, name: x.profiles?.full_name ?? "", email: x.profiles?.email ?? "", cnic: cnic[x.user_id] ?? null }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setCerts(Object.fromEntries(((c.data ?? []) as Certificate[]).map((x) => [x.user_id, x])));
    });
  }, [courseId]);

  function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    const tooBig = files.filter((f) => f.size > MAX_BYTES);
    if (tooBig.length) toast(`${tooBig.length} file(s) are over 5 MB and were skipped.`, "error");
    setPending((list) => [...list, ...files.filter((f) => f.size <= MAX_BYTES).map((file) => ({ file, userId: matchStudent(file.name, students ?? []) }))]);
  }

  async function uploadAll() {
    const ready = pending.filter((p) => p.userId);
    const ids = ready.map((p) => p.userId);
    if (new Set(ids).size !== ids.length) return toast("Two files are matched to the same student. Fix that first.", "error");
    const replacing = ready.filter((p) => certs[p.userId]).length;
    if (replacing && !window.confirm(`${replacing} student(s) already have a certificate for this course. Replace them?`)) return;

    setProgress({ done: 0, total: ready.length });
    const saved: Certificate[] = [];
    let failed = 0;
    for (const p of ready) {
      const path = `${p.userId}/${courseId}.${extOf(p.file)}`;
      const old = certs[p.userId];
      const up = await supabase.storage.from("certificates").upload(path, p.file, { upsert: true, contentType: p.file.type || undefined });
      const row = up.error
        ? null
        : await supabase
            .from("certificates")
            .upsert({ user_id: p.userId, course_id: courseId, file_path: path, issued_at: new Date().toISOString() }, { onConflict: "user_id,course_id" })
            .select("id, user_id, file_path, issued_at")
            .single();
      if (!row || row.error) failed++;
      else {
        saved.push(row.data as Certificate);
        if (old && old.file_path !== path) await supabase.storage.from("certificates").remove([old.file_path]);
      }
      setProgress((pr) => pr && { ...pr, done: pr.done + 1 });
    }
    setProgress(null);
    setCerts((all) => ({ ...all, ...Object.fromEntries(saved.map((c) => [c.user_id, c])) }));
    setPending((list) => list.filter((p) => !p.userId));
    toast(failed ? `${saved.length} uploaded, ${failed} failed. Please try those again.` : `${saved.length} certificate${saved.length === 1 ? "" : "s"} uploaded.`, failed ? "error" : "success");
  }

  async function view(cert: Certificate) {
    const { data } = await supabase.storage.from("certificates").createSignedUrl(cert.file_path, 300);
    if (data) window.open(data.signedUrl, "_blank", "noopener");
  }

  async function remove(cert: Certificate, name: string) {
    if (!window.confirm(`Delete ${name}'s certificate for this course?`)) return;
    await supabase.storage.from("certificates").remove([cert.file_path]);
    const { error } = await supabase.from("certificates").delete().eq("id", cert.id);
    if (error) return toast("Couldn't delete the certificate.", "error");
    setCerts((all) => Object.fromEntries(Object.entries(all).filter(([k]) => k !== cert.user_id)));
    toast("Certificate deleted.");
  }

  if (!students) {
    return (
      <div className="grid place-items-center py-10" role="status" aria-label="Loading">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (students.length === 0) return <p className="mt-3 text-muted-foreground">Enroll students first, then upload their certificates here.</p>;

  const matched = pending.filter((p) => p.userId).length;
  const issued = students.filter((s) => certs[s.id]);

  return (
    <div>
      <div className="mt-4 border bg-muted/50 p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">
          Select all the certificate files at once (JPG, PNG or PDF, up to 5 MB each). Name each file with the student&apos;s email, CNIC or full name, e.g.{" "}
          <code className="rounded bg-background px-1">ali.khan@gmail.com.jpg</code>, and it&apos;s matched automatically. Each student only ever sees their own.
        </p>
        <label className={`${primaryButton} mt-4 cursor-pointer`}>
          <Upload className="size-4" />
          Choose files
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={onFiles} className="sr-only" />
        </label>

        {pending.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-medium">
              {matched} of {pending.length} file{pending.length === 1 ? "" : "s"} matched to a student
            </p>
            <ul className="mt-3 space-y-2">
              {pending.map((p, i) => (
                <li key={`${p.file.name}-${i}`} className="flex flex-wrap items-center gap-2 border bg-background px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm">{p.file.name}</span>
                  <label className="sr-only" htmlFor={`cert-${i}`}>Student for {p.file.name}</label>
                  <select
                    id={`cert-${i}`}
                    value={p.userId}
                    onChange={(e) => setPending((list) => list.map((x, j) => (j === i ? { ...x, userId: e.target.value } : x)))}
                    className={cn(input, "mt-0 w-full py-2 text-sm sm:w-64", !p.userId && "border-red-300")}
                  >
                    <option value="">Pick a student…</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {certs[s.id] ? " (replace)" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setPending((list) => list.filter((_, j) => j !== i))}
                    aria-label={`Remove ${p.file.name}`}
                    className="grid size-9 place-items-center rounded-full border transition hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={uploadAll} disabled={!matched || !!progress} className={primaryButton}>
                {progress && <Loader2 className="size-4 animate-spin" />}
                {progress ? `Uploading ${progress.done}/${progress.total}…` : `Upload ${matched} certificate${matched === 1 ? "" : "s"}`}
              </button>
              <button type="button" onClick={() => setPending([])} disabled={!!progress} className={secondaryButton}>Clear</button>
              {matched < pending.length && <span className="text-sm text-muted-foreground">Files without a student are skipped.</span>}
            </div>
          </div>
        )}
      </div>

      <h3 className="mt-6 font-semibold">
        Issued: {issued.length} of {students.length} students
      </h3>
      <ul className="mt-3 divide-y">
        {students.map((s) => {
          const cert = certs[s.id];
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <Award className={cn("size-5 shrink-0", cert ? "text-primary" : "text-muted-foreground/40")} />
              <span className="min-w-0 flex-1 truncate">{s.name}</span>
              {cert ? (
                <>
                  <span className="text-sm text-muted-foreground">{new Date(cert.issued_at).toLocaleDateString()}</span>
                  <button type="button" onClick={() => view(cert)} aria-label={`View ${s.name}'s certificate`} className="grid size-9 place-items-center rounded-full border transition hover:border-primary hover:text-primary">
                    <ExternalLink className="size-4" />
                  </button>
                  <button type="button" onClick={() => remove(cert, s.name)} aria-label={`Delete ${s.name}'s certificate`} className="grid size-9 place-items-center rounded-full border transition hover:border-red-300 hover:text-red-600">
                    <Trash2 className="size-4" />
                  </button>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Not issued</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
