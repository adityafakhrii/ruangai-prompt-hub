import { supabase } from '@/integrations/supabase/client';

export interface Review {
    id: string;
    prompt_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles?: {
        email: string | null;
    } | null;
}

export const fetchReviews = async (promptId: string) => {
    const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles:user_id(email)')
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return { data: null, error };
    }

    return { data: data as Review[], error: null };
};

export const submitReview = async (promptId: string, rating: number, comment: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: new Error("User not logged in") };
    }

    // Use upsert or rely on RPC if possible, but keeping insert for compatibility if unique constraint exists it will fail
    // Better to use RPC 'submit_review' generally.
    const { data, error } = await supabase
        .from('reviews')
        .insert({
            prompt_id: promptId,
            user_id: user.id,
            rating,
            comment,
        })
        .select()
        .single();

    if (error) {
        console.error('Error submitting review:', error);
        return { data: null, error };
    }

    return { data, error: null };
};

export const getUserReview = async (promptId: string, userId?: string) => {
    let targetUserId = userId;
    
    if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetUserId = user?.id;
    }

    if (!targetUserId) {
        return { data: null, error: null };
    }

    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('prompt_id', promptId)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching user review:', error);
        return { data: null, error };
    }

    return { data, error: null };
};
