-- Admin activity log, MCQ quizzes, and course completion certificates.

---------------------------------------------------------------- quizzes

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 150),
  description text check (char_length(description) <= 2000),
  created_at timestamptz not null default now()
);
create index on public.quizzes (course_id);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  position int not null default 0,
  question text not null check (char_length(question) between 1 and 2000),
  options text[] not null check (cardinality(options) between 2 and 6),
  correct_index int not null check (correct_index >= 1 and correct_index <= cardinality(options))
);
create index on public.quiz_questions (quiz_id, position);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers int[] not null default '{}',
  score int not null,
  total int not null,
  submitted_at timestamptz not null default now(),
  unique (quiz_id, user_id) -- one attempt per student
);
create index on public.quiz_attempts (user_id);

alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "quizzes_admin_all" on public.quizzes
  for all using (public.is_admin()) with check (public.is_admin());
create policy "quizzes_student_select" on public.quizzes
  for select using (
    public.is_enrolled(course_id)
    and exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  );

-- Students never read quiz_questions directly (it holds the answers); they go
-- through get_quiz_questions / submit_quiz / get_quiz_review below.
create policy "quiz_questions_admin_all" on public.quiz_questions
  for all using (public.is_admin()) with check (public.is_admin());

create policy "quiz_attempts_admin_all" on public.quiz_attempts
  for all using (public.is_admin()) with check (public.is_admin());
create policy "quiz_attempts_select_own" on public.quiz_attempts
  for select using (user_id = auth.uid());

create or replace function public.can_take_quiz(p_quiz uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.quizzes z
    join public.courses c on c.id = z.course_id
    where z.id = p_quiz and c.is_published and public.is_enrolled(z.course_id)
  );
$$;

-- Questions and options, without the correct answers.
create or replace function public.get_quiz_questions(p_quiz uuid)
returns table (id uuid, question text, options text[])
language sql
security definer
stable
set search_path = public
as $$
  select q.id, q.question, q.options
  from public.quiz_questions q
  where q.quiz_id = p_quiz and public.can_take_quiz(p_quiz)
  order by q.position, q.id;
$$;

-- Marks the answers (1-based option numbers, in question order) and saves the one attempt.
create or replace function public.submit_quiz(p_quiz uuid, p_answers int[])
returns public.quiz_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_score int := 0;
  v_total int := 0;
  v_attempt public.quiz_attempts;
  q record;
begin
  if not public.can_take_quiz(p_quiz) then
    raise exception 'You are not enrolled in this quiz''s course.';
  end if;
  for q in select correct_index from public.quiz_questions where quiz_id = p_quiz order by position, id loop
    v_total := v_total + 1;
    if p_answers[v_total] = q.correct_index then
      v_score := v_score + 1;
    end if;
  end loop;
  if v_total = 0 then
    raise exception 'This quiz has no questions yet.';
  end if;
  insert into public.quiz_attempts (quiz_id, user_id, answers, score, total)
  values (p_quiz, auth.uid(), p_answers, v_score, v_total)
  returning * into v_attempt;
  return v_attempt;
end;
$$;

-- The correct answers, only after the student has submitted.
create or replace function public.get_quiz_review(p_quiz uuid)
returns table (id uuid, correct_index int)
language sql
security definer
stable
set search_path = public
as $$
  select q.id, q.correct_index
  from public.quiz_questions q
  where q.quiz_id = p_quiz
    and exists (select 1 from public.quiz_attempts a where a.quiz_id = p_quiz and a.user_id = auth.uid())
  order by q.position, q.id;
$$;

revoke execute on function public.can_take_quiz(uuid) from public, anon;
revoke execute on function public.get_quiz_questions(uuid) from public, anon;
revoke execute on function public.submit_quiz(uuid, int[]) from public, anon;
revoke execute on function public.get_quiz_review(uuid) from public, anon;
grant execute on function public.can_take_quiz(uuid) to authenticated;
grant execute on function public.get_quiz_questions(uuid) to authenticated;
grant execute on function public.submit_quiz(uuid, int[]) to authenticated;
grant execute on function public.get_quiz_review(uuid) to authenticated;

---------------------------------------------------------------- certificates

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  file_path text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.certificates enable row level security;

create policy "certificates_admin_all" on public.certificates
  for all using (public.is_admin()) with check (public.is_admin());
create policy "certificates_select_own" on public.certificates
  for select using (user_id = auth.uid());

-- Private bucket: files live at <student id>/<course id>.<ext>. Admins manage all;
-- a student can only read files in their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificates', 'certificates', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy "certificates_files_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'certificates' and public.is_admin())
  with check (bucket_id = 'certificates' and public.is_admin());
create policy "certificates_files_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'certificates' and (storage.foldername(name))[1] = auth.uid()::text);

---------------------------------------------------------------- activity log

create table public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,   -- insert / update / delete, or e.g. "reset password"
  entity text not null,   -- which kind of thing: courses, lessons, students...
  details text,
  created_at timestamptz not null default now()
);
create index on public.admin_activity (created_at desc);

alter table public.admin_activity enable row level security;

-- Read-only for admins. Rows are written by the trigger below and by the admin API.
create policy "admin_activity_admin_select" on public.admin_activity
  for select using (public.is_admin());

create or replace function public.log_admin_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  label text := coalesce(rec ->> 'title', rec ->> 'full_name');
begin
  if not public.is_admin() then
    return null;
  end if;
  if tg_table_name in ('enrollments', 'certificates') then
    select p.full_name || ' → ' || c.title into label
    from public.profiles p, public.courses c
    where p.id = (rec ->> 'user_id')::uuid and c.id = (rec ->> 'course_id')::uuid;
  elsif tg_table_name = 'exercise_submissions' then
    select p.full_name || ' → ' || x.title into label
    from public.profiles p, public.exercises x
    where p.id = (rec ->> 'user_id')::uuid and x.id = (rec ->> 'exercise_id')::uuid;
  end if;
  insert into public.admin_activity (actor_id, action, entity, details)
  values (auth.uid(), lower(tg_op), tg_table_name, label);
  return null;
end;
$$;

create trigger log_courses after insert or update or delete on public.courses
  for each row execute function public.log_admin_change();
create trigger log_lessons after insert or update or delete on public.lessons
  for each row execute function public.log_admin_change();
create trigger log_enrollments after insert or delete on public.enrollments
  for each row execute function public.log_admin_change();
create trigger log_exercises after insert or update or delete on public.exercises
  for each row execute function public.log_admin_change();
create trigger log_exercise_reviews after update on public.exercise_submissions
  for each row execute function public.log_admin_change();
create trigger log_announcements after insert or update or delete on public.announcements
  for each row execute function public.log_admin_change();
create trigger log_quizzes after insert or update or delete on public.quizzes
  for each row execute function public.log_admin_change();
create trigger log_certificates after insert or delete on public.certificates
  for each row execute function public.log_admin_change();
