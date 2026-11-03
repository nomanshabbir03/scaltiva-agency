import { supabase } from "@/lib/supabase";
import { adminApi } from "@/lib/adminApi";

/** Last sign-in per user id (admin only). Empty if the lookup fails. */
export async function lastLogins(): Promise<Record<string, string | null>> {
  try {
    const { logins } = await adminApi<{ logins: Record<string, string | null> }>("admin-students", { action: "last-logins" });
    return logins;
  } catch {
    return {};
  }
}

/** Last lesson activity per user id. */
export async function lastActivity(userId?: string): Promise<Record<string, string>> {
  let query = supabase.from("student_last_activity").select("user_id, last_activity_at");
  if (userId) query = query.eq("user_id", userId);
  const { data } = await query;
  return Object.fromEntries((data ?? []).map((r) => [r.user_id, r.last_activity_at]));
}

/** "Today", "Yesterday", "5 days ago", or a date for anything older than a month. */
export function timeAgo(iso: string | null | undefined) {
  if (!iso) return "Never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}
