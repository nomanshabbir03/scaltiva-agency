-- Contact form submissions (moved from MongoDB).

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  service text not null default 'other'
    check (service in ('development', 'automation', 'seo', 'marketing', 'other')),
  message text not null,
  created_at timestamptz not null default now()
);

-- Only the /api/contact function writes here, using the secret key. RLS with
-- no insert policy means nobody can write directly from the browser; admins
-- can read the messages.
alter table public.contact_messages enable row level security;

create policy "contact_messages_admin_select" on public.contact_messages
  for select using (public.is_admin());
