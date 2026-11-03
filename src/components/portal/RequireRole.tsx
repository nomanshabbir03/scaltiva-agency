import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { homeFor, useAuth, type Role } from "@/lib/auth";

export function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center" role="status" aria-label="Loading">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

// Guards a group of routes in the browser. This only decides what is shown:
// the real protection is Row Level Security and the role checks in /api.
export default function RequireRole({ role }: { role: Role }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!session || !profile) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (profile.role !== role) return <Navigate to={homeFor(profile.role)} replace />;
  return <Outlet />;
}
