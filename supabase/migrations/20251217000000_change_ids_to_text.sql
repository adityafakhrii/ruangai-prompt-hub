-- Migration to support non-UUID user IDs (e.g. from external JWT)

-- 1. Drop function dependent on UUID
DROP FUNCTION IF EXISTS public.get_creator_name(uuid);

-- 2. Drop Foreign Keys that enforce UUID type or reference auth.users
ALTER TABLE public.prompts DROP CONSTRAINT IF EXISTS prompts_user_id_fkey;
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Change ID columns to TEXT
ALTER TABLE public.profiles ALTER COLUMN id TYPE text;
ALTER TABLE public.prompts ALTER COLUMN user_id TYPE text;
ALTER TABLE public.bookmarks ALTER COLUMN user_id TYPE text;

-- 4. Recreate get_creator_name with TEXT parameter
CREATE OR REPLACE FUNCTION public.get_creator_name(creator_id text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(full_name, 'Anonymous') FROM public.profiles WHERE id = creator_id;
$$;

-- 5. Re-add Foreign Keys (Optional but recommended if profiles exist)
-- We only add FK back to profiles, NOT to auth.users (since IDs might not match auth.users anymore)
ALTER TABLE public.prompts ADD CONSTRAINT prompts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.bookmarks ADD CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. Update RLS policies to use auth.jwt() ->> 'sub' instead of auth.uid() (which enforces UUID)

-- Update policies for prompts
DROP POLICY IF EXISTS "Authenticated users can insert prompts" ON public.prompts;
CREATE POLICY "Authenticated users can insert prompts"
  ON public.prompts FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can update own prompts" ON public.prompts;
CREATE POLICY "Users can update own prompts"
  ON public.prompts FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can delete own prompts" ON public.prompts;
CREATE POLICY "Users can delete own prompts"
  ON public.prompts FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- Update policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ((auth.jwt() ->> 'sub') = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = id);

-- Update policies for bookmarks
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);
