-- 1. Risky: Drop policy if it exists to clean up
drop policy if exists "Allow public insert to leads" on public.leads;

-- 2. Create the policy explicitly for the 'anon' role (public users)
-- This allows anyone (even unauthenticated) to Insert into 'leads'
create policy "Allow public insert to leads"
on public.leads
for insert
to anon
with check (true);

-- 3. Verify RLS is enabled
alter table public.leads enable row level security;
