-- Backfill: ensure every existing auth user has the default lists in their
-- library. The handle_new_user_default_lists trigger only fires on insert,
-- so users created before the trigger existed (e.g. early anon users) end up
-- with an empty Lists tab. Idempotent — safe to re-run.

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
