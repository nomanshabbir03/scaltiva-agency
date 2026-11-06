-- File attachments: admins attach a file (pdf, word, csv...) to exercises and quizzes,
-- students attach a file to their exercise submission.

alter table public.exercises add column attachment_path text, add column attachment_name text;
alter table public.quizzes add column attachment_path text, add column attachment_name text;
alter table public.exercise_submissions add column file_path text, add column file_name text;

-- Private bucket. Layout:
--   materials/<exercise or quiz id>/<file>        admin uploads, any signed-in user can read
--   submissions/<student id>/<exercise id>/<file> student uploads, owner + admins can read
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-files', 'course-files', false, 10485760, array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv', 'text/plain', 'application/zip', 'application/x-zip-compressed',
  'image/jpeg', 'image/png', 'image/webp'
])
on conflict (id) do nothing;

create policy "course_files_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'course-files' and public.is_admin())
  with check (bucket_id = 'course-files' and public.is_admin());

create policy "course_files_read_materials" on storage.objects
  for select to authenticated
  using (bucket_id = 'course-files' and (storage.foldername(name))[1] = 'materials');

create policy "course_files_own_submissions_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'course-files' and (storage.foldername(name))[1] = 'submissions' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "course_files_own_submissions_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'course-files' and (storage.foldername(name))[1] = 'submissions' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "course_files_own_submissions_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'course-files' and (storage.foldername(name))[1] = 'submissions' and (storage.foldername(name))[2] = auth.uid()::text);
