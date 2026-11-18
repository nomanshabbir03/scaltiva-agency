-- Students can delete their own submission until it is reviewed or the exercise closes.
create policy "submissions_delete_own" on public.exercise_submissions
  for delete using (user_id = auth.uid() and reviewed_at is null and public.can_submit(exercise_id));
