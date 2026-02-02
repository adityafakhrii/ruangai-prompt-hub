-- Function to toggle bookmark (bypass RLS)
CREATE OR REPLACE FUNCTION toggle_bookmark(p_user_id TEXT, p_prompt_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if bookmark exists
    SELECT EXISTS (
        SELECT 1 FROM bookmarks
        WHERE user_id = p_user_id AND prompt_id = p_prompt_id
    ) INTO v_exists;

    IF v_exists THEN
        -- Remove bookmark
        DELETE FROM bookmarks
        WHERE user_id = p_user_id AND prompt_id = p_prompt_id;
        RETURN FALSE; -- Indicates removed
    ELSE
        -- Add bookmark
        INSERT INTO bookmarks (user_id, prompt_id)
        VALUES (p_user_id, p_prompt_id);
        RETURN TRUE; -- Indicates added
    END IF;
END;
$$;

-- Function to submit review (bypass RLS)
CREATE OR REPLACE FUNCTION submit_review(
    p_user_id TEXT,
    p_prompt_id UUID,
    p_rating INTEGER,
    p_comment TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_review_id UUID;
    v_result JSONB;
BEGIN
    -- Check if user already reviewed
    IF EXISTS (
        SELECT 1 FROM reviews
        WHERE user_id = p_user_id AND prompt_id = p_prompt_id
    ) THEN
        -- Update existing review
        UPDATE reviews
        SET rating = p_rating,
            comment = p_comment,
            updated_at = NOW()
        WHERE user_id = p_user_id AND prompt_id = p_prompt_id
        RETURNING id INTO v_review_id;
    ELSE
        -- Insert new review
        INSERT INTO reviews (user_id, prompt_id, rating, comment)
        VALUES (p_user_id, p_prompt_id, p_rating, p_comment)
        RETURNING id INTO v_review_id;
    END IF;

    -- Return the review data
    SELECT jsonb_build_object(
        'id', r.id,
        'user_id', r.user_id,
        'prompt_id', r.prompt_id,
        'rating', r.rating,
        'comment', r.comment,
        'created_at', r.created_at
    ) INTO v_result
    FROM reviews r
    WHERE r.id = v_review_id;

    RETURN v_result;
END;
$$;
