-- Course announcements: posted by an admin to one course and visible only to
-- students enrolled in that (published) course.

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 150),
  body text not null default '' check (char_length(body) <= 2000),
  created_at timestamptz not null default now()
);
create index on public.announcements (course_id, created_at desc);

alter table public.announcements enable row level security;

create policy "announcements_admin_all" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());
create policy "announcements_student_select" on public.announcements
  for select using (
    public.is_enrolled(course_id)
    and exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  );
