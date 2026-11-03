-- Student portal: tables and helper functions.

create type public.user_role as enum ('admin', 'student');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  thumbnail_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  youtube_video_id text not null,
  position int not null default 0,
  duration_minutes int,
  resources jsonb not null default '[]'::jsonb, -- [{ "label": "...", "url": "..." }]
  created_at timestamptz not null default now()
);
create index on public.lessons (course_id, position);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  last_position_seconds int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Keep updated_at current on every progress save.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger lesson_progress_touch
  before update on public.lesson_progress
  for each row execute function public.touch_updated_at();

-- Helpers used by RLS (security definer avoids recursive policy checks).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

create or replace function public.is_enrolled(p_course uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.enrollments e
    join public.profiles p on p.id = e.user_id
    where e.user_id = auth.uid() and e.course_id = p_course and p.is_active
  );
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_enrolled(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_enrolled(uuid) to authenticated;
