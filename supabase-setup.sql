-- Run this SQL in your Supabase project: SQL Editor > New Query
-- https://supabase.com/dashboard/project/_/sql
--
-- SETUP REQUIRED:
-- 1. Authentication > Providers > Email: Disable "Confirm email" (so users can log in right after signup)
-- 2. To delete all users and start fresh: run supabase-delete-users.sql

-- Profiles table: stores user data (plan, profiles, etc.)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  name text default 'User',
  plan text default 'standard',
  profiles jsonb default '["Profile 1"]',
  phone text default '',
  two_fa boolean default false,
  two_fa_method text,
  two_fa_value text,
  card_brand text default 'Visa',
  card_last4 text default '4242',
  plan_cancelled boolean default false,
  plan_ends_at date,
  member_since date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, plan, profiles, member_since)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'plan', 'standard'),
    coalesce((new.raw_user_meta_data->'profiles')::jsonb, '["Profile 1"]'),
    current_date
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: users can only read/update their own profile
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Allow insert by the trigger (runs as definer)
drop policy if exists "Allow insert for new users" on public.profiles;
create policy "Allow insert for new users" on public.profiles for insert with check (auth.uid() = id);
