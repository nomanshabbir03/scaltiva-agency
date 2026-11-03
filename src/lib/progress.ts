import { supabase } from "@/lib/supabase";

export type Progress = { completed: boolean; last_position_seconds: number; updated_at: string };

// Saves the student's position in a lesson. `completed` is only sent when given,
// so a normal position save never un-completes a lesson.
export async function saveProgress(userId: string, lessonId: string, seconds: number, completed?: boolean) {
  const row: Record<string, unknown> = {
    user_id: userId,
    lesson_id: lessonId,
    last_position_seconds: Math.max(0, Math.floor(seconds)),
  };
  if (completed !== undefined) row.completed = completed;
  const { error } = await supabase.from("lesson_progress").upsert(row, { onConflict: "user_id,lesson_id" });
  return !error;
}
