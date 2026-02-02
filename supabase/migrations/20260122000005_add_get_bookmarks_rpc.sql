-- Function to get user bookmark IDs (bypass RLS)
CREATE OR REPLACE FUNCTION get_user_bookmark_ids(p_user_id TEXT)
RETURNS TABLE (
    prompt_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT b.prompt_id
    FROM bookmarks b
    WHERE b.user_id = p_user_id;
END;
$$;
