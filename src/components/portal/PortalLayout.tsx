import { Link, NavLink, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn("text-sm font-semibold transition hover:text-primary", isActive ? "text-primary" : "text-foreground/70");

export function LogoutButton() {
  const { signOut } = useAuth();
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
    >
      <LogOut className="size-4" />
      Log out
    </button>
  );
}

// Student area: simple top bar, then the page.
export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-muted">
      <meta name="robots" content="noindex" />
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/portal" className="flex items-center gap-2" aria-label="My courses">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              S
            </span>
            <span className="hidden text-lg font-light uppercase tracking-[0.2em] sm:inline">Scaltiva</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <NavLink to="/portal" end className={navClass}>My courses</NavLink>
            <NavLink to="/portal/account" className={navClass}>Account</NavLink>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
