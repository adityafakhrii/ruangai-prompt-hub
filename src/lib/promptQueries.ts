import { supabase } from '@/integrations/supabase/client';

export interface PromptWithCreator {
    id: string;
    user_id: string;
    title: string;
    category: string;
    prompt_text: string;
    full_prompt: string;
    image_url: string | null;
    copy_count: number;
    is_viral: boolean;
    created_at: string;
    updated_at: string;
    additional_info?: string | null;
    creator_name?: string;
}

/**
 * Fetch prompts with creator information (name only - email is not exposed for privacy)
 */
export const fetchPromptsWithCreator = async (options?: {
    isViral?: boolean;
    orderBy?: 'created_at' | 'copy_count';
    ascending?: boolean;
    limit?: number;
    offset?: number;
}) => {
    const {
        isViral,
        orderBy = 'created_at',
        ascending = false,
        limit,
        offset,
    } = options || {};

    let query = supabase
        .from('prompts')
        .select('*')
        .order(orderBy, { ascending });

    if (isViral !== undefined) {
        query = query.eq('is_viral', isViral);
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

    // Fetch creator names using the secure function for each unique user_id
    const userIds = [...new Set(data?.map(p => p.user_id) || [])];
    const creatorNames: Record<string, string> = {};
    
    // Batch fetch creator names using the secure RPC function
    for (const userId of userIds) {
        const { data: nameData } = await supabase.rpc('get_creator_name', { creator_id: userId });
        creatorNames[userId] = nameData || 'Anonymous';
    }

    // Transform data to include creator name (no email exposed)
    const transformedData = data?.map((prompt) => ({
        ...prompt,
        creator_name: creatorNames[prompt.user_id] || 'Anonymous',
    }));

    return { data: transformedData as PromptWithCreator[], error: null };
};

/**
 * Fetch viral prompts with creator information
 */
export const fetchViralPromptsWithCreator = async (limit = 5) => {
    return fetchPromptsWithCreator({
        isViral: true,
        orderBy: 'created_at',
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
export const fetchAllPromptsWithCreator = async (page = 0, pageSize = 12) => {
    return fetchPromptsWithCreator({
        orderBy: 'created_at',
        ascending: false,
        limit: pageSize,
        offset: page * pageSize,
    });
};
