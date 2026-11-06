-- Online support: students send queries from the portal, admins read and resolve them.
create table public.support_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic text not null,
  subject text not null check (char_length(subject) <= 250),
  detail text not null check (char_length(detail) <= 1000),
  is_resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.support_queries (user_id);
create index on public.support_queries (created_at desc);

alter table public.support_queries enable row level security;

create policy "support_admin_all" on public.support_queries
  for all using (public.is_admin()) with check (public.is_admin());
create policy "support_select_own" on public.support_queries
  for select using (user_id = auth.uid());
create policy "support_insert_own" on public.support_queries
  for insert with check (user_id = auth.uid() and is_resolved = false);
