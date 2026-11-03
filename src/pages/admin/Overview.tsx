import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, PlayCircle, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { card } from "@/components/portal/form";

type Counts = { students: number; courses: number; lessons: number; enrollments: number };

const count = async (table: string, role?: string) => {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (role) query = query.eq("role", role);
  const { count } = await query;
  return count ?? 0;
};

export default function Overview() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    Promise.all([count("profiles", "student"), count("courses"), count("lessons"), count("enrollments")]).then(
      ([students, courses, lessons, enrollments]) => setCounts({ students, courses, lessons, enrollments }),
    );
  }, []);

  const tiles = [
    { label: "Students", value: counts?.students, icon: Users, to: "/admin/students" },
    { label: "Courses", value: counts?.courses, icon: BookOpen, to: "/admin/courses" },
    { label: "Lessons", value: counts?.lessons, icon: PlayCircle, to: "/admin/courses" },
    { label: "Enrollments", value: counts?.enrollments, icon: GraduationCap, to: "/admin/courses" },
  ];

  return (
    <div>
      <title>Admin | Scaltiva</title>
      <h1 className="text-3xl font-semibold">Overview</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to} className={`${card} block transition hover:-translate-y-0.5`}>
            <Icon className="size-6 text-primary" />
            <p className="mt-4 text-4xl font-semibold">{value ?? "–"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
