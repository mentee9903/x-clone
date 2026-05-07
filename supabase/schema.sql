-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Posts table
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 280),
  reply_to_id uuid references posts(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- Likes table
create table if not exists likes (
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (user_id, post_id)
);

-- Follows table
create table if not exists follows (
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- Row Level Security
alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table follows enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- Posts policies
create policy "Posts are viewable by everyone" on posts
  for select using (true);

create policy "Authenticated users can create posts" on posts
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own posts" on posts
  for delete using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone" on likes
  for select using (true);

create policy "Authenticated users can like posts" on likes
  for insert with check (auth.uid() = user_id);

create policy "Users can unlike posts" on likes
  for delete using (auth.uid() = user_id);

-- Follows policies
create policy "Follows are viewable by everyone" on follows
  for select using (true);

create policy "Authenticated users can follow" on follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow" on follows
  for delete using (auth.uid() = follower_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
