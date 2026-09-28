-- Explola schema for Supabase
-- Run in the SQL editor. Auth users live in auth.users; profiles mirror them.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('traveler', 'operator', 'admin');
create type public.inquiry_status as enum ('draft', 'sent', 'viewed', 'quoted', 'closed');
create type public.listing_status as enum ('draft', 'published', 'review');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'traveler',
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  country text,
  bio text,
  dob date,
  nationality text,
  avatar_url text,
  marketing boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.operators (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  name text not null,
  location text,
  country text,
  established int,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  verified boolean not null default false,
  featured boolean not null default false,
  eco boolean not null default false,
  cover_url text,
  bio text,
  story text,
  team text,
  sustainability text,
  languages text[] not null default '{}',
  response_time text,
  trips_hosted int not null default 0,
  tour_types text[] not null default '{}',
  review_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.operator_credentials (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators (id) on delete cascade,
  name text not null,
  detail text,
  document_url text
);

create table public.destinations (
  id text primary key,
  name text not null,
  country text not null,
  tagline text,
  image_url text,
  description text,
  highlights text[] not null default '{}',
  facts jsonb not null default '{}',
  wildlife text[] not null default '{}',
  parks text[] not null default '{}',
  tips text[] not null default '{}',
  months jsonb not null default '[]',
  events jsonb not null default '[]'
);

create table public.tours (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators (id) on delete cascade,
  title text not null,
  destination_ids text[] not null default '{}',
  parks text[] not null default '{}',
  cover_url text,
  duration_days int not null,
  group_type text not null,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  price_from int not null,
  price_to int not null,
  categories text[] not null default '{}',
  accommodation text,
  description text,
  highlights text[] not null default '{}',
  wildlife text[] not null default '{}',
  difficulty text,
  best_months text[] not null default '{}',
  languages text[] not null default '{}',
  included text[] not null default '{}',
  excluded text[] not null default '{}',
  cancellation text,
  featured boolean not null default false,
  trending boolean not null default false,
  status public.listing_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.tour_days (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  day_number int not null,
  title text not null,
  description text,
  location text,
  stay text,
  meals text,
  activities text,
  image_url text
);

create table public.tour_images (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  url text not null,
  sort int not null default 0
);

create table public.accommodations (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  name text not null,
  type text,
  image_url text,
  note text
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references public.tours (id) on delete cascade,
  operator_id uuid not null references public.operators (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null,
  trip_type text,
  trip_month text,
  helpful int not null default 0,
  reply text,
  verified boolean not null default false,
  pending boolean not null default true,
  recommend boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.review_photos (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  url text not null
);

create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('tour', 'operator')),
  ref_id text not null,
  collection text,
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref_id)
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tour_id uuid references public.tours (id) on delete set null,
  destination_ids text[] not null default '{}',
  flexible boolean not null default true,
  start_date date,
  end_date date,
  length_days int,
  adults int not null default 2,
  children int not null default 0,
  child_ages text,
  traveler_type text,
  accommodation text,
  budget_min int,
  budget_max int,
  interests text[] not null default '{}',
  occasion text,
  needs text,
  message text,
  phone text,
  contact_method text,
  status public.inquiry_status not null default 'sent',
  created_at timestamptz not null default now()
);

create table public.inquiry_operators (
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  operator_id uuid not null references public.operators (id) on delete cascade,
  primary key (inquiry_id, operator_id)
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  operator_id uuid not null references public.operators (id) on delete cascade,
  price int not null,
  inclusions text,
  validity date,
  note text,
  attachment_url text,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references public.inquiries (id) on delete set null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  operator_id uuid not null references public.operators (id) on delete cascade,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_role text not null check (sender_role in ('traveler', 'operator')),
  body text,
  image_url text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.plans (
  id text primary key,
  name text not null,
  monthly_cents int not null,
  yearly_cents int not null,
  listing_limit int not null,
  features text[] not null default '{}'
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id text not null references public.plans (id),
  interval text not null check (interval in ('month', 'year')),
  status text not null default 'active',
  renews_at date,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  question text not null,
  answer text not null,
  sort int not null default 0
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  topic text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.operators enable row level security;
alter table public.operator_credentials enable row level security;
alter table public.destinations enable row level security;
alter table public.tours enable row level security;
alter table public.tour_days enable row level security;
alter table public.tour_images enable row level security;
alter table public.accommodations enable row level security;
alter table public.reviews enable row level security;
alter table public.review_photos enable row level security;
alter table public.saved_items enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_operators enable row level security;
alter table public.quotes enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.faqs enable row level security;
alter table public.support_tickets enable row level security;

create policy "profiles read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);
create policy "public operators" on public.operators for select using (verified = true or owner_id = auth.uid());
create policy "owner updates operator" on public.operators for update using (owner_id = auth.uid());
create policy "owner inserts operator" on public.operators for insert with check (owner_id = auth.uid());
create policy "public destinations" on public.destinations for select using (true);
create policy "public tours" on public.tours for select using (status = 'published' or operator_id in (select id from public.operators where owner_id = auth.uid()));
create policy "operator writes tours" on public.tours for all using (operator_id in (select id from public.operators where owner_id = auth.uid()));
create policy "public days" on public.tour_days for select using (true);
create policy "public images" on public.tour_images for select using (true);
create policy "public stays" on public.accommodations for select using (true);
create policy "public approved reviews" on public.reviews for select using (pending = false or user_id = auth.uid());
create policy "traveler inserts review" on public.reviews for insert with check (user_id = auth.uid());
create policy "saved own" on public.saved_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "inquiries own" on public.inquiries for select using (
  user_id = auth.uid()
  or id in (
    select io.inquiry_id from public.inquiry_operators io
    join public.operators o on o.id = io.operator_id
    where o.owner_id = auth.uid()
  )
);
create policy "traveler inserts inquiry" on public.inquiries for insert with check (user_id = auth.uid());
create policy "traveler updates inquiry" on public.inquiries for update using (user_id = auth.uid());
create policy "quotes visible to parties" on public.quotes for select using (
  inquiry_id in (select id from public.inquiries where user_id = auth.uid())
  or operator_id in (select id from public.operators where owner_id = auth.uid())
);
create policy "operator inserts quote" on public.quotes for insert with check (
  operator_id in (select id from public.operators where owner_id = auth.uid())
);
create policy "conversations parties" on public.conversations for select using (
  user_id = auth.uid() or operator_id in (select id from public.operators where owner_id = auth.uid())
);
create policy "messages parties" on public.messages for select using (
  conversation_id in (
    select id from public.conversations
    where user_id = auth.uid()
      or operator_id in (select id from public.operators where owner_id = auth.uid())
  )
);
create policy "notifications own" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "plans public" on public.plans for select using (true);
create policy "subscription own" on public.subscriptions for select using (user_id = auth.uid());
create policy "faqs public" on public.faqs for select using (true);
create policy "tickets own" on public.support_tickets for all using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('operator-logos', 'operator-logos', true),
  ('tour-images', 'tour-images', true),
  ('review-photos', 'review-photos', true),
  ('documents', 'documents', false)
on conflict (id) do nothing;
