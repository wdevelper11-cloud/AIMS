-- AIMS Phase 5 non-destructive patch for an existing Supabase Cloud project.
-- Run in the Supabase Cloud SQL Editor. This file never drops tables or data.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists full_name text;
alter table public.profiles
  add column if not exists role text default 'student';
alter table public.profiles
  add column if not exists created_at timestamptz default now();

-- These additions align older projects tables without changing existing rows.
alter table public.projects
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.projects
  add column if not exists name text;
alter table public.projects
  add column if not exists description text;
alter table public.projects
  add column if not exists created_at timestamptz default now();

create index if not exists projects_owner_id_idx on public.projects(owner_id);

-- Keep database authorization enabled. Existing strict Phase 3 policies are
-- preserved; this patch does not add anonymous or unconditional access.
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
