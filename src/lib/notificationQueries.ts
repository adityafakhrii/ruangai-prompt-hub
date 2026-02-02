
import { supabase } from '@/integrations/supabase/client';

export interface PromptReviewNotification {
    id: string;
    prompt_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    prompts: {
        title: string;
        image_url: string | null;
    };
    profiles: {
        email: string | null;
    };
}

/**
 * Fetch reviews for prompts created by the current user
 */
export const fetchUserPromptReviews = async (userId: string, limit = 20) => {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            prompts!inner(title, image_url, profiles_id),
            profiles(email)
        `)
        .eq('prompts.profiles_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching user prompt reviews:', error);
        return { data: null, error };
    }

    return { data: data as unknown as PromptReviewNotification[], error: null };
};
