-- Можно запускать повторно. Supabase: SQL Editor > New query > Run
create table if not exists projects(
  id bigint generated always as identity primary key,
  title text not null, tags text[] default '{}', url text, repo text,
  imgs text[] default '{}', desc_ru text, desc_en text, desc_kk text,
  position int default 0, created_at timestamptz default now());
alter table projects enable row level security;

drop policy if exists "public read" on projects;
drop policy if exists "owner write" on projects;
create policy "public read" on projects for select using (true);
create policy "owner write" on projects for all
  using ((auth.jwt()->>'email')='xata4380@gmail.com')
  with check ((auth.jwt()->>'email')='xata4380@gmail.com');

insert into storage.buckets(id,name,public) values('shots','shots',true)
  on conflict (id) do update set public=true;

drop policy if exists "shots public read" on storage.objects;
drop policy if exists "shots owner write" on storage.objects;
create policy "shots public read" on storage.objects for select using (bucket_id='shots');
create policy "shots owner write" on storage.objects for all
  using (bucket_id='shots' and (auth.jwt()->>'email')='xata4380@gmail.com')
  with check (bucket_id='shots' and (auth.jwt()->>'email')='xata4380@gmail.com');
