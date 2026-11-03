-- Student portal: Row Level Security.

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

-- profiles: read own, admin reads/writes all. Students cannot update profiles directly.
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- courses: admin all; students read published courses they're enrolled in
create policy "courses_admin_all" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());
create policy "courses_student_select" on public.courses
  for select using (is_published and public.is_enrolled(id));

-- lessons: admin all; students read lessons of enrolled, published courses
create policy "lessons_admin_all" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());
create policy "lessons_student_select" on public.lessons
  for select using (
    public.is_enrolled(course_id)
    and exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  );

-- enrollments: admin all; students read their own
create policy "enrollments_admin_all" on public.enrollments
  for all using (public.is_admin()) with check (public.is_admin());
create policy "enrollments_select_own" on public.enrollments
  for select using (user_id = auth.uid());

-- lesson_progress: students manage their own rows, only for lessons they're
-- enrolled in (is_enrolled also requires an active profile); admin reads all.
create policy "progress_own_select" on public.lesson_progress
  for select using (user_id = auth.uid() or public.is_admin());
create policy "progress_own_insert" on public.lesson_progress
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.lessons l
      where l.id = lesson_id and public.is_enrolled(l.course_id)
    )
  );
create policy "progress_own_update" on public.lesson_progress
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.lessons l
      where l.id = lesson_id and public.is_enrolled(l.course_id)
    )
  );
