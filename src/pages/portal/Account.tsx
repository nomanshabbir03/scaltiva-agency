import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { input, label, primaryButton } from "@/components/portal/form";

type Status = { type: "error" | "success"; text: string } | null;

export default function Account() {
  const { profile } = useAuth();
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const password = String(form.get("password"));
    if (password.length < 8) return setStatus({ type: "error", text: "Use at least 8 characters." });
    if (password !== form.get("confirm")) return setStatus({ type: "error", text: "The two passwords don't match." });

    setSending(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSending(false);
    if (error) {
      setStatus({
        type: "error",
        text: error.code === "same_password" ? "Choose a password different from your current one." : "Couldn't update your password. Please try again.",
      });
    } else {
      formEl.reset();
      setStatus({ type: "success", text: "Your password has been updated." });
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <title>Account | Scaltiva</title>
      <h1 className="text-3xl font-semibold">Account</h1>
      <p className="mt-2 text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{profile?.email}</span>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-[2rem] bg-background p-6 shadow-xl shadow-primary/5 sm:p-8">
        <h2 className="text-xl font-semibold">Change password</h2>
        <div>
          <label htmlFor="password" className={label}>New password</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className={input} />
        </div>
        <div>
          <label htmlFor="confirm" className={label}>Confirm new password</label>
          <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className={input} />
        </div>

        {status && (
          <p
            role={status.type === "error" ? "alert" : "status"}
            className={
              status.type === "error"
                ? "rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                : "rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700"
            }
          >
            {status.text}
          </p>
        )}

        <button type="submit" disabled={sending} className={primaryButton}>
          {sending && <Loader2 className="size-4 animate-spin" />}
          Update password
        </button>
      </form>
    </div>
  );
}
