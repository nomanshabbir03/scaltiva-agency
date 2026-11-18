-- Attachments on support messages: a list of {path, name} stored in the course-files bucket
-- under submissions/<student id>/support/<query id>/ (readable by that student and admins).
alter table public.support_messages add column files jsonb not null default '[]';
alter table public.support_messages drop constraint support_messages_body_check;
alter table public.support_messages add constraint support_messages_body_check
  check (char_length(body) <= 2000 and (char_length(body) > 0 or jsonb_array_length(files) > 0));
