-- Student profile details, filled in by the student on /portal/profile.
-- Kept apart from profiles so students can edit these without being able to
-- touch their own role or active status.

create table public.student_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  gender text check (gender in ('male', 'female', 'other')),
  date_of_birth date,
  cnic text check (cnic ~ '^[0-9]{13}$'),
  country text check (char_length(country) <= 60),
  city text check (char_length(city) <= 60),
  address text check (char_length(address) <= 300),
  mobile text check (mobile ~ '^\+?[0-9]{10,15}$'),
  qualification text check (char_length(qualification) <= 60),
  specialization text check (char_length(specialization) <= 100),
  heard_from text[] not null default '{}' check (cardinality(heard_from) <= 20),
  knows_freelancing boolean,
  updated_at timestamptz not null default now()
);

create trigger student_details_touch
  before update on public.student_details
  for each row execute function public.touch_updated_at();

alter table public.student_details enable row level security;

-- Students read and write only their own row (and only while active); admins read and write all.
create policy "student_details_select_own_or_admin" on public.student_details
  for select using (user_id = auth.uid() or public.is_admin());
create policy "student_details_insert_own" on public.student_details
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active)
  );
create policy "student_details_update_own" on public.student_details
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active)
  );
create policy "student_details_admin_all" on public.student_details
  for all using (public.is_admin()) with check (public.is_admin());
