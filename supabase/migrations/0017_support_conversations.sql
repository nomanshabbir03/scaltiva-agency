-- Support as a conversation: admins and students exchange messages inside a query.
-- The original query detail stays as the first message.
create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  query_id uuid not null references public.support_queries(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  is_admin boolean not null default false,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index on public.support_messages (query_id, created_at);

-- Latest activity from each side, used for the "new" dots.
alter table public.support_queries
  add column last_student_at timestamptz,
  add column last_admin_at timestamptz;
update public.support_queries set last_student_at = created_at;

create or replace function public.on_support_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin then
    update public.support_queries set last_admin_at = new.created_at where id = new.query_id;
  else
    -- A student reply reopens the conversation.
    update public.support_queries set last_student_at = new.created_at, is_resolved = false where id = new.query_id;
  end if;
  return new;
end;
$$;

create trigger support_messages_activity
  after insert on public.support_messages
  for each row execute function public.on_support_message();

alter table public.support_messages enable row level security;

create policy "support_messages_admin_all" on public.support_messages
  for all using (public.is_admin()) with check (public.is_admin());
create policy "support_messages_select_own" on public.support_messages
  for select using (exists (select 1 from public.support_queries q where q.id = query_id and q.user_id = auth.uid()));
create policy "support_messages_insert_own" on public.support_messages
  for insert with check (
    sender_id = auth.uid() and is_admin = false
    and exists (select 1 from public.support_queries q where q.id = query_id and q.user_id = auth.uid())
  );

-- Live updates in the chat.
alter publication supabase_realtime add table public.support_messages;
