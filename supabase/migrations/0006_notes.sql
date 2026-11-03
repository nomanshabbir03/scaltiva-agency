-- Private notes: each user sees and edits only their own. There is deliberately
-- no admin policy, so not even admins can read someone else's notes.

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 150),
  body text not null default '' check (char_length(body) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.notes (user_id, updated_at desc);

create trigger notes_touch
  before update on public.notes
  for each row execute function public.touch_updated_at();

alter table public.notes enable row level security;

create policy "notes_own" on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
