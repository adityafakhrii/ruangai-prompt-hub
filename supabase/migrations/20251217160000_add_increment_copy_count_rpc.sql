-- Create a secure function to increment copy count
create or replace function public.increment_copy_count(prompt_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.prompts
  set copy_count = coalesce(copy_count, 0) + 1
  where id = prompt_id;
end;
$$;
