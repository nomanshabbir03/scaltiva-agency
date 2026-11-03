import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DETAILS_SELECT, GENDERS, formatCnic, type StudentDetails } from "@/lib/studentDetails";
import { card } from "@/components/portal/form";
import Avatar from "@/components/portal/Avatar";

// Read-only "Profile information" section on the admin student page.
export default function StudentProfileInfo({ studentId, name }: { studentId: string; name: string }) {
  const [details, setDetails] = useState<StudentDetails | null | undefined>(undefined);

  useEffect(() => {
    supabase
      .from("student_details")
      .select(DETAILS_SELECT)
      .eq("user_id", studentId)
      .maybeSingle()
      .then(({ data }) => setDetails(data as StudentDetails | null));
  }, [studentId]);

  const rows: [string, string | null | undefined][] = details
    ? [
        ["Gender", GENDERS.find((g) => g.value === details.gender)?.label],
        ["Date of birth", details.date_of_birth && new Date(details.date_of_birth).toLocaleDateString()],
        ["CNIC / B-form", details.cnic && formatCnic(details.cnic)],
        ["Mobile", details.mobile],
        ["City", [details.city, details.country].filter(Boolean).join(", ")],
        ["Address", details.address],
        ["Qualification", details.qualification],
        ["Field of study", details.specialization],
        ["Heard about us from", details.heard_from.join(", ")],
        ["Familiar with freelancing", details.knows_freelancing === null ? null : details.knows_freelancing ? "Yes" : "No"],
      ]
    : [];

  return (
    <section className={`${card} mt-6`}>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar url={details?.avatar_url} name={name} className="size-16 border-4 border-accent text-xl" />
        <h2 className="flex-1 text-xl font-semibold">Profile information</h2>
        {details?.updated_at && (
          <p className="text-sm text-muted-foreground">Updated {new Date(details.updated_at).toLocaleDateString()}</p>
        )}
      </div>

      {details === undefined ? (
        <div className="grid place-items-center py-10" role="status" aria-label="Loading">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : details === null ? (
        <p className="mt-3 text-muted-foreground">The student hasn&apos;t filled in their profile yet.</p>
      ) : (
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {rows.map(([name, value]) => (
            <div key={name}>
              <dt className="text-sm text-muted-foreground">{name}</dt>
              <dd className="mt-0.5 break-words font-medium">{value || "–"}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
