-- Re-run the default-lists backfill after the seed updated which lists are
-- flagged is_default. Existing users keep whatever lists they already have;
-- this query only inserts the missing default rows. Idempotent.

insert into public.user_lists (user_id, list_id)
select u.id, l.id
from auth.users u
cross join public.lists l
where l.is_default = true
  and not exists (
    select 1
    from public.user_lists ul
    where ul.user_id = u.id and ul.list_id = l.id
  )
on conflict do nothing;
