-- Create a new storage bucket for prompt images
insert into storage.buckets (id, name, public)
values ('prompt-images', 'prompt-images', true);

-- Policy to allow authenticated users to upload images
create policy "Authenticated users can upload prompt images"
on storage.objects for insert
with check (
  bucket_id = 'prompt-images' and
  auth.role() = 'authenticated'
);

-- Policy to allow public to view images
create policy "Public can view prompt images"
on storage.objects for select
using (
  bucket_id = 'prompt-images'
);

-- Policy to allow users to update their own images
create policy "Users can update their own prompt images"
on storage.objects for update
using (
  bucket_id = 'prompt-images' and
  auth.uid() = owner
);

-- Policy to allow users to delete their own images
create policy "Users can delete their own prompt images"
on storage.objects for delete
using (
  bucket_id = 'prompt-images' and
  auth.uid() = owner
);
