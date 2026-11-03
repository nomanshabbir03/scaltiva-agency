import { useAuth } from "@/lib/auth";
import ProgressTimeline from "@/components/portal/ProgressTimeline";

export default function Timeline() {
  const { profile } = useAuth();
  return (
    <div>
      <title>Progress Timeline | Scaltiva Student Portal</title>
      <h1 className="text-2xl font-semibold">Progress Timeline</h1>
      <div className="mt-5 bg-background p-4 shadow-sm sm:p-6">
        {profile && <ProgressTimeline userId={profile.id} />}
      </div>
    </div>
  );
}
