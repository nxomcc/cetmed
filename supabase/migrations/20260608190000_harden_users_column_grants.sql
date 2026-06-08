REVOKE SELECT ON public.users FROM anon, authenticated;

GRANT SELECT (id, username, email, role, blocked, created_at)
ON public.users
TO authenticated;

GRANT INSERT (username, email, role, blocked)
ON public.users
TO authenticated;

GRANT UPDATE (username, email, role, blocked)
ON public.users
TO authenticated;

GRANT DELETE
ON public.users
TO authenticated;
