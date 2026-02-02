-- Fix trigger function to handle DELETE correctly
CREATE OR REPLACE FUNCTION public.update_prompt_rating_summary()
RETURNS TRIGGER AS $$
DECLARE
    target_prompt_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_prompt_id := OLD.prompt_id;
    ELSE
        target_prompt_id := NEW.prompt_id;
    END IF;

    -- Update the prompt's rating summary
    UPDATE public.prompts
    SET 
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE prompt_id = target_prompt_id),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE prompt_id = target_prompt_id)
    WHERE id = target_prompt_id;
    
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recalculate all ratings to fix currently inconsistent data
DO $$
BEGIN
    UPDATE public.prompts p
    SET 
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews r WHERE r.prompt_id = p.id),
        review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.prompt_id = p.id);
END $$;
