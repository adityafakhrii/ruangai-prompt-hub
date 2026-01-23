-- Function to get user bookmark IDs (for initial state)
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

-- Update get_bookmarked_prompts to fix type mismatch
CREATE OR REPLACE FUNCTION get_bookmarked_prompts(p_user_id TEXT)
RETURNS TABLE (
    id UUID,
    profiles_id TEXT,
    title TEXT,
    category TEXT,
    full_prompt TEXT,
    image_url TEXT,
    copy_count BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    status TEXT,
    additional_info TEXT,
    rejection_reason TEXT,
    verifier_id TEXT,
    verified_at TIMESTAMPTZ,
    average_rating NUMERIC,
    review_count BIGINT,
    creator_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.profiles_id,
        p.title,
        p.category,
        p.full_prompt,
        p.image_url,
        CAST(p.copy_count AS BIGINT),
        p.created_at,
        p.updated_at,
        p.status,
        p.additional_info,
        p.rejection_reason,
        p.verifier_id,
        p.verified_at,
        p.average_rating,
        CAST(p.review_count AS BIGINT),
        pr.email as creator_email
    FROM prompts p
    JOIN bookmarks b ON p.id = b.prompt_id
    LEFT JOIN profiles pr ON p.profiles_id = pr.id
    WHERE b.user_id = p_user_id
    ORDER BY b.created_at DESC;
END;
$$;
