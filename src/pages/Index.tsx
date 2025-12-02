import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  fetchViralPromptsWithCreator,
  fetchMostCopiedPromptsWithCreator,
  fetchLatestPromptsWithCreator,
  fetchAllPromptsWithCreator,
  PromptWithCreator
} from "@/lib/promptQueries";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import InfoBar from "@/components/InfoBar";
import PromptCard from "@/components/PromptCard";
import PromptSlider from "@/components/PromptSlider";
import SkeletonCard from "@/components/SkeletonCard";
import PromptDetailModal from "@/components/PromptDetailModal";
import LoginModal from "@/components/LoginModal";
import FloatingCTA from "@/components/FloatingCTA";
import Footer from "@/components/Footer";

const Index = () => {
  const [viralPrompts, setViralPrompts] = useState<PromptWithCreator[]>([]);
  const [mostCopiedPrompts, setMostCopiedPrompts] = useState<PromptWithCreator[]>([]);
  const [latestPrompts, setLatestPrompts] = useState<PromptWithCreator[]>([]);
  const [allPrompts, setAllPrompts] = useState<PromptWithCreator[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const [selectedPrompt, setSelectedPrompt] = useState<{
    title: string;
    category: string;
    prompt: string;
    fullPrompt: string;
    imageUrl: string;
    creatorName: string;
  } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [copyCount, setCopyCount] = useState(0);

  const [loadingViral, setLoadingViral] = useState(true);
  const [loadingMostCopied, setLoadingMostCopied] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchViralPrompts();
    fetchMostCopiedPrompts();
    fetchLatestPrompts();
    fetchAllPrompts(0);
  }, []);

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
  }, [hasMore, loadingMore, page]);

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
    const { data, error } = await fetchLatestPromptsWithCreator(6);
    if (!error && data) setLatestPrompts(data);
    setLoadingLatest(false);
  };

  const fetchAllPrompts = async (pageNum: number) => {
    if (pageNum === 0) {
      setAllPrompts([]);
    }

    setLoadingMore(true);
    const pageSize = 12;
    const { data, error } = await fetchAllPromptsWithCreator(pageNum, pageSize);

    if (!error && data) {
      setAllPrompts(prev => pageNum === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === pageSize);
      setPage(pageNum);
    }
    setLoadingMore(false);
  };

  const handleCopy = async (promptId: string, fullPrompt: string) => {
    navigator.clipboard.writeText(fullPrompt);

    // Increment copy count
    const currentPrompt = [...viralPrompts, ...mostCopiedPrompts, ...latestPrompts, ...allPrompts]
      .find(p => p.id === promptId);

    if (currentPrompt) {
      await supabase
        .from("prompts")
        .update({ copy_count: (currentPrompt.copy_count || 0) + 1 })
        .eq("id", promptId);
    }

    toast({
      title: "Prompt disalin!",
      description: "Prompt berhasil disalin ke clipboard.",
    });

    if (!user) {
      const newCount = copyCount + 1;
      setCopyCount(newCount);
      if (newCount >= 3) {
        setIsLoginModalOpen(true);
        setCopyCount(0);
      }
    }
  };

  const handleCardClick = (prompt: PromptWithCreator) => {
    setSelectedPrompt({
      title: prompt.title,
      category: prompt.category,
      prompt: prompt.prompt_text,
      fullPrompt: prompt.full_prompt,
      imageUrl: prompt.image_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
      creatorName: prompt.creator_name,
    });
    setIsDetailModalOpen(true);
  };

  // Filter prompts based on search/category
  const filterPrompts = (promptList: PromptWithCreator[]) => {
    let filtered = [...promptList];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.prompt_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    return filtered;
  };

  const showSections = !searchQuery && !selectedCategory;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <InfoBar />

      {showSections && (
        <>
          {/* Viral Prompts Slider */}
          {loadingViral ? (
            <section className="w-full py-8">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-foreground mb-6">Prompt Viral</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            </section>
          ) : viralPrompts.length > 0 && (
            <PromptSlider
              title="Prompt Viral"
              prompts={viralPrompts}
              onCopy={handleCopy}
              onCardClick={handleCardClick}
              onViewAll={() => navigate('/viral')}
            />
          )}

          {/* Most Copied Slider */}
          {loadingMostCopied ? (
            <section className="w-full py-8">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-foreground mb-6">Paling Banyak Copy</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            </section>
          ) : mostCopiedPrompts.length > 0 && (
            <PromptSlider
              title="Paling Banyak Copy"
              prompts={mostCopiedPrompts}
              onCopy={handleCopy}
              onCardClick={handleCardClick}
            />
          )}

          {/* Latest Prompts Grid */}
          <section className="w-full py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Terbaru</h2>
              {loadingLatest ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latestPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      id={parseInt(prompt.id)}
                      title={prompt.title}
                      category={prompt.category}
                      prompt={prompt.prompt_text}
                      fullPrompt={prompt.full_prompt}
                      imageUrl={prompt.image_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop"}
                      onCopy={() => handleCopy(prompt.id, prompt.full_prompt)}
                      onClick={() => handleCardClick(prompt)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* All Prompts Section with Lazy Loading */}
      <section className="w-full py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {showSections ? "Semua Prompt" : "Hasil Pencarian"}
          </h2>

          {allPrompts.length === 0 && !loadingMore ? (
            <div className="text-center py-20">
              <p className="text-2xl text-lightText">
                {searchQuery || selectedCategory
                  ? "Tidak ada prompt yang sesuai dengan filter"
                  : "Belum ada prompt. Jadilah yang pertama menambahkan!"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterPrompts(allPrompts).map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    id={parseInt(prompt.id)}
                    title={prompt.title}
                    category={prompt.category}
                    prompt={prompt.prompt_text}
                    fullPrompt={prompt.full_prompt}
                    imageUrl={prompt.image_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop"}
                    onCopy={() => handleCopy(prompt.id, prompt.full_prompt)}
                    onClick={() => handleCardClick(prompt)}
                  />
                ))}
              </div>

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
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
        onCopy={() => selectedPrompt && handleCopy("0", selectedPrompt.fullPrompt)}
      />
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </div>
  );
};

export default Index;
