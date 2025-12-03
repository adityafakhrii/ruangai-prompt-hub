-- Fix 1: Create a SECURITY DEFINER function to properly increment copy_count
-- This bypasses RLS to allow any user to increment the count when copying a prompt
CREATE OR REPLACE FUNCTION public.increment_copy_count(prompt_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE prompts SET copy_count = COALESCE(copy_count, 0) + 1
  WHERE id = prompt_id;
END;
$$;

-- Fix 2: Create a trigger to auto-calculate viral status based on copy_count
-- A prompt becomes viral when it reaches 10+ copies
CREATE OR REPLACE FUNCTION public.update_viral_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-mark as viral if copy_count reaches threshold (10+ copies)
  IF NEW.copy_count >= 10 THEN
    NEW.is_viral := true;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_viral_status ON public.prompts;

-- Create trigger that runs before update
CREATE TRIGGER auto_viral_status
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_viral_status();