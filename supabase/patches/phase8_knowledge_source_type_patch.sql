-- Phase 8 repair for existing Supabase Cloud projects.
-- Run once in the hosted Supabase SQL Editor. This preserves rows and RLS.
begin;

alter table public.knowledge_sources
  drop constraint if exists knowledge_sources_source_type_check;

update public.knowledge_sources
set source_type = case source_type
  when 'Website' then 'website'
  when 'PDF' then 'pdf'
  when 'Notion' then 'notion'
  when 'Google Drive' then 'google_drive'
  when 'Internal Docs' then 'internal_docs'
  when 'API Docs' then 'api_docs'
  when 'Database' then 'database'
  when 'Slack' then 'slack'
  when 'GitHub Repo' then 'github_repo'
  -- Normalize values supported by the earlier knowledge-source prototype.
  when 'document' then 'internal_docs'
  when 'api' then 'api_docs'
  when 'repository' then 'github_repo'
  else source_type
end;

alter table public.knowledge_sources
  alter column source_type set default 'website',
  add constraint knowledge_sources_source_type_check
    check (source_type in ('website', 'pdf', 'notion', 'google_drive', 'internal_docs', 'api_docs', 'database', 'slack', 'github_repo'));

alter table public.knowledge_sources
  drop constraint if exists knowledge_sources_status_check;

alter table public.knowledge_sources
  add constraint knowledge_sources_status_check
    check (status in ('active', 'inactive'));

alter table public.knowledge_sources enable row level security;

commit;
