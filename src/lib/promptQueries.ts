import { supabase } from '@/integrations/supabase/client';

export interface PromptWithCreator {
    id: string;
    profiles_id: string;
    title: string;
    category: string;
    full_prompt: string;
    image_url: string | null;
    copy_count: number;
    created_at: string;
    updated_at: string;
    additional_info?: string | null;
    creator_name?: string;
    creator_email?: string | null;
    profiles?: { email: string | null } | null;
    status: 'pending' | 'verified' | 'rejected';
    average_rating?: number;
    review_count?: number;
}

/**
 * Fetch prompts with creator information including email from profiles table
 */
export const fetchPromptsWithCreator = async (options?: {
    isViral?: boolean;
    orderBy?: 'created_at' | 'copy_count' | 'average_rating';
    ascending?: boolean;
    limit?: number;
    offset?: number;
    minCopyCount?: number;
    status?: 'pending' | 'verified' | 'rejected' | 'all';
}) => {
    const {
        orderBy = 'created_at',
        ascending = false,
        limit,
        offset,
        minCopyCount,
        status = 'verified', // Default to verified only for public queries
    } = options || {};

    let query = supabase
        .from('prompts')
        .select('*, profiles:profiles_id(email)')
        .order(orderBy, { ascending });

    if (status !== 'all') {
        query = query.eq('status', status);
    }

    if (minCopyCount !== undefined) {
        query = query.gt('copy_count', minCopyCount);
    }

    if (limit) {
        query = query.limit(limit);
    }

    if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching prompts:', error);
        return { data: null, error };
    }

    return { data: data as PromptWithCreator[], error: null };
};

/**
 * Fetch leaderboard data
 */
export const fetchLeaderboard = async (limit = 50) => {
    const { data, error } = await supabase
        .rpc('get_leaderboard', { limit_count: limit });

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return { data: null, error };
    }

    return { data, error: null };
};

/**
 * Fetch viral prompts with creator information
 */
export const fetchViralPromptsWithCreator = async (limit = 5) => {
    // Fallback: Just fetch by copy counts as a proxy for "viral" or just latest
    return fetchPromptsWithCreator({
        // isViral: true, // Removed
        orderBy: 'copy_count',
        ascending: false,
        limit,
    });
};

/**
 * Fetch most copied prompts with creator information
 */
export const fetchMostCopiedPromptsWithCreator = async (limit = 5) => {
    return fetchPromptsWithCreator({
        orderBy: 'copy_count',
        ascending: false,
        limit,
        minCopyCount: 0,
    });
};

/**
 * Fetch latest prompts with creator information
 */
export const fetchLatestPromptsWithCreator = async (limit = 5) => {
    return fetchPromptsWithCreator({
        orderBy: 'created_at',
        ascending: false,
        limit,
    });
};

/**
 * Fetch all prompts with pagination and creator information
 */
export const fetchAllPromptsWithCreator = async (page = 0, pageSize = 12, orderBy: 'created_at' | 'copy_count' | 'average_rating' = 'created_at') => {
    return fetchPromptsWithCreator({
        orderBy: orderBy,
        ascending: false,
        limit: pageSize,
        offset: page * pageSize,
    });
};

/**
 * Fetch popular keywords (categories)
 */
export const fetchPopularKeywords = async (limit = 10) => {
    // This is a simplified implementation. Ideally we would aggregate tags or categories.
    // For now, let's just return distinct categories from the prompts table
    const { data, error } = await supabase
        .from('prompts')
        .select('category')
        .limit(50); // Fetch a sample

    if (error) {
        console.error('Error fetching keywords:', error);
        return [];
    }

    // Count occurrences
    const counts: Record<string, number> = {};
    data.forEach((p) => {
        if (p.category) {
            counts[p.category] = (counts[p.category] || 0) + 1;
        }
    });

    // Sort by count
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([keyword]) => keyword);
};

/**
 * Fetch bookmarked prompts for a specific user
 */
export const fetchBookmarkedPromptsWithCreator = async (userId: string) => {
    const { data, error } = await supabase
        .rpc('get_bookmarked_prompts', { p_user_id: userId });

    if (error) {
        console.error('Error fetching bookmarked prompts:', error);
        return { data: null, error };
    }

    // Transform data to match PromptWithCreator interface
    const formattedData: PromptWithCreator[] = (data || []).map((p: any) => ({
        ...p,
        profiles: { email: p.creator_email }
    }));

    return { data: formattedData, error: null };
};
