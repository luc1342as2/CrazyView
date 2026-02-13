-- Delete ALL users from your Supabase project
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- https://supabase.com/dashboard/project/_/sql
--
-- WARNING: This permanently removes every user account.
-- Profiles are deleted automatically (cascade).
--
DELETE FROM auth.users;
