import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchReviews, submitReview, getUserReview, Review } from '@/lib/reviewQueries';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { promptKeys } from '@/lib/promptQueries';

export const useReviews = (promptId: string) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const loadReviews = useCallback(async () => {
        setLoading(true);
        const { data, error } = await fetchReviews(promptId);
        if (error) {
            toast({
                title: "Error",
                description: "Gagal memuat ulasan.",
                variant: "destructive",
            });
        } else {
            setReviews(data || []);
        }
        
        if (user) {
            const { data: userReviewData } = await getUserReview(promptId, user.id);
            setUserReview(userReviewData as Review | null);
        }
        
        setLoading(false);
    }, [promptId, toast, user]);

    const addReview = async (rating: number, comment: string) => {
        if (!user) {
            toast({
                title: "Login diperlukan",
                description: "Silakan login untuk memberikan ulasan.",
                variant: "destructive",
            });
            return false;
        }

        setSubmitting(true);
        
        try {
            const { error } = await supabase.rpc('submit_review', {
                p_user_id: user.id,
                p_prompt_id: promptId,
                p_rating: rating,
                p_comment: comment
            });

            if (error) throw error;

            toast({
                title: "Ulasan terkirim!",
                description: "Terima kasih atas ulasan Anda.",
            });

            // Reload reviews
            await loadReviews();
            
            // Invalidate prompt queries to update rating summary UI
            queryClient.invalidateQueries({ queryKey: promptKeys.detail(promptId) });
            queryClient.invalidateQueries({ queryKey: promptKeys.all });

            setSubmitting(false);
            return true;
        } catch (error) {
            console.error("Error submitting review:", error);
            toast({
                title: "Gagal mengirim ulasan",
                description: error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim ulasan.",
                variant: "destructive",
            });
            setSubmitting(false);
            return false;
        }
    };

    return {
        reviews,
        userReview,
        loading,
        submitting,
        loadReviews,
        addReview
    };
};
