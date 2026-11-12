-- 1. Multiple files on exercises, quizzes and submissions: a list of {path, name}.
alter table public.exercises add column files jsonb not null default '[]';
alter table public.quizzes add column files jsonb not null default '[]';
alter table public.exercise_submissions add column files jsonb not null default '[]';

update public.exercises set files = jsonb_build_array(jsonb_build_object('path', attachment_path, 'name', attachment_name))
where attachment_path is not null;
update public.quizzes set files = jsonb_build_array(jsonb_build_object('path', attachment_path, 'name', attachment_name))
where attachment_path is not null;
update public.exercise_submissions set files = jsonb_build_array(jsonb_build_object('path', file_path, 'name', file_name))
where file_path is not null;

alter table public.exercises drop column attachment_path, drop column attachment_name;
alter table public.quizzes drop column attachment_path, drop column attachment_name;
alter table public.exercise_submissions drop column file_path, drop column file_name;

-- 2. Direct messages: an announcement with user_id goes to that one student only.
alter table public.announcements alter column course_id drop not null;
alter table public.announcements add column user_id uuid references public.profiles(id) on delete cascade;
alter table public.announcements add constraint announcements_target check (course_id is not null or user_id is not null);
create index on public.announcements (user_id, created_at desc);

create policy "announcements_student_select_own" on public.announcements
  for select using (user_id = auth.uid());

-- 3. "How to use the portal" video, uploaded by an admin.
create table public.portal_settings (
  key text primary key,
  value text not null
);
alter table public.portal_settings enable row level security;

create policy "portal_settings_admin_all" on public.portal_settings
  for all using (public.is_admin()) with check (public.is_admin());
create policy "portal_settings_read" on public.portal_settings
  for select to authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portal-videos', 'portal-videos', true, 52428800, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do nothing;

create policy "portal_videos_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'portal-videos' and public.is_admin())
  with check (bucket_id = 'portal-videos' and public.is_admin());
