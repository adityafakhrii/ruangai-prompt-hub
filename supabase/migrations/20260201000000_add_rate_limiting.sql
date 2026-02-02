-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key text PRIMARY KEY,
    count integer DEFAULT 1,
    window_start timestamptz DEFAULT now()
);

-- Enable RLS (although we will access it via service role mostly, but good practice)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create function to check rate limit
-- Returns true if request is allowed, false if limit exceeded
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    limit_key text,
    limit_count int,
    window_interval interval
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count int;
    current_window_start timestamptz;
BEGIN
    -- Delete old entries (garbage collection - optional, or done periodically)
    -- For simplicity, we just check the specific key here
    
    SELECT count, window_start INTO current_count, current_window_start
    FROM public.rate_limits
    WHERE key = limit_key;

    IF current_window_start IS NULL OR now() > (current_window_start + window_interval) THEN
        -- New window or new key
        INSERT INTO public.rate_limits (key, count, window_start)
        VALUES (limit_key, 1, now())
        ON CONFLICT (key) DO UPDATE
        SET count = 1, window_start = now();
        RETURN true;
    ELSE
        -- Within window
        IF current_count >= limit_count THEN
            RETURN false;
        ELSE
            UPDATE public.rate_limits
            SET count = count + 1
            WHERE key = limit_key;
            RETURN true;
        END IF;
    END IF;
END;
$$;
