-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor)

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  personality text,
  attachment_style text,
  lifestyle text,
  values text,
  relationship_goals text,
  attraction_profile text,
  humor text,
  dealbreakers text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);
