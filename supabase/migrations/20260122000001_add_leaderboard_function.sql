CREATE OR REPLACE FUNCTION get_leaderboard(limit_count int default 50)
RETURNS TABLE (
    profiles_id text,
    email text,
    prompt_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.profiles_id,
        pr.email,
        count(p.id) as prompt_count
    FROM public.prompts p
    JOIN public.profiles pr ON p.profiles_id = pr.id
    WHERE p.status = 'verified'
    GROUP BY p.profiles_id, pr.email
    ORDER BY count(p.id) DESC
    LIMIT limit_count;
END;
$$;
