import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { homeFor, useAuth } from "@/lib/auth";
import { PageLoader } from "@/components/portal/RequireRole";
import { input, label, primaryButton } from "@/components/portal/form";

// After this many wrong passwords in a row, the form pauses for a minute.
// Supabase also rate-limits sign-ins on the server; this just gives a clear message sooner.
const MAX_FAILURES = 5;
const LOCK_SECONDS = 60;

export default function Login() {
  const { session, profile, loading, notice } = useAuth();
  const location = useLocation();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [failures, setFailures] = useState(0);
  const [lockedFor, setLockedFor] = useState(0);

  useEffect(() => {
    if (lockedFor <= 0) return;
    const timer = window.setTimeout(() => setLockedFor((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [lockedFor]);

  if (profile) {
    // Only go back to the page they came from if it belongs to their area.
    const from = (location.state as { from?: string } | null)?.from;
    const home = homeFor(profile.role);
    return <Navigate to={from?.startsWith(home) ? from : home} replace />;
  }
  if (loading && session) return <PageLoader />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    setSending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    });
    setSending(false);
    if (!error) return setFailures(0);
    if (error.code === "invalid_credentials") {
      const count = failures + 1;
      setFailures(count >= MAX_FAILURES ? 0 : count);
      if (count >= MAX_FAILURES) {
        setLockedFor(LOCK_SECONDS);
        return setError("Too many wrong attempts. Please wait a minute and try again.");
      }
    }
    if (error.status === 429) setError("Too many attempts. Please wait a few minutes and try again.");
    else if (error.code === "invalid_credentials") setError("Incorrect email or password.");
    else if (error.code === "user_banned") setError("Your account has been disabled. Please contact Scaltiva.");
    else setError("Couldn't sign you in. Please check your connection and try again.");
  }

  const message = error || notice;

  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-muted px-4 py-12">
      <meta name="robots" content="noindex" />
      <title>Student login | Scaltiva</title>
      <div className="w-full max-w-md">
        <Link to="/" className="mx-auto flex w-fit items-center gap-3" aria-label="Scaltiva home">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            S
          </span>
          <span className="text-2xl font-light uppercase tracking-[0.2em]">Scaltiva</span>
        </Link>

        <div className="mt-8 bg-background p-6 shadow-xl shadow-primary/5 sm:p-10">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in with the details Scaltiva sent you.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className={label}>Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" className={input} />
            </div>
            <div>
              <label htmlFor="password" className={label}>Password</label>
              <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
            </div>

            {message && (
              <p role="alert" className="bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={sending || lockedFor > 0}
              className={`${primaryButton} w-full`}
            >
              {sending && <Loader2 className="size-4 animate-spin" />}
              {lockedFor > 0 ? `Try again in ${lockedFor}s` : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Forgot your password? Contact Scaltiva and we&apos;ll reset it.
        </p>
      </div>
    </main>
  );
}
