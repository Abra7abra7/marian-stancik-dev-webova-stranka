-- Create a table for storing leads
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  email text not null,
  phone text,
  company text,
  interest text,
  status text default 'new' -- new, contacted, qualified, lost
);

-- Enable RLS
alter table public.leads enable row level security;

-- Create policy to allow inserting leads without authentication (for public website)
-- WARNING: In a strict prod env, you might want a service role or stricter rules, 
-- but for a public landing page agent, public insert is common.
create policy "Allow public insert to leads"
on public.leads
for insert
to anon
with check (true);

-- Create policy to allow reading leads only to authenticated users (Dashboard users)
create policy "Allow authenticated read access"
on public.leads
for select
to authenticated
using (true);

-- Create a table for chat sessions (optional, for logging)
create table if not exists public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_email text, -- can be null if anonymous initially
  metadata jsonb
);

alter table public.chat_sessions enable row level security;

create policy "Allow public insert to chat_sessions"
on public.chat_sessions
for insert
to public
with check (true);
