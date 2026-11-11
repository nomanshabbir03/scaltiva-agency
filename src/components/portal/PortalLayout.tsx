import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Award, ClipboardList, ListChecks, Globe, Headset, Home, KeyRound, LogOut, Menu, MoreHorizontal, NotebookPen, TrendingUp, UserRound, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Avatar from "@/components/portal/Avatar";
import { cn } from "@/lib/utils";
import { NewDot, useUnseen } from "@/lib/seen";

export function LogoutButton() {
  const { signOut } = useAuth();
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">Log out</span>
    </button>
  );
}

const LINKS = [
  { to: "/portal", label: "Home", icon: Home, end: true },
  { to: "/portal/timeline", label: "Progress timeline", icon: TrendingUp, end: false },
  { to: "/portal/exercises", label: "Exercises", icon: ClipboardList, end: false },
  { to: "/portal/quizzes", label: "Quizzes", icon: ListChecks, end: false },
  { to: "/portal/certificates", label: "Certificates", icon: Award, end: false },
  { to: "/portal/notes", label: "My notes", icon: NotebookPen, end: false },
  { to: "/portal/support", label: "Online support", icon: Headset, end: false },
  { to: "/portal/profile", label: "My profile", icon: UserRound, end: false },
  { to: "/portal/account", label: "Password", icon: KeyRound, end: false },
];

// Phone tab bar: the main sections; "More" opens the full menu.
const TABS = [
  { to: "/portal", label: "Home", icon: Home, end: true },
  { to: "/portal/timeline", label: "Progress", icon: TrendingUp, end: false },
  { to: "/portal/exercises", label: "Exercises", icon: ClipboardList, end: false },
  { to: "/portal/quizzes", label: "Quizzes", icon: ListChecks, end: false },
];

const EXTERNAL = [
  { href: "/", label: "Scaltiva website", icon: Globe },
];

const itemClass = "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition";

// Student area: top bar, a slim icon sidebar (labels when opened) on larger
// screens, and a bottom tab bar plus slide-in menu on phones.
export default function PortalLayout() {
  const { profile, avatarUrl } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const unseen = useUnseen();
  // Orange dot on a nav item while something inside it is new.
  const dotFor = (to: string) => (to === "/portal/exercises" && unseen.length > 0 ? <NewDot className="absolute -right-1 -top-1" /> : null);

  // Close the menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-muted">
      <meta name="robots" content="noindex" />
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full transition hover:bg-accent hover:text-primary"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/portal" className="flex items-center gap-2" aria-label="Portal home">
            <img src="/logo.png" alt="" className="size-9 object-contain" />
            <span className="hidden text-lg font-light uppercase tracking-[0.2em] sm:inline">Scaltiva</span>
          </Link>
          <p className="mx-auto hidden text-lg font-semibold md:block">Student Portal</p>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <Link to="/portal/profile" aria-label="My profile">
              <Avatar url={avatarUrl} name={profile?.full_name ?? ""} className="size-9 text-sm" />
            </Link>
            <span className="hidden max-w-40 truncate text-sm font-semibold uppercase lg:inline">{profile?.full_name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Phones: hidden until the menu is opened. Larger screens: always-visible icon rail. */}
        {open && <div className="fixed inset-0 top-16 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} aria-hidden />}
        <nav
          aria-label="Portal"
          className={cn(
            "fixed bottom-0 left-0 top-16 z-40 space-y-1 overflow-y-auto border-r bg-background p-2 transition-all md:sticky md:z-20 md:block md:h-[calc(100vh-4rem)]",
            open ? "block w-60" : "hidden w-[60px]",
          )}
        >
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              className={({ isActive }) =>
                cn(itemClass, isActive ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-accent hover:text-accent-foreground")
              }
            >
              <span className="relative shrink-0">
                <Icon className="size-5" />
                {dotFor(to)}
              </span>
              <span className={open ? "" : "sr-only"}>{label}</span>
            </NavLink>
          ))}
          {EXTERNAL.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              title={label}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(itemClass, "text-foreground/70 hover:bg-accent hover:text-accent-foreground")}
            >
              <Icon className="size-5 shrink-0" />
              <span className={open ? "" : "sr-only"}>{label}</span>
            </a>
          ))}
        </nav>

        {/* Bottom padding on phones keeps content clear of the tab bar. */}
        <main id="main-content" className="min-w-0 flex-1 px-3 pb-24 pt-5 sm:px-6 md:py-6">
          <Outlet />
        </main>
      </div>

      <nav aria-label="Main sections" className="fixed inset-x-0 bottom-0 z-30 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid grid-cols-5">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition", isActive ? "text-primary" : "text-foreground/60")
              }
            >
              <span className="relative">
                <Icon className="size-5" />
                {dotFor(to)}
              </span>
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition", open ? "text-primary" : "text-foreground/60")}
          >
            <MoreHorizontal className="size-5" />
            More
          </button>
        </div>
      </nav>
    </div>
  );
}
