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
    minCopyCount?: number;
}) => {
    const {
        isViral,
        orderBy = 'created_at',
        ascending = false,
        limit,
        offset,
        minCopyCount,
    } = options || {};

    let query = supabase
        .from('prompts')
        .select('*')
        .order(orderBy, { ascending });

    if (isViral !== undefined) {
        query = query.eq('is_viral', isViral);
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
export const fetchAllPromptsWithCreator = async (page = 0, pageSize = 12) => {
    return fetchPromptsWithCreator({
        orderBy: 'created_at',
        ascending: false,
        limit: pageSize,
        offset: page * pageSize,
    });
};

/**
 * Extract popular keywords from all prompts
 */
export const fetchPopularKeywords = async (limit = 10): Promise<string[]> => {
    const { data, error } = await supabase
        .from('prompts')
        .select('title, prompt_text, full_prompt');

    if (error || !data) {
        console.error('Error fetching keywords:', error);
        return [];
    }

    // Common stop words to filter out
    const stopWords = new Set([
        'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'ini', 'itu',
        'adalah', 'akan', 'atau', 'juga', 'sudah', 'bisa', 'ada', 'tidak', 'saya',
        'anda', 'kamu', 'dia', 'mereka', 'kita', 'kami', 'nya', 'kan', 'ya', 'lah',
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
        'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
        'through', 'during', 'before', 'after', 'above', 'below', 'between',
        'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
        'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other',
        'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
        'too', 'very', 'just', 'but', 'and', 'or', 'if', 'because', 'as', 'until',
        'while', 'although', 'even', 'though', 'after', 'before', 'since', 'unless',
        'your', 'you', 'this', 'that', 'these', 'those', 'what', 'which', 'who',
        'whom', 'whose', 'it', 'its', 'i', 'me', 'my', 'myself', 'we', 'our',
        'seperti', 'tentang', 'dalam', 'lebih', 'buat', 'sebuah', 'membuat', 'cara',
        'harus', 'tanpa', 'secara', 'sangat', 'jadi', 'saat', 'lalu', 'maka',
    ]);

    // Extract and count words
    const wordCount: Record<string, number> = {};

    data.forEach(prompt => {
        const text = `${prompt.title} ${prompt.prompt_text} ${prompt.full_prompt}`.toLowerCase();
        const words = text.match(/[a-zA-Z\u00C0-\u024F]+/g) || [];

        words.forEach(word => {
            if (word.length >= 4 && !stopWords.has(word)) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
};
