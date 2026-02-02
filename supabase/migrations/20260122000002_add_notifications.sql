-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('review', 'system', 'copy_milestone')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Trigger to create notification on new review
CREATE OR REPLACE FUNCTION public.handle_new_review()
RETURNS TRIGGER AS $$
DECLARE
    prompt_owner_id TEXT;
    prompt_title TEXT;
    reviewer_name TEXT;
BEGIN
    -- Get prompt owner and title
    SELECT profiles_id, title INTO prompt_owner_id, prompt_title
    FROM public.prompts
    WHERE id = NEW.prompt_id;

    -- Get reviewer name (email)
    SELECT email INTO reviewer_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Don't notify if reviewing own prompt
    IF prompt_owner_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, type, title, message, link)
        VALUES (
            prompt_owner_id,
            'review',
            'Review Baru',
            'User ' || COALESCE(reviewer_name, 'Seseorang') || ' memberikan review pada prompt "' || prompt_title || '"',
            '/prompt-saya' -- Or specific prompt link
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_review();
