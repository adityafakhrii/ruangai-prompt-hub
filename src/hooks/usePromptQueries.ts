import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
    fetchViralPromptsWithCreator,
    fetchMostCopiedPromptsWithCreator,
    fetchLatestPromptsWithCreator,
    fetchAllPromptsWithCreator,
    fetchPopularKeywords,
    fetchPromptDetail,
    promptKeys,
} from '@/lib/promptQueries';

// Cache configuration - reduces Supabase egress by caching data client-side
// staleTime: How long data is considered "fresh" (no refetch)
// gcTime: How long unused data stays in cache before garbage collection
const STALE_TIME = 5 * 60 * 1000;  // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook untuk fetch viral prompts dengan caching
 */
export const useViralPrompts = (limit = 5) => {
    return useQuery({
        queryKey: promptKeys.viral(),
        queryFn: async () => {
            const result = await fetchViralPromptsWithCreator(limit);
            return result.data || [];
        },
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
};

/**
 * Hook untuk fetch most copied prompts dengan caching
 */
export const useMostCopiedPrompts = (limit = 5) => {
    return useQuery({
        queryKey: promptKeys.mostCopied(),
        queryFn: async () => {
            const result = await fetchMostCopiedPromptsWithCreator(limit);
            return result.data || [];
        },
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
};

/**
 * Hook untuk fetch latest prompts dengan caching
 */
export const useLatestPrompts = (limit = 5) => {
    return useQuery({
        queryKey: promptKeys.latest(),
        queryFn: async () => {
            const result = await fetchLatestPromptsWithCreator(limit);
            return result.data || [];
        },
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
};

/**
 * Hook untuk fetch popular keywords dengan caching
 * Keywords jarang berubah, jadi cache lebih lama
 */
export const usePopularKeywords = (limit = 10) => {
    return useQuery({
        queryKey: promptKeys.keywords(),
        queryFn: () => fetchPopularKeywords(limit),
        staleTime: STALE_TIME * 2,  // 10 minutes
        gcTime: CACHE_TIME * 2,      // 20 minutes
    });
};

/**
 * Hook untuk fetch semua prompts dengan infinite scroll dan caching
 */
export const useAllPromptsInfinite = (pageSize = 12) => {
    return useInfiniteQuery({
        queryKey: [...promptKeys.all, 'infinite'],
        queryFn: async ({ pageParam = 0 }) => {
            const result = await fetchAllPromptsWithCreator(pageParam, pageSize);
            return {
                data: result.data || [],
                nextPage: (result.data?.length === pageSize) ? pageParam + 1 : undefined,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 0,
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
};

/**
 * Hook untuk fetch prompt detail - lazy loading full_prompt
 */
export const usePromptDetail = (promptId: string | null) => {
    return useQuery({
        queryKey: promptKeys.detail(promptId || ''),
        queryFn: async () => {
            if (!promptId) return null;
            const result = await fetchPromptDetail(promptId);
            return result.data;
        },
        enabled: !!promptId, // Only fetch when promptId is provided
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
};

/**
 * Hook untuk fetch viral prompts for dedicated page (larger limit, longer cache)
 */
export const useViralPromptsPage = (limit = 100) => {
    return useQuery({
        queryKey: [...promptKeys.viral(), 'page', limit],
        queryFn: async () => {
            const result = await fetchViralPromptsWithCreator(limit);
            return result.data || [];
        },
        staleTime: STALE_TIME * 2,  // 10 minutes for list pages
        gcTime: CACHE_TIME * 2,
    });
};

/**
 * Hook untuk fetch most copied prompts for dedicated page (larger limit, longer cache)
 */
export const useMostCopiedPromptsPage = (limit = 100) => {
    return useQuery({
        queryKey: [...promptKeys.mostCopied(), 'page', limit],
        queryFn: async () => {
            const result = await fetchMostCopiedPromptsWithCreator(limit);
            return result.data || [];
        },
        staleTime: STALE_TIME * 2,  // 10 minutes for list pages
        gcTime: CACHE_TIME * 2,
    });
};
