-- PHYSQUEST: initial PostgreSQL schema for Supabase
create extension if not exists pgcrypto;

create type public.account_role as enum ('user', 'admin');
create type public.profile_visibility as enum ('public', 'private');
create type public.question_status as enum ('draft', 'published', 'archived');
create type public.question_type as enum ('single', 'multiple', 'image', 'text', 'matching', 'ordering', 'long');
create type public.question_difficulty as enum ('easy', 'medium', 'hard');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique check (char_length(nickname) between 3 and 24),
  avatar_url text,
  visibility public.profile_visibility not null default 'public',
  role public.account_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  chapter_number integer not null unique check (chapter_number > 0),
  title text not null,
  description text,
  medal_name text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.levels (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  level_number integer not null unique check (level_number > 0),
  title text not null,
  is_final_challenge boolean not null default false,
  question_count integer not null default 20 check (question_count > 0),
  pass_percent numeric(5,2) not null default 70 check (pass_percent between 0 and 100),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  question_type public.question_type not null,
  difficulty public.question_difficulty not null,
  points integer not null default 1 check (points > 0),
  content jsonb not null default '{}'::jsonb,
  explanation text,
  status public.question_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Correct answers are deliberately separated from public question content.
create table public.question_keys (
  question_id uuid primary key references public.questions(id) on delete cascade,
  answer jsonb not null,
  grading_rules jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  level_id uuid not null references public.levels(id) on delete restrict,
  attempt_number integer not null default 1 check (attempt_number > 0),
  total_points integer not null default 0,
  earned_points integer not null default 0,
  correct_count integer not null default 0,
  question_count integer not null default 20,
  percent numeric(5,2) not null default 0,
  passed boolean not null default false,
  stars integer not null default 0 check (stars between 0 and 3),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.attempt_questions (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  position integer not null check (position > 0),
  points_snapshot integer not null check (points_snapshot > 0),
  primary key (attempt_id, position),
  unique (attempt_id, question_id)
);

create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  answer jsonb,
  is_correct boolean,
  earned_points integer not null default 0,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create table public.user_level_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  level_id uuid not null references public.levels(id) on delete cascade,
  is_unlocked boolean not null default false,
  best_percent numeric(5,2) not null default 0,
  best_stars integer not null default 0 check (best_stars between 0 and 3),
  completed_at timestamptz,
  primary key (user_id, level_id)
);

create table public.user_chapter_medals (
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  medal_name text not null,
  awarded_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

create table public.hint_usages (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  hint_type text not null check (hint_type in ('fifty_fifty', 'mascot')),
  used_at timestamptz not null default now(),
  unique (attempt_id, hint_type)
);

create index questions_pool_idx on public.questions(status, difficulty, question_type);
create index attempts_user_completed_idx on public.attempts(user_id, completed_at desc);
create index profiles_nickname_idx on public.profiles(nickname);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_nickname text;
begin
  chosen_nickname := coalesce(nullif(new.raw_user_meta_data->>'nickname', ''), 'Игрок' || substr(new.id::text, 1, 8));
  insert into public.profiles (id, nickname)
  values (new.id, chosen_nickname);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.chapters enable row level security;
alter table public.levels enable row level security;
alter table public.questions enable row level security;
alter table public.question_keys enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_questions enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.user_level_progress enable row level security;
alter table public.user_chapter_medals enable row level security;
alter table public.hint_usages enable row level security;

create policy "profiles readable by visibility" on public.profiles
for select using (id = auth.uid() or visibility = 'public' or public.is_admin());
create policy "users update own profile" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid() and role = 'user');
create policy "admins manage profiles" on public.profiles
for all using (public.is_admin()) with check (public.is_admin());

create policy "published chapters readable" on public.chapters
for select using (is_published or public.is_admin());
create policy "admins manage chapters" on public.chapters
for all using (public.is_admin()) with check (public.is_admin());

create policy "published levels readable" on public.levels
for select using (is_published or public.is_admin());
create policy "admins manage levels" on public.levels
for all using (public.is_admin()) with check (public.is_admin());

create policy "published question content readable" on public.questions
for select using (status = 'published' or public.is_admin());
create policy "admins manage questions" on public.questions
for all using (public.is_admin()) with check (public.is_admin());

create policy "only admins read answer keys" on public.question_keys
for select using (public.is_admin());
create policy "admins manage answer keys" on public.question_keys
for all using (public.is_admin()) with check (public.is_admin());

create policy "users read own attempts" on public.attempts
for select using (user_id = auth.uid() or public.is_admin());
create policy "users create own attempts" on public.attempts
for insert with check (user_id = auth.uid());
create policy "users update own attempts" on public.attempts
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins manage attempts" on public.attempts
for all using (public.is_admin()) with check (public.is_admin());

create policy "users read own attempt questions" on public.attempt_questions
for select using (exists (select 1 from public.attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.is_admin())));
create policy "admins manage attempt questions" on public.attempt_questions
for all using (public.is_admin()) with check (public.is_admin());

create policy "users manage own answers" on public.attempt_answers
for all using (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()))
with check (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()));
create policy "admins read answers" on public.attempt_answers
for select using (public.is_admin());

create policy "users read own level progress" on public.user_level_progress
for select using (user_id = auth.uid() or public.is_admin());
create policy "users manage own level progress" on public.user_level_progress
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins manage level progress" on public.user_level_progress
for all using (public.is_admin()) with check (public.is_admin());

create policy "users read own medals" on public.user_chapter_medals
for select using (user_id = auth.uid() or public.is_admin());
create policy "users manage own medals" on public.user_chapter_medals
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins manage medals" on public.user_chapter_medals
for all using (public.is_admin()) with check (public.is_admin());

create policy "users read own hint usage" on public.hint_usages
for select using (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()));
create policy "users manage own hint usage" on public.hint_usages
for all using (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()))
with check (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()));

-- Seed three initial chapters and 60 level nodes. They remain unpublished until configured.
insert into public.chapters (chapter_number, title, description, medal_name)
values
  (1, 'Первые шаги', 'Знакомство с миром PHYSQUEST', 'Медаль первооткрывателя'),
  (2, 'Путь чемпиона', 'Новые испытания и более сложные вопросы', 'Медаль чемпиона'),
  (3, 'На пределе', 'Проверка знаний на новом уровне', 'Медаль мастера')
on conflict (chapter_number) do nothing;

insert into public.levels (chapter_id, level_number, title, is_final_challenge, question_count, pass_percent)
select c.id, n, case when n % 20 = 0 then 'Испытание главы' else 'Уровень ' || n end,
       n % 20 = 0, case when n % 20 = 0 then 10 else 20 end, 70
from generate_series(1, 60) as n
join public.chapters c on c.chapter_number = ((n - 1) / 20) + 1
on conflict (level_number) do nothing;
