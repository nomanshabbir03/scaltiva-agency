import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { card, errorBox, input, label, primaryButton } from "@/components/portal/form";

export default function NewStudent() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    setSending(true);
    try {
      const { id } = await adminApi<{ id: string }>("admin-students", {
        action: "create",
        fullName: form.get("fullName"),
        email: form.get("email"),
        password: form.get("password"),
      });
      navigate(`/admin/students/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setSending(false);
    }
  }

  return (
    <div className="max-w-xl">
      <title>New student | Scaltiva admin</title>
      <Link to="/admin/students" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />
        Students
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">New student</h1>
      <p className="mt-2 text-muted-foreground">
        Share the email and temporary password with the student. They can change it under Account after signing in.
      </p>

      <form onSubmit={onSubmit} className={`${card} mt-8 space-y-5`}>
        <div>
          <label htmlFor="fullName" className={label}>Full name</label>
          <input id="fullName" name="fullName" required maxLength={100} autoComplete="off" className={input} />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" required autoComplete="off" className={input} />
        </div>
        <div>
          <label htmlFor="password" className={label}>Temporary password</label>
          <input id="password" name="password" type="text" required minLength={8} maxLength={72} autoComplete="off" className={input} />
          <p className="mt-2 text-sm text-muted-foreground">At least 8 characters.</p>
        </div>

        {error && <p role="alert" className={errorBox}>{error}</p>}

        <button type="submit" disabled={sending} className={primaryButton}>
          {sending && <Loader2 className="size-4 animate-spin" />}
          Create student
        </button>
      </form>
    </div>
  );
}
