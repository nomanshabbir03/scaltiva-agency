import { Link, NavLink, Outlet } from "react-router-dom";
import { BookOpen, LayoutDashboard, NotebookPen, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/portal/PortalLayout";

const LINKS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/students", label: "Students", icon: Users, end: false },
  { to: "/admin/courses", label: "Courses", icon: BookOpen, end: false },
  { to: "/admin/notes", label: "My notes", icon: NotebookPen, end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition",
    isActive ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
  );

// Admin area: sidebar on large screens, a scrollable row of links on phones.
export default function AdminLayout() {
  const { profile } = useAuth();
  return (
    <div className="min-h-screen bg-muted">
      <meta name="robots" content="noindex" />
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link to="/admin" className="flex items-center gap-2" aria-label="Admin overview">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              S
            </span>
            <span className="text-lg font-light uppercase tracking-[0.2em]">Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">{profile?.email}</span>
            <LogoutButton />
          </div>
        </div>
        <nav aria-label="Admin" className="flex gap-2 overflow-x-auto border-t px-4 py-2 lg:hidden">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="flex">
        <nav aria-label="Admin" className="sticky top-[61px] hidden h-[calc(100vh-61px)] w-60 shrink-0 space-y-1 border-r bg-background p-4 lg:block">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <main id="main-content" className="min-w-0 flex-1 px-4 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
