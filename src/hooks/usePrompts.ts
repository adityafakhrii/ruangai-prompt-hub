import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchViralPromptsWithCreator,
  fetchMostCopiedPromptsWithCreator,
  fetchLatestPromptsWithCreator,
  fetchAllPromptsWithCreator,
  fetchPopularKeywords,
  PromptWithCreator
} from "@/lib/promptQueries";

export const useViralPrompts = (limit = 5) => {
  return useQuery({
    queryKey: ['prompts', 'viral', limit],
    queryFn: async () => {
      const { data, error } = await fetchViralPromptsWithCreator(limit);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMostCopiedPrompts = (limit = 5) => {
  return useQuery({
    queryKey: ['prompts', 'mostCopied', limit],
    queryFn: async () => {
      const { data, error } = await fetchMostCopiedPromptsWithCreator(limit);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLatestPrompts = (limit = 5) => {
  return useQuery({
    queryKey: ['prompts', 'latest', limit],
    queryFn: async () => {
      const { data, error } = await fetchLatestPromptsWithCreator(limit);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAllPrompts = (
  pageSize = 12,
  orderBy: 'created_at' | 'created_at_asc' | 'copy_count' | 'average_rating' = 'created_at',
  searchQuery?: string,
  category?: string
) => {
  return useInfiniteQuery({
    queryKey: ['prompts', 'all', orderBy, pageSize, searchQuery, category],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await fetchAllPromptsWithCreator(pageParam, pageSize, orderBy, searchQuery, category);
      if (error) throw error;
      return data || [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const usePopularKeywords = (limit = 10) => {
  return useQuery({
    queryKey: ['keywords', 'popular', limit],
    queryFn: async () => {
      return await fetchPopularKeywords(limit);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
