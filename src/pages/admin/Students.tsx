import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Loader2, Plus, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";
import { lastActivity, lastLogins, timeAgo } from "@/lib/activity";
import { DETAILS_SELECT, GENDERS, formatCnic, type StudentDetails } from "@/lib/studentDetails";
import { card, errorBox, input, secondaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";

type Row = {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  enrollments: { course_id: string }[];
};

type Sort = "name" | "newest" | "active";

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        active ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground",
      )}
    >
      {active ? "Active" : "Disabled"}
    </span>
  );
}

const select = `${input} mt-0 w-auto py-2.5 pr-10 text-sm`;

export default function Students() {
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [activity, setActivity] = useState<Record<string, string>>({});
  const [logins, setLogins] = useState<Record<string, string | null>>({});
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [status, setStatus] = useState<"" | "active" | "disabled">("");
  const [sort, setSort] = useState<Sort>("newest");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id, full_name, email, is_active, created_at, enrollments(course_id)").eq("role", "student"),
      supabase.from("courses").select("id, title").order("title"),
      lastActivity(),
    ]).then(([p, c, a]) => {
      if (p.error) setError("Couldn't load students. Please refresh the page.");
      setRows((p.data as Row[] | null) ?? []);
      setCourses(c.data ?? []);
      setActivity(a);
    });
    // Slower (goes through the server), so it fills in when ready.
    lastLogins().then(setLogins);
  }, []);

  const term = search.trim().toLowerCase();
  const shown = rows
    ?.filter((r) => !term || r.full_name.toLowerCase().includes(term) || r.email.includes(term))
    .filter((r) => !course || r.enrollments.some((e) => e.course_id === course))
    .filter((r) => !status || r.is_active === (status === "active"))
    .sort((a, b) =>
      sort === "name"
        ? a.full_name.localeCompare(b.full_name)
        : sort === "newest"
          ? b.created_at.localeCompare(a.created_at)
          : (activity[b.id] ?? "").localeCompare(activity[a.id] ?? ""),
    );

  async function exportStudents() {
    if (!shown) return;
    setExporting(true);
    const { data } = await supabase.from("student_details").select(`user_id, ${DETAILS_SELECT}`);
    setExporting(false);
    const details = Object.fromEntries(((data ?? []) as unknown as (StudentDetails & { user_id: string })[]).map((d) => [d.user_id, d]));
    const titles = Object.fromEntries(courses.map((c) => [c.id, c.title]));
    downloadCsv(
      "students",
      ["Name", "Email", "Status", "Courses", "Added", "Last login", "Last activity", "Mobile", "CNIC", "Gender", "Date of birth", "City", "Country", "Address", "Qualification", "Field of study", "Heard from", "Familiar with freelancing"],
      shown.map((s) => {
        const d = details[s.id];
        return [
          s.full_name,
          s.email,
          s.is_active ? "Active" : "Disabled",
          s.enrollments.map((e) => titles[e.course_id]).filter(Boolean).join("; "),
          new Date(s.created_at).toLocaleDateString(),
          logins[s.id] ? new Date(logins[s.id]!).toLocaleString() : "",
          activity[s.id] ? new Date(activity[s.id]).toLocaleString() : "",
          d?.mobile,
          d?.cnic && formatCnic(d.cnic),
          GENDERS.find((g) => g.value === d?.gender)?.label,
          d?.date_of_birth,
          d?.city,
          d?.country,
          d?.address,
          d?.qualification,
          d?.specialization,
          d?.heard_from.join("; "),
          d?.knows_freelancing == null ? "" : d.knows_freelancing ? "Yes" : "No",
        ];
      }),
    );
    toast(`Exported ${shown.length} student${shown.length === 1 ? "" : "s"}.`);
  }

  return (
    <div>
      <title>Students | Scaltiva admin</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Students</h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportStudents} disabled={!shown?.length || exporting} className={secondaryButton}>
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Export
          </button>
          <Link
            to="/admin/students/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-95"
          >
            <Plus className="size-4" />
            New student
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <label htmlFor="search" className="sr-only">Search students</label>
          <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className={cn(input, "mt-0 py-2.5 pl-11 text-sm")}
          />
        </div>
        <label className="sr-only" htmlFor="filter-course">Course</label>
        <select id="filter-course" value={course} onChange={(e) => setCourse(e.target.value)} className={select}>
          <option value="">All courses</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <label className="sr-only" htmlFor="filter-status">Status</label>
        <select id="filter-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={select}>
          <option value="">Active and disabled</option>
          <option value="active">Active only</option>
          <option value="disabled">Disabled only</option>
        </select>
        <label className="sr-only" htmlFor="sort">Sort by</label>
        <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={select}>
          <option value="newest">Newest first</option>
          <option value="name">Name (A–Z)</option>
          <option value="active">Recently active</option>
        </select>
      </div>

      {error && <p role="alert" className={cn(errorBox, "mt-6")}>{error}</p>}

      <div className={cn(card, "mt-6 overflow-hidden p-0 sm:p-0")}>
        {!shown ? (
          <div className="grid place-items-center py-16" role="status" aria-label="Loading">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : shown.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            {rows?.length ? "No students match these filters." : "No students yet. Create the first one."}
          </p>
        ) : (
          <>
            <p className="border-b px-5 py-2.5 text-sm text-muted-foreground sm:px-6">
              {shown.length} student{shown.length === 1 ? "" : "s"}
            </p>
            <ul className="divide-y">
              {shown.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/admin/students/${s.id}`}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4 transition hover:bg-accent sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.full_name}</p>
                      <p className="truncate text-sm text-muted-foreground">{s.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span title="Last lesson activity">Active: {timeAgo(activity[s.id])}</span>
                      <span>
                        {s.enrollments.length} course{s.enrollments.length === 1 ? "" : "s"}
                      </span>
                      <StatusBadge active={s.is_active} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
