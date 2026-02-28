create table if not exists users (
  id uuid primary key,
  email text unique not null,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists files (
  id uuid primary key,
  project_id uuid not null references projects(id) on delete cascade,
  path text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_usage (
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  request_count int not null default 0,
  primary key (user_id, date)
);
