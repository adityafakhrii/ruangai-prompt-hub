-- Fix the profiles table RLS policy to prevent public PII exposure
-- Only allow users to view their own profile data

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Create a secure function to get creator name by user_id (only exposes full_name, not email)
CREATE OR REPLACE FUNCTION public.get_creator_name(creator_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(full_name, 'Anonymous') FROM public.profiles WHERE id = creator_id;
$$;