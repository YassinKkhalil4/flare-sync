
-- Create profiles table to extend auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  name text,
  avatar_url text,
  role text default 'user',
  suspended boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (id)
);

-- Create RLS policy for profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Admins can view all profiles
create policy "Admins can view all profiles" on profiles
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update all profiles
create policy "Admins can update all profiles" on profiles
  for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create conversations table
create table public.conversations (
  id uuid default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  partner_id text not null,
  partner_name text not null,
  partner_avatar text not null,
  partner_type text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (id)
);

-- Create RLS policy for conversations
alter table public.conversations enable row level security;

create policy "Users can view own conversations" on conversations
  for select using (auth.uid() = user_id);

create policy "Users can insert own conversations" on conversations
  for insert with check (auth.uid() = user_id);

create policy "Users can update own conversations" on conversations
  for update using (auth.uid() = user_id);

create policy "Users can delete own conversations" on conversations
  for delete using (auth.uid() = user_id);

-- Admin access to conversations
create policy "Admins can view all conversations" on conversations
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create messages table
create table public.messages (
  id uuid default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null,
  content text not null,
  timestamp timestamp with time zone default now(),
  read boolean default false,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (id)
);

-- Create RLS policy for messages
alter table public.messages enable row level security;

create policy "Users can view own messages" on messages
  for select using (auth.uid() = user_id);

create policy "Users can insert own messages" on messages
  for insert with check (auth.uid() = user_id);

create policy "Users can update own messages" on messages
  for update using (auth.uid() = user_id);

-- Admin access to messages
create policy "Admins can view all messages" on messages
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create social_profiles table
create table public.social_profiles (
  id uuid default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  username text not null,
  profile_url text not null,
  connected boolean default false,
  last_synced timestamp with time zone,
  access_token text,
  refresh_token text,
  followers int,
  posts int,
  engagement numeric(5,2),
  primary key (id),
  unique(user_id, platform)
);

-- Create RLS policy for social_profiles
alter table public.social_profiles enable row level security;

create policy "Users can view own social profiles" on social_profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert own social profiles" on social_profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own social profiles" on social_profiles
  for update using (auth.uid() = user_id);

-- Admin access to social profiles
create policy "Admins can view all social profiles" on social_profiles
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signups
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create initial admin user
insert into auth.users (id, email)
values ('00000000-0000-0000-0000-000000000000', 'admin@example.com');

insert into public.profiles (id, email, name, role)
values ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'Admin User', 'admin');
