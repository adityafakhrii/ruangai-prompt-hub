import { supabase } from '@/integrations/supabase/client';
import { slugify } from "./utils";

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
    searchQuery?: string;
    category?: string;
}) => {
    const {
        orderBy = 'created_at',
        ascending = false,
        limit,
        offset,
        minCopyCount,
        status = 'verified', // Default to verified only for public queries
        searchQuery,
        category,
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

    if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,full_prompt.ilike.%${searchQuery}%`);
    }

    if (category) {
        query = query.eq('category', category);
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
export const fetchAllPromptsWithCreator = async (
    page = 0, 
    pageSize = 12, 
    orderBy: 'created_at' | 'created_at_asc' | 'copy_count' | 'average_rating' = 'created_at',
    searchQuery?: string,
    category?: string
) => {
    // Handle ascending sort for created_at_asc
    const actualOrderBy = orderBy === 'created_at_asc' ? 'created_at' : orderBy;
    const ascending = orderBy === 'created_at_asc';

    return fetchPromptsWithCreator({
        orderBy: actualOrderBy,
        ascending: ascending,
        limit: pageSize,
        offset: page * pageSize,
        searchQuery,
        category,
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

/**
 * Fetch a single prompt by ID with creator information
 */
export const fetchPromptById = async (id: string) => {
    const { data, error } = await supabase
        .from('prompts')
        .select('*, profiles:profiles_id(email)')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching prompt by id:', error);
        return { data: null, error };
    }

    return { data: data as PromptWithCreator, error: null };
};

/**
 * Fetch a single prompt by slug (title)
 */
export const fetchPromptBySlug = async (slug: string) => {
    // Strategy: 
    // 1. Try to find prompts that roughly match the slug (replace dashes with wildcards)
    // 2. Filter in JS to find the exact slug match
    // This handles cases where original title has punctuation/special chars that are removed in slug
    
    const potentialTitle = slug.split('-').join('%');
    
    // Fetch candidates (limit to 10 to avoid performance hit, usually we just need 1)
    const { data, error } = await supabase
        .from('prompts')
        .select('*, profiles:profiles_id(email)')
        .ilike('title', `%${potentialTitle}%`)
        .limit(10);

    if (error) {
        console.error('Error fetching prompt by slug:', error);
        return { data: null, error };
    }

    if (!data || data.length === 0) {
        return { data: null, error: null };
    }

    // Find the exact match by re-slugifying the titles
    const exactMatch = data.find(prompt => slugify(prompt.title) === slug);

    // If no exact match found, return the first one (fallback) or null
    // Returning the first one might be safer if the slug algorithm slightly differs
    // but ideally we want exact match. Let's try to be fuzzy if exact fails.
    const result = exactMatch || data[0]; 

    return { data: result as PromptWithCreator, error: null };
};
