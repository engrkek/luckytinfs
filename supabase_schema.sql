-- ====================================================================
-- LUCKYTIN FAN SUPPORT (LTFS)
-- "FORGOTTEN ISLAND" BLOCK SCREENING DATABASE SCHEMA
-- ====================================================================
-- Description: Run this SQL script in your Supabase SQL Editor to
--              automatically create the required table and configure
--              Row Level Security (RLS) policies for registration inserts.
-- ====================================================================

-- 1. Create registrations table
create table if not exists public.block_screening_registrations (
  id text primary key, -- LTFI-XXX
  full_name text not null,
  nickname text not null,
  email text not null,
  mobile text not null,
  primary_platform text not null,
  primary_username text not null,
  other_platform text,
  other_username text,
  child_registration text not null, -- 'sponsor' or 'bring'
  minor_name text,
  relationship text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create payments table
create table if not exists public.block_screening_payments (
  id text primary key references public.block_screening_registrations(id) on delete cascade,
  payment_mode text not null,
  payment_reference text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.block_screening_registrations enable row level security;
alter table public.block_screening_payments enable row level security;

-- 4. Create public Insert policies (allows anyone to submit registrations and payments)
create policy "Allow public anonymous inserts"
on public.block_screening_registrations
for insert
to anon, authenticated, public
with check (true);

create policy "Allow public anonymous inserts"
on public.block_screening_payments
for insert
to anon, authenticated, public
with check (true);

-- 5. Create Select policies
create policy "Allow public anonymous selects on registrations"
on public.block_screening_registrations
for select
to anon, authenticated, public
using (true);

create policy "Allow authenticated admins to read submissions"
on public.block_screening_registrations
for select
to authenticated
using (true);

create policy "Allow authenticated admins to read payments"
on public.block_screening_payments
for select
to authenticated
using (true);

-- 6. Create public Update policy on payments (allows overwriting / updating payment references in case of user errors)
create policy "Allow public anonymous updates"
on public.block_screening_payments
for update
to anon, authenticated, public
using (true)
with check (true);

-- ====================================================================
-- MIGRATION PATH FOR EXISTING DATABASES
-- ====================================================================
-- If you have already initialized your database using the previous schema,
-- execute the following SQL commands in your Supabase SQL Editor to clean
-- and set up the new dedicated payments table:
--
-- -- A. Revert any added payment columns on the registrations table
-- ALTER TABLE public.block_screening_registrations DROP COLUMN IF EXISTS payment_mode;
-- ALTER TABLE public.block_screening_registrations DROP COLUMN IF EXISTS payment_reference;
-- ALTER TABLE public.block_screening_registrations DROP COLUMN IF EXISTS payment_submitted_at;
--
-- -- B. Create the new dedicated payments table
-- CREATE TABLE IF NOT EXISTS public.block_screening_payments (
--   id text PRIMARY KEY REFERENCES public.block_screening_registrations(id) ON DELETE CASCADE,
--   payment_mode text NOT null,
--   payment_reference text NOT null,
--   created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT null
-- );
--
-- -- C. Enable Row Level Security (RLS)
-- ALTER TABLE public.block_screening_payments ENABLE ROW LEVEL SECURITY;
--
-- -- D. Configure RLS Policies
-- CREATE POLICY "Allow public anonymous inserts" ON public.block_screening_payments FOR INSERT TO anon, authenticated, public WITH CHECK (true);
-- CREATE POLICY "Allow authenticated admins to read payments" ON public.block_screening_payments FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "Allow public anonymous updates" ON public.block_screening_payments FOR UPDATE TO anon, authenticated, public USING (true) WITH CHECK (true);
-- ====================================================================
