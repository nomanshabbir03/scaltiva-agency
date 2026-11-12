import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { adminApi } from "@/lib/adminApi";
import { lastActivity, lastLogins, timeAgo } from "@/lib/activity";
import { card, input, label, primaryButton } from "@/components/portal/form";
import Notice, { type Message } from "@/components/portal/Notice";
import StudentCourses from "@/components/portal/StudentCourses";
import StudentProfileInfo from "@/components/portal/StudentProfileInfo";
import ProgressTimeline from "@/components/portal/ProgressTimeline";
import StudentMessages from "@/components/portal/StudentMessages";
import { StatusBadge } from "@/pages/admin/Students";

type Student = {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

export default function StudentDetail() {
  const { id = "" } = useParams();
  const [student, setStudent] = useState<Student | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<Message>(null);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<Message>(null);
  const [seen, setSeen] = useState<{ login?: string | null; activity?: string }>({});

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name, email, is_active, created_at")
      .eq("id", id)
      .eq("role", "student")
      .maybeSingle()
      .then(({ data }) => setStudent(data as Student | null));
    Promise.all([lastLogins(), lastActivity(id)]).then(([logins, activity]) => setSeen({ login: logins[id], activity: activity[id] }));
  }, [id]);

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fullName = String(form.get("fullName")).trim();
    const isActive = form.get("isActive") === "on";
    if (student?.is_active && !isActive && !window.confirm(`Disable ${student.full_name}? They will be signed out and can't log in until you enable them again.`)) return;
    setSaveMsg(null);
    setSaving(true);
    try {
      await adminApi("admin-students", { action: "update", id, fullName, isActive });
      setStudent((s) => s && { ...s, full_name: fullName, is_active: isActive });
      setSaveMsg({ type: "success", text: "Saved." });
    } catch (err) {
      setSaveMsg({ type: "error", text: (err as Error).message });
    }
    setSaving(false);
  }

  async function onReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const password = String(new FormData(formEl).get("password"));
    setResetMsg(null);
    setResetting(true);
    try {
      await adminApi("admin-students", { action: "reset-password", id, password });
      formEl.reset();
      setResetMsg({ type: "success", text: "Password updated. Share the new password with the student." });
    } catch (err) {
      setResetMsg({ type: "error", text: (err as Error).message });
    }
    setResetting(false);
  }

  const back = (
    <Link to="/admin/students" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
      <ArrowLeft className="size-4" />
      Students
    </Link>
  );

  if (student === undefined) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (student === null) {
    return (
      <div>
        {back}
        <p className="mt-6 text-muted-foreground">Student not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <title>{`${student.full_name} | Scaltiva admin`}</title>
      {back}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold">{student.full_name}</h1>
        <StatusBadge active={student.is_active} />
      </div>
      <p className="mt-2 text-muted-foreground">
        {student.email} · added {new Date(student.created_at).toLocaleDateString()}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Last login: <span className="font-medium text-foreground">{timeAgo(seen.login)}</span> · Last lesson activity:{" "}
        <span className="font-medium text-foreground">{timeAgo(seen.activity)}</span>
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={onSave} className={`${card} space-y-5`}>
          <h2 className="text-xl font-semibold">Details</h2>
          <div>
            <label htmlFor="fullName" className={label}>Full name</label>
            <input id="fullName" name="fullName" required maxLength={100} defaultValue={student.full_name} className={input} />
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="isActive" defaultChecked={student.is_active} className="size-5 accent-[var(--primary)]" />
            Active (can sign in)
          </label>
          <Notice message={saveMsg} />
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save
          </button>
        </form>

        <form onSubmit={onReset} className={`${card} space-y-5`}>
          <h2 className="text-xl font-semibold">Reset password</h2>
          <div>
            <label htmlFor="password" className={label}>New password</label>
            <input id="password" name="password" type="text" required minLength={8} maxLength={72} autoComplete="off" className={input} />
          </div>
          <Notice message={resetMsg} />
          <button type="submit" disabled={resetting} className={primaryButton}>
            {resetting && <Loader2 className="size-4 animate-spin" />}
            Set password
          </button>
        </form>
      </div>

      <StudentMessages studentId={student.id} />
      <StudentProfileInfo studentId={student.id} name={student.full_name} />
      <StudentCourses studentId={student.id} />
      <section className={`${card} mt-6`}>
        <h2 className="mb-4 text-xl font-semibold">Progress timeline</h2>
        <ProgressTimeline userId={student.id} />
      </section>
    </div>
  );
}
