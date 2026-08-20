-- Supabase SQL Editor-এ এই SQL একবার চালান।
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  price numeric not null default 0,
  stock integer not null default 0,
  description text default '',
  image_url text default '',
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Public can read products"
on public.products for select
to anon, authenticated
using (true);

create policy "Authenticated admins can insert products"
on public.products for insert
to authenticated
with check (true);

create policy "Authenticated admins can update products"
on public.products for update
to authenticated
using (true) with check (true);

create policy "Authenticated admins can delete products"
on public.products for delete
to authenticated
using (true);

-- Storage bucket:
insert into storage.buckets (id,name,public)
values ('product-images','product-images',true)
on conflict (id) do update set public=true;

create policy "Public can view product images"
on storage.objects for select
to public
using (bucket_id='product-images');

create policy "Authenticated can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id='product-images');

create policy "Authenticated can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id='product-images');
