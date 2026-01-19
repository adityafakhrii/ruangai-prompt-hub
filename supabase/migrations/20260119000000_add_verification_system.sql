-- Add role to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'teman_rai' CHECK (role IN ('teman_rai', 'admin'));

-- Add status and verification fields to prompts
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected'));
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS verifier_id text REFERENCES public.profiles(id);
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Drop existing select policy to restrict public access
DROP POLICY IF EXISTS "Prompts are viewable by everyone." ON public.prompts;

-- Create new policies for Prompts

-- 1. Public/Everyone can view VERIFIED prompts
CREATE POLICY "Public can view verified prompts"
ON public.prompts FOR SELECT
USING (status = 'verified');

-- 2. Authors can view their own prompts (regardless of status)
CREATE POLICY "Authors can view own prompts"
ON public.prompts FOR SELECT
USING (auth.uid()::text = profiles_id);

-- 3. Admins can view ALL prompts
CREATE POLICY "Admins can view all prompts"
ON public.prompts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()::text AND role = 'admin'
  )
);

-- 4. Admins can update any prompt (to verify/reject)
CREATE POLICY "Admins can update any prompt"
ON public.prompts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()::text AND role = 'admin'
  )
);

-- Note: Existing policies for Insert/Update/Delete for owners remain valid.
-- "Users can insert their own prompts." -> still valid.
-- "Users can update their own prompts." -> still valid.
-- "Users can delete their own prompts." -> still valid.
