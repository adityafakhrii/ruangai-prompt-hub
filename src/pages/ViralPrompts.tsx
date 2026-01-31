import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { fetchViralPromptsWithCreator, PromptWithCreator } from "@/lib/promptQueries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptCard from "@/components/PromptCard";
import PromptDetailModal from "@/components/PromptDetailModal";
import LoginModal from "@/components/LoginModal";
import FloatingCTA from "@/components/FloatingCTA";
import SkeletonCard from "@/components/SkeletonCard";
import SEO from "@/components/SEO";

const ViralPrompts = () => {
  const [prompts, setPrompts] = useState<PromptWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<{
    id: string;
    title: string;
    category: string;
    prompt: string;
    fullPrompt: string;
    imageUrl: string;
    copyCount?: number;
    creatorEmail?: string | null;
    averageRating?: number;
    reviewCount?: number;
  } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [copyCount, setCopyCount] = useState(0);

  const { toast } = useToast();
  const { user } = useAuth();
  const { bookmarkedIds, toggleBookmark } = useBookmarks();

  const fetchViralPrompts = useCallback(async () => {
    setLoading(true);

    const { data, error } = await fetchViralPromptsWithCreator(100);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat prompt viral",
        variant: "destructive",
      });
    } else {
      setPrompts(data || []);
    }

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchViralPrompts();
  }, [fetchViralPrompts]);

  const handleCopy = async (promptId: string, fullPrompt: string) => {
    navigator.clipboard.writeText(fullPrompt);

    // Increment copy count using secure RPC function (bypasses RLS)
    await supabase.rpc('increment_copy_count', { prompt_id: promptId });

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
      id: prompt.id,
      title: prompt.title,
      category: prompt.category,
      prompt: prompt.full_prompt,
      fullPrompt: prompt.full_prompt,
      imageUrl: prompt.image_url,
      copyCount: prompt.copy_count,
      creatorEmail: prompt.profiles?.email || null,
      averageRating: prompt.average_rating,
      reviewCount: prompt.review_count,
    });
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Prompt Viral"
        description="Koleksi prompt AI yang sedang viral dan trending saat ini. Dapatkan inspirasi dari prompt populer."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Prompt Viral - RuangAI Prompt Hub",
          "description": "Koleksi prompt AI yang sedang viral dan trending saat ini."
        }}
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Prompt Viral</h1>
          <p className="text-lightText text-sm md:text-lg">
            Prompt paling populer dan banyak dicopy oleh komunitas
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-lightText">Belum ada prompt viral</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                id={prompt.id}
                title={prompt.title}
                category={prompt.category}
                fullPrompt={prompt.full_prompt}
                imageUrl={prompt.image_url}
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
        )}
      </div>

      <Footer />
      <FloatingCTA />

      <PromptDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        prompt={selectedPrompt}
        onCopy={() => selectedPrompt && handleCopy(selectedPrompt.id, selectedPrompt.fullPrompt)}
      />
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </div>
  );
};

export default ViralPrompts;
