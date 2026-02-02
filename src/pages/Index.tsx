import { ArrowUpDown, Star, Clock, Copy as CopyIcon, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, forwardRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/lib/utils";
import { useCopyLimit } from "@/hooks/useCopyLimit";
import { useBookmarks } from "@/hooks/useBookmarks";
import { PromptWithCreator } from "@/lib/promptQueries";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import InfoBar from "@/components/InfoBar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import PromptCard from "@/components/PromptCard";
import PromptSlider from "@/components/PromptSlider";
import SkeletonCard from "@/components/SkeletonCard";
import LoginModal from "@/components/LoginModal";
import FloatingCTA from "@/components/FloatingCTA";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { VirtuosoGrid } from "react-virtuoso";
import {
  useViralPrompts,
  useMostCopiedPrompts,
  useLatestPrompts,
  useAllPrompts,
  usePopularKeywords
} from "@/hooks/usePrompts";

const Index = () => {
  const [sortBy, setSortBy] = useState<'created_at' | 'created_at_asc' | 'copy_count' | 'average_rating'>('created_at');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    showLoginModal,
    setShowLoginModal,
    incrementCopyCount,
    remainingCopies
  } = useCopyLimit(!!user);

  const { bookmarkedIds, toggleBookmark } = useBookmarks();

  // React Query Hooks
  const { data: viralPrompts = [], isLoading: loadingViral } = useViralPrompts();
  const { data: mostCopiedPrompts = [], isLoading: loadingMostCopied } = useMostCopiedPrompts();
  const { data: latestPrompts = [], isLoading: loadingLatest } = useLatestPrompts();
  const { data: popularKeywords = [] } = usePopularKeywords();

  const {
    data: allPromptsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingAll,
    status
  } = useAllPrompts(12, sortBy, searchQuery, selectedCategory);

  const allPrompts = useMemo(() => allPromptsData?.pages.flat() || [], [allPromptsData]);

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
    navigate(`/prompt/${slugify(prompt.title)}`);
  };

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
              prompts={mostCopiedPrompts as any}
              onCopy={(prompt: any) => handleCopy(prompt.id, prompt.full_prompt || prompt.prompt_preview || '')}
              onCardClick={handleCardClick as any}
              onViewAll={() => navigate('/paling-banyak-copy')}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {/* Latest Prompts Slider */}
          {loadingLatest ? (
            <section className="w-full py-8">
              <div className="container mx-auto px-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Terbaru</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            </section>
          ) : latestPrompts.length > 0 && (
            <PromptSlider
              title="Terbaru"
              prompts={latestPrompts as any}
              onCopy={(prompt: any) => handleCopy(prompt.id, prompt.full_prompt || prompt.prompt_preview || '')}
              onCardClick={handleCardClick as any}
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
      <section id="semua-prompt" className="w-full py-8 min-h-[500px]">
        <div className="container mx-auto px-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
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

          {/* Loading State */}
          {loadingAll && allPrompts.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 min-h-[400px]">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : allPrompts.length === 0 ? (
            <div className="text-center py-20 min-h-[200px]">
              <p className="text-2xl text-lightText">
                {searchQuery || selectedCategory
                  ? "Tidak ada prompt yang sesuai dengan filter"
                  : "Belum ada prompt. Jadilah yang pertama menambahkan!"}
              </p>
            </div>
          ) : (
            <VirtuosoGrid
              useWindowScroll
              totalCount={allPrompts.length}
              endReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              overscan={1000}
              components={{
                List: forwardRef<HTMLDivElement, any>(({ style, children, ...props }, ref) => (
                  <div
                    ref={ref}
                    {...props}
                    style={style}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 pb-20"
                  >
                    {children}
                  </div>
                )),
                Item: ({ children, ...props }) => (
                  <div {...props} className="w-full h-full">
                    {children}
                  </div>
                ),
                Footer: () => (
                  <div className="col-span-full flex justify-center py-6 h-20">
                     {isFetchingNextPage && (
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                     )}
                  </div>
                )
              }}
              itemContent={(index) => {
                const prompt = allPrompts[index];
                return (
                  <PromptCard
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    category={prompt.category}
                    fullPrompt={prompt.prompt_preview || prompt.full_prompt || ''}
                    imageUrl={prompt.image_url || ''}
                    additionalInfo={prompt.additional_info || undefined}
                    copyCount={prompt.copy_count}
                    creatorEmail={prompt.profiles?.email || null}
                    onCopy={() => handleCopy(prompt.id, prompt.full_prompt || prompt.prompt_preview || '')}
                    onClick={() => handleCardClick(prompt)}
                    averageRating={prompt.average_rating}
                    reviewCount={prompt.review_count}
                    isBookmarked={bookmarkedIds.has(prompt.id)}
                    onToggleBookmark={() => toggleBookmark(prompt.id)}
                    status={prompt.status}
                    priority={index < 12}
                  />
                );
              }}
            />
          )}
        </div>
      </section>

      <Footer />
      <FloatingCTA />

      {/* Modals */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
    </div>
  );
};

export default Index;
