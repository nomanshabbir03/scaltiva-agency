-- "New" dots: remembers when each user last opened an item (an exercise for
-- students, a submission for admins). No row, or a row older than the item's
-- latest change, means the item shows an orange dot.
create table public.seen_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null,
  seen_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Always use the server clock so it compares fairly with submitted_at.
create or replace function public.set_seen_at()
returns trigger
language plpgsql
as $$
begin
  new.seen_at = now();
  return new;
end;
$$;

create trigger seen_items_seen_at
  before insert or update on public.seen_items
  for each row execute function public.set_seen_at();

alter table public.seen_items enable row level security;

create policy "seen_items_own" on public.seen_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Existing work counts as already seen, so nobody starts with a wall of dots.
insert into public.seen_items (user_id, item_id)
select e.user_id, x.id
from public.exercises x
join public.enrollments e on e.course_id = x.course_id
on conflict do nothing;

insert into public.seen_items (user_id, item_id)
select p.id, s.id
from public.exercise_submissions s
cross join public.profiles p
where p.role = 'admin'
on conflict do nothing;

-- Welcome note (item = the student's own id): already-enrolled students have seen it.
insert into public.seen_items (user_id, item_id)
select distinct e.user_id, e.user_id
from public.enrollments e
on conflict do nothing;
