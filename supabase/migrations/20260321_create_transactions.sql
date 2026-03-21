create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  checkout_id text not null unique,
  amount numeric not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Users can read their own transactions
create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);
