import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

// Students: new exercises, and exercises that were marked since they last looked.
// Admins: unreviewed submissions not opened since they were (re)submitted, and
// open support queries not opened yet.
export type UnseenKind = "exercise" | "review" | "submission" | "support";
export type UnseenItem = { id: string; kind: UnseenKind; exerciseId?: string };

const EVENT = "seen-changed";

// An item is new if it was never opened, or changed after it was last opened.
type Candidate = UnseenItem & { changedAt?: string | null };

async function loadUnseen(admin: boolean): Promise<UnseenItem[]> {
  const [a, b, seen] = await Promise.all([
    admin
      ? supabase.from("exercise_submissions").select("id, exercise_id, submitted_at").is("reviewed_at", null)
      : supabase.from("exercises").select("id"),
    admin
      ? supabase.from("support_queries").select("id").eq("is_resolved", false)
      : supabase.from("exercise_submissions").select("id, exercise_id, reviewed_at").not("reviewed_at", "is", null),
    supabase.from("seen_items").select("item_id, seen_at"),
  ]);
  type R = { id: string; exercise_id?: string; submitted_at?: string; reviewed_at?: string };
  const first = (a.data ?? []) as R[];
  const second = (b.data ?? []) as R[];
  const candidates: Candidate[] = admin
    ? [
        ...first.map((r) => ({ id: r.id, kind: "submission" as const, exerciseId: r.exercise_id, changedAt: r.submitted_at })),
        ...second.map((r) => ({ id: r.id, kind: "support" as const })),
      ]
    : [
        ...first.map((r) => ({ id: r.id, kind: "exercise" as const, exerciseId: r.id })),
        ...second.map((r) => ({ id: r.id, kind: "review" as const, exerciseId: r.exercise_id, changedAt: r.reviewed_at })),
      ];
  const seenAt = new Map(((seen.data ?? []) as { item_id: string; seen_at: string }[]).map((s) => [s.item_id, s.seen_at]));
  return candidates
    .filter((c) => {
      const at = seenAt.get(c.id);
      return !at || (c.changedAt != null && new Date(at) < new Date(c.changedAt));
    })
    .map(({ id, kind, exerciseId }) => ({ id, kind, exerciseId }));
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
