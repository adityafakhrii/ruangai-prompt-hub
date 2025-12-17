-- Add creator_email field and make user_id nullable
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS creator_email text;

-- Make user_id nullable for backwards compatibility
ALTER TABLE public.prompts ALTER COLUMN user_id DROP NOT NULL;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_prompts_creator_email ON public.prompts(creator_email);

-- Update RLS policy for INSERT to allow by email
DROP POLICY IF EXISTS "Authenticated users can insert prompts" ON public.prompts;
CREATE POLICY "Authenticated users can insert prompts"
  ON public.prompts FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'sub')::text = user_id::text
  );

-- Update RLS policy for UPDATE to allow by email
DROP POLICY IF EXISTS "Users can update own prompts" ON public.prompts;
CREATE POLICY "Users can update own prompts"
  ON public.prompts FOR UPDATE
  TO authenticated
  USING (
    creator_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'sub')::text = user_id::text
  );

-- Update RLS policy for DELETE to allow by email
DROP POLICY IF EXISTS "Users can delete own prompts" ON public.prompts;
CREATE POLICY "Users can delete own prompts"
  ON public.prompts FOR DELETE
  TO authenticated
  USING (
    creator_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'sub')::text = user_id::text
  );