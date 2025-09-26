-- Users table (Supabase Auth will handle most fields, this is for profile info)
create table users (
  id uuid primary key references auth.users on delete cascade,
  name text,
  email text unique,
  created_at timestamp with time zone default now()
);

-- Events table
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date_time timestamp with time zone not null,
  location text not null,
  capacity int not null,
  is_paid boolean default false,
  image_url text,
  status text check (status in ('pending', 'active', 'rejected')) default 'pending',
  created_by uuid references users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Registrations table
create table registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  status text check (status in ('registered', 'pending_payment', 'approved', 'cancelled')) default 'registered',
  created_at timestamp with time zone default now(),
  unique (event_id, user_id) -- prevent duplicate registrations
);
