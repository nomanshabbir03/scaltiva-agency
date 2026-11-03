export type Exercise = {
  id: string;
  course_id: string;
  title: string;
  instructions: string | null;
  due_at: string | null;
  max_marks: number | null;
  created_at: string;
};

export type Submission = {
  id: string;
  exercise_id: string;
  user_id: string;
  answer: string | null;
  link: string | null;
  submitted_at: string;
  marks: number | null;
  feedback: string | null;
  reviewed_at: string | null;
};

export type ExerciseStatus = "reviewed" | "submitted" | "overdue" | "open";

export function exerciseStatus(exercise: Exercise, submission?: Submission | null): ExerciseStatus {
  if (submission?.reviewed_at) return "reviewed";
  if (submission) return "submitted";
  if (exercise.due_at && new Date(exercise.due_at) < new Date()) return "overdue";
  return "open";
}

export const STATUS_LABEL: Record<ExerciseStatus, string> = {
  reviewed: "Reviewed",
  submitted: "Submitted",
  overdue: "Missed",
  open: "Not submitted",
};

export const STATUS_CLASS: Record<ExerciseStatus, string> = {
  reviewed: "bg-green-50 text-green-700",
  submitted: "bg-accent text-accent-foreground",
  overdue: "bg-red-50 text-red-700",
  open: "bg-muted text-muted-foreground",
};

export const formatDue = (due: string | null) =>
  due ? new Date(due).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "No due date";
