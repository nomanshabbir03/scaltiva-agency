import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

// Students: exercises they haven't opened yet. Admins: unreviewed submissions
// they haven't opened since they were (re)submitted.
export type UnseenItem = { id: string; exerciseId: string };

const EVENT = "seen-changed";

async function loadUnseen(admin: boolean): Promise<UnseenItem[]> {
  const [items, seen] = await Promise.all([
    admin
      ? supabase.from("exercise_submissions").select("id, exercise_id, submitted_at").is("reviewed_at", null)
      : supabase.from("exercises").select("id"),
    supabase.from("seen_items").select("item_id, seen_at"),
  ]);
  const seenAt = new Map(((seen.data ?? []) as { item_id: string; seen_at: string }[]).map((s) => [s.item_id, s.seen_at]));
  return ((items.data ?? []) as { id: string; exercise_id?: string; submitted_at?: string }[])
    .filter((r) => {
      const at = seenAt.get(r.id);
      return !at || (r.submitted_at != null && new Date(at) < new Date(r.submitted_at));
    })
    .map((r) => ({ id: r.id, exerciseId: r.exercise_id ?? r.id }));
}

export function useUnseen() {
  const { profile } = useAuth();
  const { pathname } = useLocation();
  const [list, setList] = useState<UnseenItem[]>([]);

  useEffect(() => {
    if (!profile) return;
    const load = () => loadUnseen(profile.role === "admin").then(setList);
    load();
    window.addEventListener(EVENT, load);
    return () => window.removeEventListener(EVENT, load);
  }, [profile, pathname]);

  return list;
}

export async function markSeen(userId: string, ids: string[]) {
  if (!ids.length) return;
  await supabase.from("seen_items").upsert(
    ids.map((item_id) => ({ user_id: userId, item_id })),
    { onConflict: "user_id,item_id" },
  );
  window.dispatchEvent(new Event(EVENT));
}

export function NewDot({ className }: { className?: string }) {
  return <span role="img" aria-label="New" className={cn("inline-block size-2.5 shrink-0 rounded-full bg-primary ring-2 ring-background", className)} />;
}
