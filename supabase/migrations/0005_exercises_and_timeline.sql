-- Exercises (admin sets them per course, students submit) and a completed_at
-- timestamp on lesson progress for the Progress Timeline charts.

-- 1. When was each lesson completed? (updated_at changes on every position save.)
alter table public.lesson_progress add column completed_at timestamptz;
update public.lesson_progress set completed_at = updated_at where completed;

create or replace function public.set_completed_at()
returns trigger
language plpgsql
as $$
begin
  if not new.completed then
    new.completed_at = null;
  elsif tg_op = 'INSERT' or not old.completed then
    new.completed_at = now();
  end if;
  return new;
end;
$$;

create trigger lesson_progress_completed_at
  before insert or update on public.lesson_progress
  for each row execute function public.set_completed_at();

-- 2. Exercises.
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 150),
  instructions text check (char_length(instructions) <= 5000),
  due_at timestamptz,
  max_marks int check (max_marks between 1 and 1000),
  created_at timestamptz not null default now()
);
create index on public.exercises (course_id);

create table public.exercise_submissions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answer text check (char_length(answer) <= 10000),
  link text check (link ~ '^https?://' and char_length(link) <= 500),
  submitted_at timestamptz not null default now(),
  marks int check (marks >= 0),
  feedback text check (char_length(feedback) <= 2000),
  reviewed_at timestamptz,
  unique (exercise_id, user_id)
);
create index on public.exercise_submissions (user_id);

-- Students can't mark their own work: only an admin may set marks/feedback.
create or replace function public.guard_submission()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.marks = null;
      new.feedback = null;
      new.reviewed_at = null;
    else
      new.marks = old.marks;
      new.feedback = old.feedback;
      new.reviewed_at = old.reviewed_at;
      new.exercise_id = old.exercise_id;
    end if;
    new.submitted_at = now();
  end if;
  return new;
end;
$$;

create trigger exercise_submissions_guard
  before insert or update on public.exercise_submissions
  for each row execute function public.guard_submission();

-- Is this exercise open to the current student: enrolled, published, not past due?
create or replace function public.can_submit(p_exercise uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.exercises x
    join public.courses c on c.id = x.course_id
    where x.id = p_exercise
      and c.is_published
      and public.is_enrolled(x.course_id)
      and (x.due_at is null or now() <= x.due_at)
  );
$$;

revoke execute on function public.can_submit(uuid) from public, anon;
grant execute on function public.can_submit(uuid) to authenticated;

alter table public.exercises enable row level security;
alter table public.exercise_submissions enable row level security;

create policy "exercises_admin_all" on public.exercises
  for all using (public.is_admin()) with check (public.is_admin());
create policy "exercises_student_select" on public.exercises
  for select using (
    public.is_enrolled(course_id)
    and exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  );

create policy "submissions_admin_all" on public.exercise_submissions
  for all using (public.is_admin()) with check (public.is_admin());
create policy "submissions_select_own" on public.exercise_submissions
  for select using (user_id = auth.uid());
create policy "submissions_insert_own" on public.exercise_submissions
  for insert with check (user_id = auth.uid() and public.can_submit(exercise_id));
create policy "submissions_update_own" on public.exercise_submissions
  for update using (user_id = auth.uid() and reviewed_at is null)
  with check (user_id = auth.uid() and public.can_submit(exercise_id));
