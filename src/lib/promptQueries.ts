import { supabase } from '@/integrations/supabase/client';

// Cache keys for React Query - enables proper caching and invalidation
export const promptKeys = {
    all: ['prompts'] as const,
    viral: () => [...promptKeys.all, 'viral'] as const,
    mostCopied: () => [...promptKeys.all, 'mostCopied'] as const,
    latest: () => [...promptKeys.all, 'latest'] as const,
    paginated: (page: number) => [...promptKeys.all, 'paginated', page] as const,
    detail: (id: string) => [...promptKeys.all, 'detail', id] as const,
    keywords: () => ['keywords'] as const,
};

// Field selection for views
// prompts_preview view contains prompt_preview (first 200 chars) instead of full_prompt
// This reduces egress significantly for list views
const PREVIEW_FIELDS = '*, profiles:profiles_id(email)';
const DETAIL_FIELDS = '*, profiles:profiles_id(email)';

export interface PromptPreview {
    id: string;
    profiles_id: string;
    title: string;
    category: string;
    prompt_preview: string;  // Truncated to 200 chars from the view
    image_url: string | null;
    copy_count: number;
    created_at: string;
    updated_at: string;
    additional_info?: string | null;
    profiles?: { email: string | null } | null;
    status: 'pending' | 'verified' | 'rejected';
}

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
}

/**
 * Fetch prompts from prompts_preview view (with truncated prompt for reduced egress)
 * Uses the view which contains prompt_preview (first 200 chars) instead of full_prompt
 */
export const fetchPromptsWithCreator = async (options?: {
    isViral?: boolean;
    orderBy?: 'created_at' | 'copy_count';
    ascending?: boolean;
    limit?: number;
    offset?: number;
    minCopyCount?: number;
    status?: 'pending' | 'verified' | 'rejected' | 'all';
}): Promise<{ data: PromptPreview[] | null; error: Error | null }> => {
    const {
        orderBy = 'created_at',
        ascending = false,
        limit,
        offset,
        minCopyCount,
        status = 'verified', // Default to verified only for public queries
    } = options || {};

    // Use prompts_preview view for reduced egress (truncated prompt)
    let query = supabase
        .from('prompts_preview')
        .select(PREVIEW_FIELDS)
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

    return { data: data as PromptPreview[], error: null };
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
export const fetchAllPromptsWithCreator = async (page = 0, pageSize = 12) => {
    return fetchPromptsWithCreator({
        orderBy: 'created_at',
        ascending: false,
        limit: pageSize,
        offset: page * pageSize,
    });
};

/**
 * Fetch full prompt detail - only loads full_prompt when needed (lazy loading)
 * This reduces egress by not loading large full_prompt text in list views
 */
export const fetchPromptDetail = async (promptId: string) => {
    const { data, error } = await supabase
        .from('prompts')
        .select(DETAIL_FIELDS)
        .eq('id', promptId)
        .single();

    if (error) {
        console.error('Error fetching prompt detail:', error);
        return { data: null, error };
    }

    return { data: data as PromptWithCreator, error: null };
};

/**
 * Extract popular keywords from all prompts
 * Only fetches titles to minimize egress - full_prompt is expensive
 */
export const fetchPopularKeywords = async (limit = 10): Promise<string[]> => {
    const { data, error } = await supabase
        .from('prompts')
        .select('title')
        .eq('status', 'verified');

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

    // Extract and count words from titles only
    const wordCount: Record<string, number> = {};

    data.forEach(prompt => {
        const text = prompt.title.toLowerCase();
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
