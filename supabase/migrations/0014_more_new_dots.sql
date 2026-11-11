-- More "new" dots: students see one when their exercise is marked, admins
-- see one when a student sends a support query.

-- Stamp reviews with the server clock so they compare fairly with seen_at.
create or replace function public.set_reviewed_at()
returns trigger
language plpgsql
as $$
begin
  if new.reviewed_at is not null and new.reviewed_at is distinct from old.reviewed_at then
    new.reviewed_at = now();
  end if;
  return new;
end;
$$;

create trigger exercise_submissions_reviewed_at
  before update on public.exercise_submissions
  for each row execute function public.set_reviewed_at();

-- Existing reviews and queries count as already seen.
insert into public.seen_items (user_id, item_id)
select s.user_id, s.id
from public.exercise_submissions s
where s.reviewed_at is not null
on conflict do nothing;

insert into public.seen_items (user_id, item_id)
select p.id, q.id
from public.support_queries q
cross join public.profiles p
where p.role = 'admin'
on conflict do nothing;
