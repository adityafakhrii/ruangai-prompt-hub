import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useBookmarks = () => {
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            fetchBookmarks();
        } else {
            setBookmarkedIds(new Set());
        }
    }, [user]);

    const fetchBookmarks = async () => {
        if (!user) return;
        
        const { data, error } = await supabase.rpc('get_user_bookmark_ids', {
            p_user_id: user.id
        });
        
        if (error) {
            console.error('Error fetching bookmarks:', error);
            return;
        }

        setBookmarkedIds(new Set((data || []).map((b: { prompt_id: string }) => b.prompt_id)));
    };

    const toggleBookmark = async (promptId: string) => {
        if (!user) {
            toast({
                title: "Login diperlukan",
                description: "Silakan login untuk menyimpan prompt.",
                variant: "destructive",
            });
            return;
        }

        try {
            const { data, error } = await supabase.rpc('toggle_bookmark', {
                p_user_id: user.id,
                p_prompt_id: promptId
            });

            if (error) throw error;

            const isAdded = data as boolean;
            const newSet = new Set(bookmarkedIds);
            
            if (isAdded) {
                newSet.add(promptId);
                toast({ title: "Prompt disimpan ke favorit" });
            } else {
                newSet.delete(promptId);
                toast({ title: "Bookmark dihapus" });
            }
            
            setBookmarkedIds(newSet);
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            toast({ 
                title: "Gagal memproses bookmark", 
                description: error instanceof Error ? error.message : "Terjadi kesalahan",
                variant: "destructive" 
            });
        }
    };

    return { bookmarkedIds, toggleBookmark };
};
