-- Create a view for prompt previews with truncated full_prompt
-- This reduces egress by sending only 200 chars instead of full text (can be 1000s of chars)

CREATE OR REPLACE VIEW prompts_preview AS
SELECT 
  id,
  profiles_id,
  title,
  category,
  -- Add '...' at end if prompt is longer than 200 chars
  CASE 
    WHEN LENGTH(full_prompt) > 200 THEN LEFT(full_prompt, 200) || '...'
    ELSE full_prompt
  END as prompt_preview,
  image_url,
  copy_count,
  created_at,
  updated_at,
  additional_info,
  status,
  verified_at,
  verifier_id,
  rejection_reason
FROM prompts;

-- Grant read access to the view (inherits from prompts table RLS)
-- The view will respect the same RLS policies as the underlying table

COMMENT ON VIEW prompts_preview IS 'Optimized view for list displays - contains truncated prompt preview to reduce egress';
