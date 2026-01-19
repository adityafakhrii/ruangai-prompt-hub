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
}

/**
 * Fetch prompts with creator information including email from profiles table
 */
export const fetchPromptsWithCreator = async (options?: {
    isViral?: boolean;
    orderBy?: 'created_at' | 'copy_count';
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
 * Extract popular keywords from all prompts
 */
export const fetchPopularKeywords = async (limit = 10): Promise<string[]> => {
    const { data, error } = await supabase
        .from('prompts')
        .select('title, full_prompt');

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
        const text = `${prompt.title} ${prompt.full_prompt}`.toLowerCase();
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
