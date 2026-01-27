import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMostCopiedPromptsPage } from "@/hooks/usePromptQueries";
import { PromptPreview, fetchPromptDetail } from "@/lib/promptQueries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptCard from "@/components/PromptCard";
import PromptDetailModal from "@/components/PromptDetailModal";
import LoginModal from "@/components/LoginModal";
import FloatingCTA from "@/components/FloatingCTA";
import SkeletonCard from "@/components/SkeletonCard";
import SEO from "@/components/SEO";

const MostCopiedPrompts = () => {
  // Use React Query hook with caching
  const { data: prompts = [], isLoading: loading } = useMostCopiedPromptsPage(100);

  const [selectedPrompt, setSelectedPrompt] = useState<{
    id: string;
    title: string;
    category: string;
    prompt: string;
    fullPrompt: string;
    imageUrl: string;
    copyCount?: number;
    creatorEmail?: string | null;
  } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [copyCount, setCopyCount] = useState(0);

  const { toast } = useToast();
  const { user } = useAuth();

  const handleCopy = async (promptId: string, fullPrompt: string) => {
    navigator.clipboard.writeText(fullPrompt);

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

  // Copy handler that fetches full prompt first (since list views only have preview)
  const handleCopyWithFetch = async (prompt: PromptPreview) => {
    const { data } = await fetchPromptDetail(prompt.id);
    if (data) {
      await handleCopy(prompt.id, data.full_prompt);
    }
  };

  const handleCardClick = async (prompt: PromptPreview) => {
    // Lazy load full prompt detail
    const { data } = await fetchPromptDetail(prompt.id);
    if (data) {
      setSelectedPrompt({
        id: prompt.id,
        title: prompt.title,
        category: prompt.category,
        prompt: data.full_prompt,
        fullPrompt: data.full_prompt,
        imageUrl: prompt.image_url || '',
        copyCount: prompt.copy_count,
        creatorEmail: prompt.profiles?.email || null,
      });
    }
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Prompt Paling Banyak Copy"
        description="Daftar prompt AI yang paling banyak disalin dan digunakan oleh komunitas RuangAI."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Prompt Paling Banyak Copy - RuangAI Prompt Hub",
          "description": "Daftar prompt AI yang paling banyak disalin dan digunakan oleh komunitas RuangAI."
        }}
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Prompt Paling Banyak Copy</h1>
          <p className="text-lightText text-lg">
            Prompt dengan jumlah copy tertinggi dari komunitas
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-lightText">Belum ada prompt yang banyak dicopy</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                id={parseInt(prompt.id)}
                title={prompt.title}
                category={prompt.category}
                fullPrompt={prompt.prompt_preview || ''}
                imageUrl={prompt.image_url || ''}
                copyCount={prompt.copy_count}
                creatorEmail={prompt.profiles?.email || null}
                status={prompt.status}
                onCopy={() => handleCopyWithFetch(prompt)}
                onClick={() => handleCardClick(prompt)}
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

export default MostCopiedPrompts;
