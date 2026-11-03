-- Contact inbox: admins can mark messages read and delete them.
alter table public.contact_messages add column is_read boolean not null default false;

create policy "contact_messages_admin_update" on public.contact_messages
  for update using (public.is_admin()) with check (public.is_admin());
create policy "contact_messages_admin_delete" on public.contact_messages
  for delete using (public.is_admin());

-- Last time each student watched or saved progress on a lesson. security_invoker
-- means the lesson_progress RLS still applies: admins see everyone, students only themselves.
create view public.student_last_activity
with (security_invoker = true) as
  select user_id, max(updated_at) as last_activity_at
  from public.lesson_progress
  group by user_id;
