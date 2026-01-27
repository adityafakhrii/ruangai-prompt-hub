import { ArrowUpDown, Star, Clock, Copy as CopyIcon, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCopyLimit } from "@/hooks/useCopyLimit";
import { useBookmarks } from "@/hooks/useBookmarks";
import {
  fetchViralPromptsWithCreator,
  fetchMostCopiedPromptsWithCreator,
  fetchLatestPromptsWithCreator,
  fetchAllPromptsWithCreator,
  fetchPopularKeywords,
  PromptWithCreator
} from "@/lib/promptQueries";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import InfoBar from "@/components/InfoBar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import PromptCard from "@/components/PromptCard";
import PromptSlider from "@/components/PromptSlider";
import SkeletonCard from "@/components/SkeletonCard";
import PromptDetailModal from "@/components/PromptDetailModal";
import LoginModal from "@/components/LoginModal";
import FloatingCTA from "@/components/FloatingCTA";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  const [viralPrompts, setViralPrompts] = useState<PromptWithCreator[]>([]);
  const [mostCopiedPrompts, setMostCopiedPrompts] = useState<PromptWithCreator[]>([]);
  const [latestPrompts, setLatestPrompts] = useState<PromptWithCreator[]>([]);
  const [allPrompts, setAllPrompts] = useState<PromptWithCreator[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'created_at' | 'created_at_asc' | 'copy_count' | 'average_rating'>('created_at');

  const [selectedPrompt, setSelectedPrompt] = useState<{
    id: string;
    title: string;
    category: string;
    prompt: string;
    fullPrompt: string;
    imageUrl: string;
    additionalInfo?: string;
    copyCount?: number;
    creatorEmail?: string | null;
    averageRating?: number;
    reviewCount?: number;
  } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [loadingViral, setLoadingViral] = useState(true);
  const [loadingMostCopied, setLoadingMostCopied] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    showLoginModal,
    setShowLoginModal,
    incrementCopyCount,
    remainingCopies
  } = useCopyLimit(!!user);

  const { bookmarkedIds, toggleBookmark } = useBookmarks();

  useEffect(() => {
    // Prioritize above-the-fold content
    const loadCritical = async () => {
      await Promise.all([
        fetchViralPrompts(),
        fetchMostCopiedPrompts()
      ]);

      // Load below-the-fold content after critical content
      setTimeout(() => {
        fetchLatestPrompts();
        fetchAllPrompts(0);
        loadKeywords();
      }, 100);
    };

    loadCritical();
  }, []);

  const loadKeywords = async () => {
    const keywords = await fetchPopularKeywords(8);
    setPopularKeywords(keywords);
  };

  // Lazy loading observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchAllPrompts(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, sortBy]); // Added sortBy to dependency

  // Fetch prompts when filters change
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    // Fetch initial page
    fetchAllPrompts(0);
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchViralPrompts = async () => {
    setLoadingViral(true);
    const { data, error } = await fetchViralPromptsWithCreator(5);
    if (!error && data) setViralPrompts(data);
    setLoadingViral(false);
  };

  const fetchMostCopiedPrompts = async () => {
    setLoadingMostCopied(true);
    const { data, error } = await fetchMostCopiedPromptsWithCreator(5);
    if (!error && data) setMostCopiedPrompts(data);
    setLoadingMostCopied(false);
  };

  const fetchLatestPrompts = async () => {
    setLoadingLatest(true);
    const { data, error } = await fetchLatestPromptsWithCreator(5);
    if (!error && data) setLatestPrompts(data);
    setLoadingLatest(false);
  };

  const fetchAllPrompts = async (pageNum: number) => {
    if (pageNum === 0) {
      setAllPrompts([]);
    }

    setLoadingMore(true);
    const pageSize = 12;
    const { data, error } = await fetchAllPromptsWithCreator(pageNum, pageSize, sortBy);

    if (!error && data) {
      setAllPrompts(prev => pageNum === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === pageSize);
      setPage(pageNum);
      if (pageNum === 0) {
        setInitialLoadComplete(true);
      }
    }
    setLoadingMore(false);
  };

  const handleCopy = async (promptId: string, fullPrompt: string) => {
    // Check if user can copy (respects 3-copy limit for non-logged users)
    const canProceed = incrementCopyCount();

    if (!canProceed) {
      toast({
        title: "Batas copy tercapai",
        description: "Silakan login untuk melanjutkan copy prompt.",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(fullPrompt);

    // Increment copy count using secure RPC function (bypasses RLS)
    await supabase.rpc('increment_copy_count', { prompt_id: promptId });

    if (!user && remainingCopies > 0) {
      toast({
        title: "Prompt disalin!",
        description: `Sisa ${remainingCopies - 1} copy gratis. Login untuk copy tanpa batas.`,
      });
    } else {
      toast({
        title: "Prompt disalin!",
        description: "Prompt berhasil disalin ke clipboard.",
      });
    }
  };

  const handleCardClick = (prompt: PromptWithCreator) => {
    setSelectedPrompt({
      id: prompt.id,
      title: prompt.title,
      category: prompt.category,
      prompt: prompt.full_prompt, // Derived from full_prompt
      fullPrompt: prompt.full_prompt,
      imageUrl: prompt.image_url || '',
      additionalInfo: prompt.additional_info || undefined,
      copyCount: prompt.copy_count,
      creatorEmail: prompt.profiles?.email || null,
      averageRating: prompt.average_rating,
      reviewCount: prompt.review_count,
    });
    setIsDetailModalOpen(true);
  };

  // Filter prompts based on search/category
  const filteredPrompts = useMemo(() => {
    let filtered = [...allPrompts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.full_prompt.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    return filtered;
  }, [allPrompts, searchQuery, selectedCategory]);

  const showSections = !searchQuery && !selectedCategory;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Home"
        description="Temukan prompt AI terbaik untuk ChatGPT, Midjourney, dan lainnya. Koleksi prompt viral dan paling banyak dicopy."
        keywords={["prompt AI", "ChatGPT prompts", "Gemini prompts", "Midjourney prompts", "katalog prompt", "prompt gratis", "prompt coding", "prompt marketing"]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "RuangAI Prompt Hub",
          "url": "https://raiprompt.adityafakhri.com",
          "description": "Katalog prompt AI terlengkap untuk ChatGPT, Gemini, dan lainnya.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://raiprompt.adityafakhri.com/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <InfoBar />
      <Navbar />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <AnnouncementBanner />
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        keywords={popularKeywords}
      />

      {showSections && (
        <>
          {/* Most Copied Slider */}
          {loadingMostCopied ? (
            <section className="w-full py-8">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-foreground mb-6">Prompt Viral Paling Banyak Copy</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            </section>
          ) : mostCopiedPrompts.length > 0 && (
            <PromptSlider
              title="Prompt Viral Paling Banyak Copy"
              prompts={mostCopiedPrompts}
              onCopy={handleCopy}
              onCardClick={handleCardClick}
              onViewAll={() => navigate('/paling-banyak-copy')}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {/* Latest Prompts Slider */}
          {loadingLatest ? (
            <section className="w-full py-8">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-foreground mb-6">Terbaru</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            </section>
          ) : latestPrompts.length > 0 && (
            <PromptSlider
              title="Terbaru"
              prompts={latestPrompts}
              onCopy={handleCopy}
              onCardClick={handleCardClick}
              onViewAll={() => {
                const el = document.getElementById('semua-prompt');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              viewAllLabel="Lihat semua"
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
            />
          )}
        </>
      )}

      {/* All Prompts Section with Lazy Loading */}
      <section id="semua-prompt" className="w-full py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-foreground">
              {showSections ? "Semua Prompt" : "Hasil Pencarian"}
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Urutkan: {sortBy === 'created_at' ? 'Terbaru' : sortBy === 'created_at_asc' ? 'Terlama' : sortBy === 'copy_count' ? 'Terpopuler' : 'Rating Tertinggi'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('created_at')}>
                  <Clock className="w-4 h-4 mr-2" />
                  Terbaru
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('created_at_asc')}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Terlama
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('copy_count')}>
                  <CopyIcon className="w-4 h-4 mr-2" />
                  Terpopuler
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('average_rating')}>
                  <Star className="w-4 h-4 mr-2" />
                  Rating Tertinggi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Initial Loading State - prevent flickering */}
          {!initialLoadComplete && allPrompts.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[400px]">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-20 min-h-[200px]">
              <p className="text-2xl text-lightText">
                {searchQuery || selectedCategory
                  ? "Tidak ada prompt yang sesuai dengan filter"
                  : "Belum ada prompt. Jadilah yang pertama menambahkan!"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    category={prompt.category}
                    fullPrompt={prompt.full_prompt}
                    imageUrl={prompt.image_url || ''}
                    additionalInfo={prompt.additional_info || undefined}
                    copyCount={prompt.copy_count}
                    creatorEmail={prompt.profiles?.email || null}
                    status={prompt.status}
                    onCopy={() => handleCopy(prompt.id, prompt.full_prompt)}
                    onClick={() => handleCardClick(prompt)}
                    isBookmarked={bookmarkedIds.has(prompt.id)}
                    onToggleBookmark={(e) => toggleBookmark(prompt.id)}
                    averageRating={prompt.average_rating}
                    reviewCount={prompt.review_count}
                  />
                ))}
              </div>

              {/* Loading More Indicator - only show when paginating */}
              {loadingMore && hasMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-muted-foreground">Memuat lebih banyak...</span>
                </div>
              )}

              {/* Intersection Observer Target */}
              <div ref={observerTarget} className="h-10" />
            </>
          )}
        </div>
      </section>

      <Footer />
      <FloatingCTA />

      {/* Modals */}
      <PromptDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        prompt={selectedPrompt}
        onCopy={() => selectedPrompt && handleCopy(selectedPrompt.id, selectedPrompt.fullPrompt)}
      />
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
    </div>
  );
};

export default Index;
