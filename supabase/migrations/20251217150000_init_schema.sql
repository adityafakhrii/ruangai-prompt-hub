-- Enable necessary extensions
create extension if not exists "pgcrypto";

-- Reset Schema (Clean Slate)
drop table if exists public.prompts cascade;
drop table if exists public.profiles cascade;

-- Create profiles table
create table public.profiles (
  id text primary key, -- mapped from jwt user_id
  email text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create prompts table
create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  profiles_id text references public.profiles(id) on delete cascade not null,
  title text not null,
  category text,
  full_prompt text not null,
  additional_info text,
  image_url text,
  copy_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid()::text = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid()::text = id );

-- Policies for prompts
create policy "Prompts are viewable by everyone."
  on public.prompts for select
  using ( true );

create policy "Users can insert their own prompts."
  on public.prompts for insert
  with check ( auth.uid()::text = profiles_id );

create policy "Users can update their own prompts."
  on public.prompts for update
  using ( auth.uid()::text = profiles_id );

create policy "Users can delete their own prompts."
  on public.prompts for delete
  using ( auth.uid()::text = profiles_id );
